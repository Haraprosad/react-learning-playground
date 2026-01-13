"""
Redis client for authentication-safe caching and session management.

Key Principles:
1. Token caching is SAFE (tokens are immutable)
2. User data caching with SHORT TTL (30 seconds)
3. Cache invalidation on critical operations
4. Session tracking for immediate logout
5. Token blacklisting for revocation
"""

import redis.asyncio as redis
import json
import hashlib
import time
from typing import Optional, Any
from datetime import datetime, timedelta
from config import settings
from logger import logger

redis_client: Optional[redis.Redis] = None


async def init_redis():
    """Initialize Redis connection pool"""
    global redis_client
    try:
        redis_client = redis.from_url(
            settings.REDIS_URL,
            max_connections=50,
            encoding="utf-8",
            decode_responses=True,
            socket_connect_timeout=5,
            socket_keepalive=True,
        )
        # Test connection
        await redis_client.ping()
        logger.info("✅ Redis connection initialized successfully")
    except Exception as e:
        logger.error(f"❌ Failed to initialize Redis: {str(e)}")
        redis_client = None


async def close_redis():
    """Close Redis connection"""
    if redis_client:
        await redis_client.close()
        logger.info("❌ Redis connection closed")


# ============================================================================
# TOKEN CACHING - SAFE (Tokens are immutable until expiry)
# ============================================================================

async def cache_token(token: str, decoded_token: dict, ttl: int = 3300):
    """
    Cache decoded Firebase token (SAFE - tokens are immutable).
    
    TTL: 55 minutes (tokens valid for 60 minutes)
    This reduces Firebase API calls by ~95% for active users.
    """
    if not redis_client:
        return
    
    key = f"token:{_hash_token(token)}"
    
    try:
        # Remove sensitive data before caching
        cache_data = {
            "uid": decoded_token.get("uid"),
            "email": decoded_token.get("email"),
            "role": decoded_token.get("role"),
            "db_user_id": decoded_token.get("db_user_id"),
            "exp": decoded_token.get("exp"),
            "cached_at": datetime.utcnow().isoformat()
        }
        
        await redis_client.setex(
            key,
            ttl,
            json.dumps(cache_data)
        )
        logger.debug(f"Token cached for uid: {decoded_token.get('uid')}")
    except Exception as e:
        logger.error(f"Failed to cache token: {e}")


async def get_cached_token(token: str) -> Optional[dict]:
    """Get cached decoded token"""
    if not redis_client:
        return None
    
    key = f"token:{_hash_token(token)}"
    
    try:
        cached = await redis_client.get(key)
        if cached:
            data = json.loads(cached)
            logger.debug(f"Token cache HIT for uid: {data.get('uid')}")
            return data
        logger.debug("Token cache MISS")
    except Exception as e:
        logger.error(f"Failed to get cached token: {e}")
    
    return None


# ============================================================================
# USER DATA CACHING - SHORT TTL (30 seconds for security)
# ============================================================================

async def cache_user(firebase_uid: str, user_data: dict, ttl: int = 30):
    """
    Cache user profile data with SHORT TTL for security.
    
    TTL: 30 seconds - Balance between performance and security
    - Role changes propagate within 30 seconds
    - Reduces database queries significantly
    - Critical operations invalidate immediately
    """
    if not redis_client:
        return
    
    key = f"user:{firebase_uid}"
    
    try:
        # Only cache necessary fields
        cache_data = {
            "firebase_uid": firebase_uid,
            "email": user_data.get("email"),
            "role": user_data.get("role"),
            "name": user_data.get("name"),
            "cached_at": datetime.utcnow().isoformat()
        }
        
        await redis_client.setex(
            key,
            ttl,
            json.dumps(cache_data)
        )
        logger.debug(f"User data cached for uid: {firebase_uid}")
    except Exception as e:
        logger.error(f"Failed to cache user: {e}")


async def get_cached_user(firebase_uid: str) -> Optional[dict]:
    """Get cached user profile"""
    if not redis_client:
        return None
    
    key = f"user:{firebase_uid}"
    
    try:
        cached = await redis_client.get(key)
        if cached:
            data = json.loads(cached)
            logger.debug(f"User cache HIT for uid: {firebase_uid}")
            return data
        logger.debug(f"User cache MISS for uid: {firebase_uid}")
    except Exception as e:
        logger.error(f"Failed to get cached user: {e}")
    
    return None


async def invalidate_user_cache(firebase_uid: str):
    """
    Invalidate user cache immediately (CRITICAL for security).
    
    Call this when:
    - User role changes
    - User is deleted
    - User password changes
    - Any security-critical operation
    """
    if not redis_client:
        return
    
    key = f"user:{firebase_uid}"
    try:
        await redis_client.delete(key)
        logger.info(f"✅ User cache invalidated for uid: {firebase_uid}")
    except Exception as e:
        logger.error(f"Failed to invalidate user cache: {e}")


# ============================================================================
# SESSION MANAGEMENT - For immediate logout
# ============================================================================

async def create_session(
    user_id: str, 
    token: str, 
    device_info: Optional[dict] = None
):
    """
    Create user session for tracking active logins.
    
    Enables:
    - Multi-device login tracking
    - Immediate logout across all devices
    - Security audit trail
    """
    if not redis_client:
        return
    
    session_key = f"session:{user_id}"
    token_hash = _hash_token(token)
    
    session_data = {
        "token_hash": token_hash,
        "device": device_info or {},
        "created_at": datetime.utcnow().isoformat(),
        "last_activity": datetime.utcnow().isoformat()
    }
    
    try:
        # Store as hash to support multiple devices
        await redis_client.hset(
            session_key,
            token_hash,
            json.dumps(session_data)
        )
        
        # Set expiry (match Firebase token expiry)
        await redis_client.expire(session_key, 3600)
        
        logger.debug(f"Session created for user: {user_id}")
    except Exception as e:
        logger.error(f"Failed to create session: {e}")


async def update_session_activity(user_id: str, token: str):
    """Update last activity timestamp for session"""
    if not redis_client:
        return
    
    session_key = f"session:{user_id}"
    token_hash = _hash_token(token)
    
    try:
        # Check if session exists
        session_data = await redis_client.hget(session_key, token_hash)
        if session_data:
            data = json.loads(session_data)
            data["last_activity"] = datetime.utcnow().isoformat()
            
            await redis_client.hset(
                session_key,
                token_hash,
                json.dumps(data)
            )
    except Exception as e:
        logger.error(f"Failed to update session activity: {e}")


async def get_user_sessions(user_id: str) -> list:
    """Get all active sessions for a user"""
    if not redis_client:
        return []
    
    session_key = f"session:{user_id}"
    
    try:
        sessions = await redis_client.hgetall(session_key)
        return [json.loads(data) for data in sessions.values()]
    except Exception as e:
        logger.error(f"Failed to get user sessions: {e}")
        return []


async def revoke_user_sessions(user_id: str):
    """
    Revoke ALL sessions for a user (immediate logout everywhere).
    
    Use cases:
    - User requests logout from all devices
    - Admin suspends user account
    - Password change
    - Security breach detected
    """
    if not redis_client:
        return
    
    session_key = f"session:{user_id}"
    
    try:
        # Get all sessions to blacklist tokens
        sessions = await redis_client.hgetall(session_key)
        
        # Blacklist each token
        blacklist_count = 0
        for token_hash, session_data in sessions.items():
            blacklist_key = f"blacklist:{token_hash}"
            # Blacklist for 1 hour (token expiry time)
            await redis_client.setex(blacklist_key, 3600, "revoked")
            blacklist_count += 1
        
        # Delete session data
        await redis_client.delete(session_key)
        
        # Invalidate user cache
        await invalidate_user_cache(user_id)
        
        logger.info(f"✅ Revoked {blacklist_count} sessions for user {user_id}")
        return blacklist_count
    except Exception as e:
        logger.error(f"Failed to revoke user sessions: {e}")
        return 0

# Alias for better naming consistency
async def revoke_all_sessions(user_id: str):
    """Alias for revoke_user_sessions - revokes all sessions for a user"""
    return await revoke_user_sessions(user_id)


async def revoke_single_session(user_id: str, token: str):
    """Revoke a specific session (logout from current device)"""
    if not redis_client:
        return
    
    session_key = f"session:{user_id}"
    token_hash = _hash_token(token)
    
    try:
        # Remove from sessions
        await redis_client.hdel(session_key, token_hash)
        
        # Blacklist token
        blacklist_key = f"blacklist:{token_hash}"
        await redis_client.setex(blacklist_key, 3600, "revoked")
        
        logger.info(f"✅ Session revoked for user {user_id}")
    except Exception as e:
        logger.error(f"Failed to revoke session: {e}")


async def is_token_blacklisted(token: str) -> bool:
    """
    Check if token is blacklisted (revoked).
    
    CRITICAL: Check this BEFORE serving any authenticated request.
    """
    if not redis_client:
        return False
    
    token_hash = _hash_token(token)
    blacklist_key = f"blacklist:{token_hash}"
    
    try:
        exists = await redis_client.exists(blacklist_key)
        if exists:
            logger.warning(f"⚠️ Blacklisted token attempted access")
        return exists > 0
    except Exception as e:
        logger.error(f"Failed to check blacklist: {e}")
        # Fail closed - deny access if Redis is down
        return True


# ============================================================================
# RATE LIMITING - Per user and per IP
# ============================================================================

async def check_rate_limit(
    key: str, 
    max_requests: int, 
    window_seconds: int
) -> tuple[bool, int]:
    """
    Check rate limit using sliding window counter.
    
    Returns: (is_allowed, remaining_requests)
    """
    if not redis_client:
        return True, max_requests
    
    try:
        current_time = int(time.time())
        window_start = current_time - window_seconds
        
        # Remove old entries outside window
        await redis_client.zremrangebyscore(key, 0, window_start)
        
        # Count requests in current window
        request_count = await redis_client.zcard(key)
        
        if request_count >= max_requests:
            return False, 0
        
        # Add current request
        await redis_client.zadd(key, {str(current_time): current_time})
        await redis_client.expire(key, window_seconds)
        
        remaining = max_requests - request_count - 1
        return True, remaining
    except Exception as e:
        logger.error(f"Failed to check rate limit: {e}")
        # Fail open - allow request if Redis is down
        return True, max_requests


async def get_rate_limit_info(key: str, window_seconds: int) -> dict:
    """Get rate limit information for a key"""
    if not redis_client:
        return {"count": 0, "reset_at": None}
    
    try:
        current_time = int(time.time())
        window_start = current_time - window_seconds
        
        # Clean old entries
        await redis_client.zremrangebyscore(key, 0, window_start)
        
        # Get count
        count = await redis_client.zcard(key)
        
        # Get TTL for reset time
        ttl = await redis_client.ttl(key)
        reset_at = datetime.utcnow() + timedelta(seconds=ttl) if ttl > 0 else None
        
        return {
            "count": count,
            "reset_at": reset_at.isoformat() if reset_at else None
        }
    except Exception as e:
        logger.error(f"Failed to get rate limit info: {e}")
        return {"count": 0, "reset_at": None}


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def _hash_token(token: str) -> str:
    """Hash token for storage (never store raw tokens)"""
    return hashlib.sha256(token.encode()).hexdigest()


async def get_cache_stats() -> dict:
    """Get cache statistics for monitoring"""
    if not redis_client:
        return {"error": "Redis not connected"}
    
    try:
        info = await redis_client.info("stats")
        return {
            "total_connections": info.get("total_connections_received", 0),
            "total_commands": info.get("total_commands_processed", 0),
            "keyspace_hits": info.get("keyspace_hits", 0),
            "keyspace_misses": info.get("keyspace_misses", 0),
            "hit_rate": (
                info.get("keyspace_hits", 0) / 
                (info.get("keyspace_hits", 0) + info.get("keyspace_misses", 1))
            ) * 100
        }
    except Exception as e:
        logger.error(f"Failed to get cache stats: {e}")
        return {"error": str(e)}


async def health_check() -> dict:
    """Check Redis health"""
    if not redis_client:
        return {"status": "disconnected", "error": "Redis client not initialized"}
    
    try:
        await redis_client.ping()
        info = await redis_client.info("server")
        return {
            "status": "healthy",
            "redis_version": info.get("redis_version"),
            "uptime_seconds": info.get("uptime_in_seconds"),
            "connected_clients": info.get("connected_clients")
        }
    except Exception as e:
        logger.error(f"Redis health check failed: {e}")
        return {"status": "unhealthy", "error": str(e)}
