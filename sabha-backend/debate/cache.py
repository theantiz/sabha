"""
Redis Cache - Cache layer for Sabha responses
"""

import hashlib
import json
import os

try:
    import redis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False

# In-memory fallback cache
_memory_cache = {}
_CACHE_VERSION = "v4"


def _get_redis_client():
    """Get Redis client if available"""
    if not REDIS_AVAILABLE:
        return None
    
    redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    try:
        client = redis.from_url(redis_url)
        client.ping()  # Test connection
        return client
    except:
        return None


def _get_cache_key(question: str) -> str:
    """Generate a cache key from the question"""
    normalized = question.lower().strip()
    return f"sabha:response:{_CACHE_VERSION}:{hashlib.md5(normalized.encode()).hexdigest()}"


def get_cached_response(question: str) -> dict | None:
    """
    Get cached response for a question
    
    Args:
        question: The user's question
    
    Returns:
        Cached response dict or None if not found
    """
    cache_key = _get_cache_key(question)
    
    # Try Redis first
    redis_client = _get_redis_client()
    if redis_client:
        try:
            cached = redis_client.get(cache_key)
            if cached:
                print(f"📦 Redis cache hit for: {cache_key[:30]}...")
                return json.loads(cached)
        except Exception as e:
            print(f"Redis get error: {e}")
    
    # Fall back to memory cache
    if cache_key in _memory_cache:
        print(f"📦 Memory cache hit for: {cache_key[:30]}...")
        return _memory_cache[cache_key]
    
    return None


def cache_response(question: str, response: dict, ttl: int = 3600) -> bool:
    """
    Cache a response for a question
    
    Args:
        question: The user's question
        response: The response dict to cache
        ttl: Time to live in seconds (default 1 hour)
    
    Returns:
        True if cached successfully
    """
    agent_responses = response.get("agent_responses", [])
    if any("[Error" in item.get("content", "") for item in agent_responses):
        return False

    cache_key = _get_cache_key(question)
    
    # Try Redis first
    redis_client = _get_redis_client()
    if redis_client:
        try:
            redis_client.setex(cache_key, ttl, json.dumps(response))
            print(f"💾 Cached to Redis: {cache_key[:30]}...")
            return True
        except Exception as e:
            print(f"Redis set error: {e}")
    
    # Fall back to memory cache
    _memory_cache[cache_key] = response
    print(f"💾 Cached to memory: {cache_key[:30]}...")
    return True


def clear_cache(question: str = None) -> bool:
    """
    Clear cache for a specific question or all cache
    
    Args:
        question: Optional specific question to clear
    
    Returns:
        True if cleared successfully
    """
    global _memory_cache
    
    if question:
        cache_key = _get_cache_key(question)
        redis_client = _get_redis_client()
        if redis_client:
            redis_client.delete(cache_key)
        _memory_cache.pop(cache_key, None)
    else:
        redis_client = _get_redis_client()
        if redis_client:
            # Clear all Sabha keys
            for key in redis_client.scan_iter("sabha:*"):
                redis_client.delete(key)
        _memory_cache = {}
    
    return True
