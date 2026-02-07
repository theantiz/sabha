"""
LLM Gateway - Abstraction layer for different LLM providers.
Supports OpenRouter, Gemini, and DeepSeek (via OpenRouter).
"""

import json
import logging
from typing import Optional
from django.conf import settings

logger = logging.getLogger(__name__)


class LLMGateway:
    """
    Unified interface for calling different LLM providers.
    """
    
    def __init__(self):
        self.openrouter_key = settings.OPENROUTER_API_KEY
        self.gemini_key = settings.GEMINI_API_KEY
    
    def call(
        self,
        provider: str,
        model: str,
        system_prompt: str,
        user_message: str,
        context: Optional[list] = None,
        max_tokens: int = 1024,
        temperature: float = 0.7
    ) -> str:
        """
        Call an LLM with the given parameters.
        
        Args:
            provider: "openrouter", "gemini", or "deepseek"
            model: Model identifier (e.g., "openai/gpt-4o-mini")
            system_prompt: The agent's system prompt
            user_message: The current message to respond to
            context: Previous messages in the conversation
            max_tokens: Maximum response length
            temperature: Creativity parameter (0-1)
        
        Returns:
            The LLM's response text
        """
        if provider == "openrouter":
            return self._call_openrouter(model, system_prompt, user_message, context, max_tokens, temperature)
        elif provider == "gemini":
            return self._call_gemini(model, system_prompt, user_message, context, max_tokens, temperature)
        else:
            raise ValueError(f"Unknown provider: {provider}")
    
    def _call_openrouter(
        self,
        model: str,
        system_prompt: str,
        user_message: str,
        context: Optional[list],
        max_tokens: int,
        temperature: float
    ) -> str:
        """Call OpenRouter API (supports OpenAI, DeepSeek, Anthropic, etc.)"""
        import requests
        
        if not self.openrouter_key:
            raise ValueError("OPENROUTER_API_KEY not set. Please set it in your environment.")
        
        # Build messages array
        messages = [{"role": "system", "content": system_prompt}]
        
        if context:
            for msg in context:
                role = "assistant" if msg.get("role") == "agent" else "user"
                messages.append({
                    "role": role,
                    "content": msg.get("content", "")
                })
        
        messages.append({"role": "user", "content": user_message})
        
        try:
            response = requests.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.openrouter_key}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://sabha.app",  # Your app URL
                    "X-Title": "Sabha AI Parliament"
                },
                json={
                    "model": model,
                    "messages": messages,
                    "max_tokens": max_tokens,
                    "temperature": temperature
                },
                timeout=60
            )
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]
        except requests.RequestException as e:
            logger.error(f"OpenRouter API error: {e}")
            raise
    
    def _call_gemini(
        self,
        model: str,
        system_prompt: str,
        user_message: str,
        context: Optional[list],
        max_tokens: int,
        temperature: float
    ) -> str:
        """Call Google Gemini API"""
        import requests
        
        if not self.gemini_key:
            raise ValueError("GEMINI_API_KEY not set. Please set it in your environment.")
        
        # Build the conversation for Gemini
        contents = []
        
        # Add context messages
        if context:
            for msg in context:
                role = "model" if msg.get("role") == "agent" else "user"
                contents.append({
                    "role": role,
                    "parts": [{"text": msg.get("content", "")}]
                })
        
        # Add current message with system prompt
        full_prompt = f"{system_prompt}\n\nUser topic: {user_message}"
        contents.append({
            "role": "user",
            "parts": [{"text": full_prompt}]
        })
        
        try:
            response = requests.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
                headers={"Content-Type": "application/json"},
                params={"key": self.gemini_key},
                json={
                    "contents": contents,
                    "generationConfig": {
                        "maxOutputTokens": max_tokens,
                        "temperature": temperature
                    }
                },
                timeout=60
            )
            response.raise_for_status()
            data = response.json()
            return data["candidates"][0]["content"]["parts"][0]["text"]
        except requests.RequestException as e:
            logger.error(f"Gemini API error: {e}")
            raise


# Singleton instance
gateway = LLMGateway()
