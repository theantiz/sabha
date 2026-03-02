"""
Orchestrator - Coordinates Sabha council deliberations with parallel execution
"""

from concurrent.futures import ThreadPoolExecutor, as_completed
import hashlib
import json

from debate.models import Agent, Session, Message, ReasoningEntry
from debate.agents.gateway import call_llm, build_context_messages
from debate.agents.registry import get_phase
from debate.cache import get_cached_response, cache_response


def run_council(session_id: int, user_message: str) -> dict:
    """
    Execute a full council deliberation with parallel agent execution
    
    Flow: Sutradhara → [Pramana, Tarkika, Nirdeshaka in PARALLEL] → Sahachara
    
    Args:
        session_id: ID of the session
        user_message: The user's question/topic
    
    Returns:
        Dictionary with session data and agent responses
    """
    session = Session.objects.get(id=session_id)
    
    # Check cache first
    cached = get_cached_response(user_message)
    if cached:
        print(f"⚡ Cache hit! Returning cached response for: {user_message[:50]}...")
        # Save cached messages to this session
        for resp in cached['agent_responses']:
            Message.objects.create(
                session=session,
                role="agent",
                agent_name=resp['agent'],
                phase=resp['phase'],
                content=resp['content']
            )
        session.consensus = cached['consensus']
        session.topic = user_message
        session.status = "completed"
        session.save()
        return {
            "session_id": session.id,
            "topic": user_message,
            "status": "completed",
            "consensus": cached['consensus'],
            "agent_responses": cached['agent_responses'],
            "from_cache": True
        }
    
    # Update session topic if not set
    if not session.topic:
        session.topic = user_message
        session.save()
    
    # Get active agents grouped by execution phase
    all_agents = list(Agent.objects.filter(is_active=True).order_by('order'))
    
    # Group agents: first, parallel middle, last
    first_agent = next((a for a in all_agents if a.name == "Sutradhara"), all_agents[0])
    last_agent = next((a for a in all_agents if a.name == "Sahachara"), all_agents[-1])
    parallel_agents = [a for a in all_agents if a not in [first_agent, last_agent]]
    
    print(f"\n🎯 Starting Sabha council for: {user_message}")
    print(f"📜 Execution plan: {first_agent.name} → [{', '.join(a.name for a in parallel_agents)}] → {last_agent.name}\n")
    
    agent_responses = []
    
    # PHASE 1: Run first agent (Sutradhara - frames the problem)
    print(f"💬 Phase 1: {first_agent.name} ({first_agent.role}) is framing...")
    response = _run_single_agent(session, first_agent)
    agent_responses.append(response)
    print(f"   ✓ {first_agent.name}: {response['content'][:60]}...")
    
    # PHASE 2: Run middle agents in PARALLEL
    print(f"\n⚡ Phase 2: Running {len(parallel_agents)} agents in PARALLEL...")
    parallel_responses = _run_agents_parallel(session, parallel_agents)
    for resp in parallel_responses:
        agent_responses.append(resp)
        print(f"   ✓ {resp['agent']}: {resp['content'][:60]}...")
    
    # PHASE 3: Run last agent (Sahachara - synthesizes)
    print(f"\n💬 Phase 3: {last_agent.name} ({last_agent.role}) is synthesizing...")
    response = _run_single_agent(session, last_agent)
    agent_responses.append(response)
    print(f"   ✓ {last_agent.name}: {response['content'][:60]}...")
    
    # Save consensus and cache the result
    session.consensus = response['content']
    session.status = "completed"
    session.save()
    
    # Cache the response for future identical questions
    cache_response(user_message, {
        "consensus": session.consensus,
        "agent_responses": agent_responses
    })
    
    print(f"\n✅ Council completed in 3 phases. Consensus: {response['content'][:80]}...\n")
    
    return {
        "session_id": session.id,
        "topic": session.topic,
        "status": session.status,
        "consensus": session.consensus,
        "agent_responses": agent_responses,
        "from_cache": False
    }


def _run_single_agent(session, agent) -> dict:
    """Run a single agent and save its response"""
    try:
        messages = build_context_messages(session, agent)
        response = call_llm(
            provider=agent.llm_provider,
            model=agent.llm_model,
            messages=messages
        )
        
        phase = get_phase(agent.name)
        
        # Save message
        Message.objects.create(
            session=session,
            role="agent",
            agent_name=agent.name,
            phase=phase,
            content=response
        )
        
        # Save reasoning
        ReasoningEntry.objects.create(
            session=session,
            agent=agent,
            phase=phase,
            rationale=f"Agent {agent.name} responded in {phase} phase",
            confidence=0.85
        )
        
        return {
            "agent": agent.name,
            "phase": phase,
            "content": response
        }
    except Exception as e:
        error_msg = f"[Error: {str(e)}]"
        Message.objects.create(
            session=session,
            role="system",
            content=f"Error with {agent.name}: {str(e)}"
        )
        return {
            "agent": agent.name,
            "phase": get_phase(agent.name),
            "content": error_msg
        }


def _run_agents_parallel(session, agents) -> list:
    """Run multiple agents in parallel using ThreadPoolExecutor"""
    responses = []
    
    with ThreadPoolExecutor(max_workers=len(agents)) as executor:
        # Submit all agents to run in parallel
        future_to_agent = {
            executor.submit(_call_agent_llm, session, agent): agent 
            for agent in agents
        }
        
        # Collect results as they complete
        for future in as_completed(future_to_agent):
            agent = future_to_agent[future]
            try:
                response = future.result()
                
                # Save message (must be done in main thread for Django ORM)
                phase = get_phase(agent.name)
                Message.objects.create(
                    session=session,
                    role="agent",
                    agent_name=agent.name,
                    phase=phase,
                    content=response
                )
                
                ReasoningEntry.objects.create(
                    session=session,
                    agent=agent,
                    phase=phase,
                    rationale=f"Agent {agent.name} responded in {phase} phase (parallel)",
                    confidence=0.85
                )
                
                responses.append({
                    "agent": agent.name,
                    "phase": phase,
                    "content": response
                })
            except Exception as e:
                responses.append({
                    "agent": agent.name,
                    "phase": get_phase(agent.name),
                    "content": f"[Error: {str(e)}]"
                })
    
    # Sort by agent order to maintain consistent output
    agent_order = {a.name: a.order for a in agents}
    responses.sort(key=lambda x: agent_order.get(x['agent'], 999))
    
    return responses


def _call_agent_llm(session, agent) -> str:
    """Call LLM for an agent (runs in parallel thread)"""
    messages = build_context_messages(session, agent)
    return call_llm(
        provider=agent.llm_provider,
        model=agent.llm_model,
        messages=messages
    )
