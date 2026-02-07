"""
Orchestrator - Manages the Sabha council deliberation flow.
Implements the यज्ञ (Yajna) ritual-inspired architecture:
- आवाहनम् (Invocation): Receives query, selects agents
- संवाद (Dialogue): Agents exchange views in rounds
- अर्पणम् (Offering): Log reasoning to ledger
- संनिधानम् (Resolution): Generate consensus
"""

import logging
from typing import List
from ..models import Agent, Session, Message, ReasoningEntry
from .registry import DEFAULT_AGENTS
from .gateway import gateway

logger = logging.getLogger(__name__)


class Orchestrator:
    """
    The Sabha council orchestrator.
    Manages the flow of deliberation between AI agents.
    """
    
    def __init__(self):
        self.gateway = gateway
    
    def run_council(self, session: Session, topic: str) -> None:
        """
        Run a full Sabha council deliberation.
        
        Args:
            session: The Session object to add messages to
            topic: The user's topic/question for discussion
        """
        session.status = "in_progress"
        session.save()
        
        # Ensure agents exist in database
        self._ensure_agents_exist()
        
        # Get active agents in order
        agents = Agent.objects.filter(is_active=True).order_by('order')
        
        if not agents.exists():
            logger.error("No active agents found!")
            session.status = "failed"
            session.save()
            return
        
        # Build context from existing messages
        context = self._build_context(session)
        
        # Phase mapping based on agent order
        phases = ["framing", "evidence", "counterpoint", "plan", "synthesis"]
        
        # Run each agent in sequence
        consensus = None
        for i, agent in enumerate(agents):
            phase = phases[i] if i < len(phases) else "discussion"
            
            try:
                response = self._call_agent(agent, topic, context, phase)
                
                # Create message
                message = Message.objects.create(
                    session=session,
                    role="agent",
                    agent=agent,
                    agent_name=agent.name,
                    phase=phase,
                    content=response
                )
                
                # Log to reasoning ledger
                ReasoningEntry.objects.create(
                    session=session,
                    agent=agent,
                    message=message,
                    phase=phase,
                    rationale=response,
                    objections=[],
                    evidence=[],
                    confidence=0.8
                )
                
                # Add to context for next agent
                context.append({
                    "role": "agent",
                    "agent_name": agent.name,
                    "content": response
                })
                
                # Keep last response as potential consensus
                if phase == "synthesis":
                    consensus = response
                    
            except Exception as e:
                logger.error(f"Agent {agent.name} failed: {e}")
                Message.objects.create(
                    session=session,
                    role="system",
                    content=f"Agent {agent.name} encountered an error: {str(e)}"
                )
        
        # Update session with consensus
        if consensus:
            session.consensus = consensus
        session.status = "completed"
        session.save()
    
    def _ensure_agents_exist(self) -> None:
        """Ensure all default agents exist in the database."""
        for agent_config in DEFAULT_AGENTS:
            Agent.objects.update_or_create(
                name=agent_config["name"],
                defaults={
                    "role": agent_config["role"],
                    "tone": agent_config["tone"],
                    "order": agent_config["order"],
                    "llm_provider": agent_config["llm_provider"],
                    "llm_model": agent_config["llm_model"],
                    "system_prompt": agent_config["system_prompt"],
                    "is_active": True
                }
            )
    
    def _build_context(self, session: Session) -> List[dict]:
        """Build conversation context from existing messages."""
        messages = session.messages.all()
        return [
            {
                "role": msg.role,
                "agent_name": msg.agent_name,
                "content": msg.content
            }
            for msg in messages
        ]
    
    def _call_agent(
        self,
        agent: Agent,
        topic: str,
        context: List[dict],
        phase: str
    ) -> str:
        """
        Call an individual agent for their response.
        
        Args:
            agent: The Agent to call
            topic: The discussion topic
            context: Previous messages in the conversation
            phase: Current discussion phase
        
        Returns:
            The agent's response text
        """
        # Build a summary of previous responses for context
        context_summary = ""
        if context:
            agent_responses = [
                f"{msg['agent_name']}: {msg['content']}"
                for msg in context
                if msg['role'] == 'agent'
            ]
            if agent_responses:
                context_summary = "\n\nPrevious council responses:\n" + "\n\n".join(agent_responses)
        
        user_message = f"Topic for discussion: {topic}{context_summary}"
        
        return self.gateway.call(
            provider=agent.llm_provider,
            model=agent.llm_model,
            system_prompt=agent.system_prompt,
            user_message=user_message,
            context=[],  # We include context in user_message for clarity
            max_tokens=800,
            temperature=0.7
        )
