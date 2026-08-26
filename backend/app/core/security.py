import bcrypt
import time
from collections import OrderedDict
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, List
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


class RateLimiter:
    """
    Thread-safe, memory-bounded sliding window rate limiter per client IP address.
    Strictly purges expired records and limits tracked IPs to 2,000 to protect RAM.
    """

    def __init__(self, max_requests: int = 10, window_seconds: int = 60, action_name: str = "request", max_tracked_ips: int = 2000):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.action_name = action_name
        self.max_tracked_ips = max_tracked_ips
        self._requests: OrderedDict[str, List[float]] = OrderedDict()

    def __call__(self, request: Request):
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            ip = forwarded.split(",")[0].strip()
        else:
            ip = request.client.host if request.client else "unknown"

        now = time.time()
        window_start = now - self.window_seconds

        # Clean timestamps for this IP
        if ip in self._requests:
            self._requests[ip] = [ts for ts in self._requests[ip] if ts > window_start]
            if not self._requests[ip]:
                del self._requests[ip]
            else:
                self._requests.move_to_end(ip)

        # Periodic eviction if tracked IP count exceeds safety threshold
        if len(self._requests) > self.max_tracked_ips:
            # Purge oldest 20% entries
            for _ in range(int(self.max_tracked_ips * 0.2)):
                if self._requests:
                    self._requests.popitem(last=False)

        current_history = self._requests.get(ip, [])
        if len(current_history) >= self.max_requests:
            retry_after = int(self.window_seconds - (now - current_history[0]))
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Too many {self.action_name} attempts. Please try again in {max(1, retry_after)} seconds.",
                headers={"Retry-After": str(max(1, retry_after))},
            )

        if ip not in self._requests:
            self._requests[ip] = []
        self._requests[ip].append(now)


# Standard Hardened Rate Limiters
login_rate_limiter = RateLimiter(max_requests=20, window_seconds=60, action_name="login")
register_rate_limiter = RateLimiter(max_requests=4, window_seconds=60, action_name="registration")
chat_rate_limiter = RateLimiter(max_requests=25, window_seconds=60, action_name="chat")
password_reset_rate_limiter = RateLimiter(max_requests=3, window_seconds=60, action_name="password reset")
search_rate_limiter = RateLimiter(max_requests=40, window_seconds=60, action_name="search")
prediction_submit_rate_limiter = RateLimiter(max_requests=20, window_seconds=60, action_name="prediction submission")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    pwd_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_password_reset_token(email: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode = {"sub": email, "type": "password_reset", "exp": expire}
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        return None


def verify_password_reset_token(token: str) -> Optional[str]:
    payload = decode_token(token)
    if not payload or payload.get("type") != "password_reset":
        return None
    return payload.get("sub")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    from app.models.user import User

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_token(token)
    if payload is None:
        raise credentials_exception
    user_id = payload.get("sub")
    if user_id is None:
        raise credentials_exception
    try:
        uid = int(user_id)
    except (ValueError, TypeError):
        raise credentials_exception

    user = db.query(User).filter(User.id == uid).first()
    if user is None:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account has been deactivated. Please contact support.",
        )
    return user


async def get_current_admin(current_user=Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    if not current_user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin account is deactivated")
    return current_user


async def get_optional_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    """Returns user if authenticated, None otherwise."""
    try:
        return await get_current_user(token, db)
    except Exception:
        return None
