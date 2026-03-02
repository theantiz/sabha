"""
LLM Gateway - Unified interface for multiple LLM providers
"""

import os
import re
from typing import List, Dict

import requests
from django.conf import settings


def call_llm(provider: str, model: str, messages: List[Dict], api_key: str = None) -> str:
    """
    Route LLM request to appropriate provider
    
    Args:
        provider: "openrouter", "gemini", or "deepseek"
        model: Model identifier
        messages: Conversation history in OpenAI format
        api_key: API key (will use env var if not provided)
    
    Returns:
        Generated text response
    """
    if provider == "openrouter":
        return call_openrouter(model, messages, api_key)
    elif provider == "gemini":
        return call_gemini(model, messages, api_key)
    elif provider == "deepseek":
        return call_deepseek(model, messages, api_key)
    else:
        raise ValueError(f"Unknown provider: {provider}")


def should_use_mock_llm() -> bool:
    """Use local fallback responses in development unless explicitly disabled."""
    override = os.getenv("SABHA_USE_MOCK_LLM")
    if override is not None:
        return override.lower() in {"1", "true", "yes", "on"}
    return bool(getattr(settings, "DEBUG", False))


def _extract_topic(messages: List[Dict]) -> str:
    return next(
        (
            message["content"].replace("Topic for deliberation: ", "").strip()
            for message in messages
            if message["role"] == "user" and "Topic for deliberation:" in message["content"]
        ),
        "the topic",
    )


def _extract_prior_turns(messages: List[Dict]) -> Dict[str, str]:
    prior_turns = {}
    for message in messages:
        content = message.get("content", "")
        if message.get("role") != "assistant" or not content.startswith("["):
            continue
        try:
            header, body = content.split("]: ", 1)
            agent_name = header[1:].split(" - ", 1)[0]
            prior_turns[agent_name] = body
        except ValueError:
            continue
    return prior_turns


def _build_turn_instruction(topic: str, agent_name: str, has_prior_turns: bool) -> str:
    if has_prior_turns:
        return (
            f"Debate this exact topic: {topic}\n"
            f"You are {agent_name}. Respond directly to the topic and engage with the earlier council turns.\n"
            "Use simple English that a non-technical person can understand.\n"
            "Use short, clear sentences.\n"
            "In 2-3 sentences:\n"
            "- state one point you agree with or build on\n"
            "- state one point you challenge, question, or refine\n"
            "- add one new argument about the topic itself\n"
            "Stay on the passed topic only. Do not switch topics, summarize vaguely, or talk about the process."
        )

    return (
        f"Debate this exact topic: {topic}\n"
        f"You are {agent_name}. Open the debate with a direct argument about the topic itself.\n"
        "Use simple English that is easy to understand.\n"
        "Use short, clear sentences.\n"
        "In 2-3 sentences, make a clear claim, explain why it matters, and set up a point other agents can challenge."
    )


def _topic_kind(topic: str) -> str:
    normalized = topic.lower().strip()
    if re.fullmatch(r"\d+\s*[\+\-\*/]\s*\d+\??", normalized):
        return "math"
    if any(token in normalized for token in ["best llm", "best model", "which llm", "which model"]):
        return "llm_comparison"
    if normalized.startswith("should ") or any(
        token in normalized for token in [" ban ", " allow ", " require ", "policy", "legal", "law"]
    ):
        return "policy"
    if normalized.startswith("will ") or any(
        token in normalized for token in ["replace", "take my job", "eat my job", "future of"]
    ):
        return "forecast"
    if any(token in normalized for token in ["best ", "better ", " vs ", "compare ", "comparison"]):
        return "comparison"
    return "general"


def _mock_math_response(topic: str, system_prompt: str) -> str:
    expression = topic.strip().rstrip("?").replace(" ", "")
    try:
        answer = eval(expression, {"__builtins__": {}}, {})
    except Exception:
        answer = None

    if "FRAME the discussion" in system_prompt:
        return f"This is a factual query, not a meaningful debate: the task is simply to evaluate {topic.rstrip('?')} correctly."
    if "provide EVIDENCE" in system_prompt:
        return f"Using standard arithmetic, {topic.rstrip('?')} evaluates to {answer}. There is no competing empirical interpretation in ordinary mathematics."
    if "provide COUNTERPOINTS" in system_prompt:
        return "A counterpoint only exists if someone changes the notation system or the rules, and nothing in the topic suggests that."
    if "create a PLAN" in system_prompt:
        return f"The practical answer is to respond directly with {answer} and avoid pretending a settled arithmetic fact requires deliberation."
    if "create SYNTHESIS" in system_prompt:
        return f"Consensus: {topic.rstrip('?')} = {answer}. This is a direct factual answer, not a contested debate topic."
    return f"{answer}"


def _mock_llm_comparison_response(topic: str, system_prompt: str) -> str:
    if "FRAME the discussion" in system_prompt:
        return (
            f"The phrase '{topic}' has no single universal answer. The debate should compare reasoning quality, coding ability, "
            "latency, cost, context window, multimodal capability, and reliability on the user's actual tasks."
        )
    if "provide EVIDENCE" in system_prompt:
        return (
            "Real-world evaluations usually show different leaders for different jobs: some models are stronger at coding and tool use, "
            "others at long-form analysis or multimodal work, and others at price-performance. Teams get a better answer by testing a short list "
            "on their own prompts than by trusting one benchmark or one marketing claim."
        )
    if "provide COUNTERPOINTS" in system_prompt:
        return (
            "That evidence is useful, but it can still dodge the user's actual need. A model can top benchmarks and still be the wrong choice "
            "if it is too slow, too expensive, too cautious, or too inconsistent for the workflow."
        )
    if "create a PLAN" in system_prompt:
        return (
            f"Turn '{topic}' into a ranking exercise: pick three candidate models, score them on your real tasks, weight the criteria, "
            "and keep separate winners for general chat, coding, and cost-sensitive use."
        )
    if "create SYNTHESIS" in system_prompt:
        return (
            f"Consensus: there is no single best LLM in the abstract. The best choice for '{topic}' depends on whether you value reasoning, "
            "coding, speed, context, multimodality, or price most, so evaluate a short list on your own workload."
        )
    return f"There is no single best answer to '{topic}' without a use case."


def _mock_policy_response(topic: str, system_prompt: str) -> str:
    if "FRAME the discussion" in system_prompt:
        return (
            f"The debate over '{topic}' should identify the real problem, the affected stakeholders, and the tradeoff between effectiveness, "
            "fairness, enforcement cost, and unintended consequences."
        )
    if "provide EVIDENCE" in system_prompt:
        return (
            f"Policy evidence on questions like '{topic}' usually shows that blunt rules can solve one problem quickly but create loopholes, "
            "enforcement burdens, and edge-case harms. Clear goals, narrow scope, and measurable outcomes tend to perform better than slogans."
        )
    if "provide COUNTERPOINTS" in system_prompt:
        return (
            f"That still risks making the policy sound cleaner than it is. If '{topic}' is framed too broadly, the rule may punish compliant cases "
            "while failing to change the behavior that actually caused concern."
        )
    if "create a PLAN" in system_prompt:
        return (
            f"Handle '{topic}' with a limited rule, explicit exceptions, measurable success criteria, and a review date so the decision can be revised "
            "if the costs outweigh the gains."
        )
    if "create SYNTHESIS" in system_prompt:
        return (
            f"Consensus: decide '{topic}' on the concrete harm being addressed, not on rhetoric alone. Prefer a narrow, reviewable policy with explicit goals "
            "instead of an overbroad permanent rule."
        )
    return f"'{topic}' needs a scoped policy analysis."


def _mock_forecast_response(topic: str, system_prompt: str) -> str:
    if "FRAME the discussion" in system_prompt:
        return (
            f"The debate on '{topic}' should separate short-term task disruption from long-term structural change, because those are not the same prediction."
        )
    if "provide EVIDENCE" in system_prompt:
        return (
            f"Historical automation waves usually replace tasks before they replace whole jobs, and adoption is constrained by cost, regulation, trust, "
            f"and workflow redesign. That suggests '{topic}' is likely to be uneven rather than instantaneous."
        )
    if "provide COUNTERPOINTS" in system_prompt:
        return (
            f"That historical analogy can understate speed. If the technology behind '{topic}' improves faster than institutions adapt, disruption can arrive "
            "before workers or employers are ready."
        )
    if "create a PLAN" in system_prompt:
        return (
            f"Treat '{topic}' as a preparedness problem: map vulnerable tasks, build complementary skills, and create fallback paths before disruption forces the decision."
        )
    if "create SYNTHESIS" in system_prompt:
        return (
            f"Consensus: '{topic}' is more likely to reshape jobs than erase entire fields overnight, but the impact can still be severe for exposed roles, "
            "so the practical response is early adaptation rather than denial."
        )
    return f"'{topic}' is best answered as a forecast with uncertainty."


def _mock_general_response(topic: str, system_prompt: str) -> str:
    if "FRAME the discussion" in system_prompt:
        return (
            f"The council should turn '{topic}' into a clear claim, define the decision criteria, and identify what would count as a strong or weak answer."
        )
    if "provide EVIDENCE" in system_prompt:
        return (
            f"A strong answer to '{topic}' should rely on concrete examples, comparable cases, and observable tradeoffs rather than broad assertion."
        )
    if "provide COUNTERPOINTS" in system_prompt:
        return (
            f"The weak spot in many answers to '{topic}' is overconfidence: people often claim certainty before they have clarified assumptions, edge cases, or costs."
        )
    if "create a PLAN" in system_prompt:
        return (
            f"A practical way to answer '{topic}' is to define the criteria first, compare the leading options against them, and make the tradeoff explicit instead of hiding it."
        )
    if "create SYNTHESIS" in system_prompt:
        return (
            f"Consensus: answer '{topic}' by making the criteria explicit, weighing the tradeoffs openly, and choosing the option that best fits the actual goal."
        )
    return f"'{topic}' needs a criteria-based answer."


def mock_llm_response(messages: List[Dict]) -> str:
    """Return a deterministic local response when provider credentials are unavailable."""
    system_prompt = next(
        (message["content"] for message in messages if message["role"] == "system"),
        "",
    )
    topic = _extract_topic(messages)
    prior_turns = _extract_prior_turns(messages)
    if _topic_kind(topic) == "math":
        return _mock_math_response(topic, system_prompt)
    if _topic_kind(topic) == "llm_comparison":
        return _mock_llm_comparison_response(topic, system_prompt)
    if _topic_kind(topic) == "policy":
        return _mock_policy_response(topic, system_prompt)
    if _topic_kind(topic) == "forecast":
        return _mock_forecast_response(topic, system_prompt)
    if _topic_kind(topic) == "comparison":
        return _mock_general_response(topic, system_prompt)
    if prior_turns and "provide COUNTERPOINTS" in system_prompt:
        return (
            f"Earlier turns narrowed the question, but '{topic}' still needs sharper scrutiny around assumptions, costs, and the cases where the preferred answer breaks down."
        )
    if prior_turns and "create a PLAN" in system_prompt:
        return (
            f"Taking the earlier debate on '{topic}' seriously, the next step is to turn the strongest claim into a concrete decision rule with clear tradeoffs and fallback options."
        )
    if prior_turns and "create SYNTHESIS" in system_prompt:
        return (
            f"Consensus: the strongest answer to '{topic}' keeps the useful evidence, addresses the main objections, and makes the final tradeoff explicit."
        )

    return _mock_general_response(topic, system_prompt)


def call_openrouter(model: str, messages: List[Dict], api_key: str = None) -> str:
    """Call OpenRouter API"""
    api_key = api_key or os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        if should_use_mock_llm():
            return mock_llm_response(messages)
        return "[Error: Missing OPENROUTER_API_KEY for OpenRouter requests.]"
    
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    data = {
        "model": model,
        "messages": messages,
        "max_tokens": 500,
        "temperature": 0.7
    }
    
    try:
        response = requests.post(url, headers=headers, json=data, timeout=30)
        response.raise_for_status()
        result = response.json()
        return result["choices"][0]["message"]["content"]
    except Exception as e:
        print(f"OpenRouter error: {e}")
        if should_use_mock_llm():
            return mock_llm_response(messages)
        return f"[Error calling {model}: {str(e)}]"


def call_gemini(model: str, messages: List[Dict], api_key: str = None) -> str:
    """Call Google Gemini API"""
    api_key = api_key or os.getenv("GEMINI_API_KEY")
    if not api_key:
        if should_use_mock_llm():
            return mock_llm_response(messages)
        return "[Error: Missing GEMINI_API_KEY for Gemini requests.]"
    
    # Convert messages to Gemini format
    gemini_messages = []
    for msg in messages:
        role = "user" if msg["role"] in ["user", "system"] else "model"
        gemini_messages.append({
            "role": role,
            "parts": [{"text": msg["content"]}]
        })
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    headers = {"Content-Type": "application/json"}
    
    data = {
        "contents": gemini_messages,
        "generationConfig": {
            "maxOutputTokens": 500,
            "temperature": 0.7
        }
    }
    
    try:
        response = requests.post(url, headers=headers, json=data, timeout=30)
        response.raise_for_status()
        result = response.json()
        return result["candidates"][0]["content"]["parts"][0]["text"]
    except Exception as e:
        print(f"Gemini error: {e}")
        if should_use_mock_llm():
            return mock_llm_response(messages)
        return f"[Error calling {model}: {str(e)}]"


def call_deepseek(model: str, messages: List[Dict], api_key: str = None) -> str:
    """Call DeepSeek API (OpenAI-compatible)"""
    api_key = api_key or os.getenv("DEEPSEEK_API_KEY")
    if not api_key:
        if should_use_mock_llm():
            return mock_llm_response(messages)
        return "[Error: Missing DEEPSEEK_API_KEY for DeepSeek requests.]"
    
    url = "https://api.deepseek.com/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    data = {
        "model": model,
        "messages": messages,
        "max_tokens": 500,
        "temperature": 0.7
    }
    
    try:
        response = requests.post(url, headers=headers, json=data, timeout=30)
        response.raise_for_status()
        result = response.json()
        return result["choices"][0]["message"]["content"]
    except Exception as e:
        print(f"DeepSeek error: {e}")
        if should_use_mock_llm():
            return mock_llm_response(messages)
        return f"[Error calling {model}: {str(e)}]"


def build_context_messages(session, agent) -> List[Dict]:
    """
    Build conversation context for an agent
    
    Args:
        session: Session object
        agent: Agent object
    
    Returns:
        List of messages in OpenAI format
    """
    messages = [
        {"role": "system", "content": agent.system_prompt}
    ]
    
    # Add topic if available
    if session.topic:
        messages.append({
            "role": "user",
            "content": f"Topic for deliberation: {session.topic}"
        })
    
    # Add previous agent messages as context
    previous_messages = session.messages.filter(role="agent").order_by("created_at")
    for msg in previous_messages:
        messages.append({
            "role": "assistant",
            "content": f"[{msg.agent_name} - {msg.phase}]: {msg.content}"
        })

    if previous_messages.exists():
        messages.append({
            "role": "user",
            "content": _build_turn_instruction(session.topic or "the topic", agent.name, True)
        })
    else:
        messages.append({
            "role": "user",
            "content": _build_turn_instruction(session.topic or "the topic", agent.name, False)
        })
    
    return messages
