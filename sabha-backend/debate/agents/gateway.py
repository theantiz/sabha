"""
LLM Gateway - Unified interface for multiple LLM providers
"""

import os
import requests
import json
from typing import List, Dict


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


def call_openrouter(model: str, messages: List[Dict], api_key: str = None) -> str:
    """Call OpenRouter API"""
    api_key = api_key or os.getenv("OPENROUTER_API_KEY")
    
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
        return f"[Error calling {model}: {str(e)}]"


def call_gemini(model: str, messages: List[Dict], api_key: str = None) -> str:
    """Call Google Gemini API"""
    api_key = api_key or os.getenv("GEMINI_API_KEY")
    
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
        return f"[Error calling {model}: {str(e)}]"


def call_deepseek(model: str, messages: List[Dict], api_key: str = None) -> str:
    """Call DeepSeek API (OpenAI-compatible)"""
    api_key = api_key or os.getenv("DEEPSEEK_API_KEY")
    
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
    
    return messages
