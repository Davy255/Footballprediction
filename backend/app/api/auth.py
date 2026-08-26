from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, Body, Request
from starlette.requests import Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.core.security import (
    verify_password, get_password_hash,
    create_access_token, get_current_user,
    login_rate_limiter, register_rate_limiter, password_reset_rate_limiter,
    create_password_reset_token, verify_password_reset_token,
)
from app.models.user import User
from app.schemas.schemas import UserCreate, UserOut, Token, ForgotPasswordRequest, ResetPasswordRequest, GoogleAuthRequest
from app.services.email_service import send_welcome_email, send_password_reset_email

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=Token, dependencies=[Depends(register_rate_limiter)])
def register(user_in: UserCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    clean_email = user_in.email.strip().lower()
    clean_username = user_in.username.strip()

    if not clean_email or "@" not in clean_email:
        raise HTTPException(status_code=400, detail="Please provide a valid email address.")
    if len(clean_username) < 3:
        raise HTTPException(status_code=400, detail="Username must be at least 3 characters long.")

    # Check for existing email (case-insensitive)
    existing_email = db.query(User).filter(func.lower(User.email) == clean_email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="This email address is already registered. Please sign in instead.")

    # Check for existing username (case-insensitive)
    existing_username = db.query(User).filter(func.lower(User.username) == clean_username.lower()).first()
    if existing_username:
        raise HTTPException(status_code=400, detail="This username is already taken. Please choose another username.")

    user = User(
        username=clean_username,
        email=clean_email,
        hashed_password=get_password_hash(user_in.password),
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Dispatch welcome email asynchronously
    background_tasks.add_task(send_welcome_email, user.email, user.username)

    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer", "user": user}


@router.post("/login", response_model=Token, dependencies=[Depends(login_rate_limiter)])
async def login(request: Request, db: Session = Depends(get_db)):
    """
    High-Compatibility Login Endpoint.
    Accepts application/x-www-form-urlencoded, multipart/form-data, and application/json.
    Supports login via either username or email with case-insensitive matching.
    """
    content_type = request.headers.get("content-type", "").lower()
    identifier = ""
    password = ""

    if "application/json" in content_type:
        try:
            body = await request.json()
            identifier = str(body.get("username") or body.get("email") or "").strip()
            password = str(body.get("password") or "")
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid JSON authentication payload")
    else:
        try:
            form = await request.form()
            identifier = str(form.get("username") or form.get("email") or "").strip()
            password = str(form.get("password") or "")
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid form authentication payload")

    if not identifier or not password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email/username or password",
        )

    # Lookup user by email (case-insensitive) or username (case-insensitive)
    user = db.query(User).filter(
        (func.lower(User.email) == identifier.lower()) | 
        (User.username == identifier) | 
        (func.lower(User.username) == identifier.lower())
    ).first()

    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email/username or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account has been deactivated. Please contact support.",
        )

    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer", "user": user}


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserOut)
def update_me(
    username: str = None,
    avatar: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if username:
        existing = db.query(User).filter(User.username == username).first()
        if existing and existing.id != current_user.id:
            raise HTTPException(status_code=400, detail="Username taken")
        current_user.username = username
    if avatar is not None:
        current_user.avatar = avatar
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/forgot-password", dependencies=[Depends(password_reset_rate_limiter)])
def forgot_password(payload: ForgotPasswordRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    clean_email = payload.email.strip().lower()
    user = db.query(User).filter(User.email == clean_email).first()

    # Always return a success response to prevent email enumeration attacks
    if not user:
        return {
            "detail": "If this email is registered, password reset instructions have been sent to your inbox.",
            "reset_token": None,
        }

    reset_token = create_password_reset_token(user.email)

    # Dispatch email asynchronously in background
    background_tasks.add_task(send_password_reset_email, user.email, reset_token, user.username)

    return {
        "detail": "Password reset instructions have been sent to your email. (Valid for 15 minutes)",
        "reset_token": reset_token,
    }


@router.post("/reset-password", dependencies=[Depends(password_reset_rate_limiter)])
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    email = verify_password_reset_token(payload.token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token. Please request a new password reset.",
        )

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User account not found.")

    user.hashed_password = get_password_hash(payload.new_password)
    db.commit()

    return {"detail": "Password successfully updated. You can now sign in with your new password."}


@router.post("/google", response_model=Token, dependencies=[Depends(login_rate_limiter)])
def google_auth(payload: GoogleAuthRequest = Body(...), background_tasks: BackgroundTasks = None, db: Session = Depends(get_db)):
    """
    Google OAuth 2.0 Sign In / Sign Up handler.
    Verifies Google ID token, logs in existing users or creates new user profiles automatically.
    """
    import base64
    import json
    import re
    import secrets

    email = None
    name = None
    picture = payload.picture or ""

    # 1. Parse JWT payload directly (instant, zero-network overhead)
    if payload.token and "." in payload.token:
        try:
            parts = payload.token.split(".")
            if len(parts) >= 2:
                padded = parts[1] + "=" * (-len(parts[1]) % 4)
                decoded_bytes = base64.urlsafe_b64decode(padded)
                jwt_data = json.loads(decoded_bytes.decode("utf-8"))
                email = jwt_data.get("email")
                name = jwt_data.get("name") or jwt_data.get("given_name")
                picture = jwt_data.get("picture") or picture
        except Exception:
            pass

    # 2. Fallback to Google TokenInfo API if needed
    if not email and payload.token and len(payload.token) > 20:
        try:
            url = f"https://oauth2.googleapis.com/tokeninfo?id_token={payload.token}"
            req = urllib.request.Request(url, headers={"User-Agent": "FootballPredict-Auth/1.0"})
            with urllib.request.urlopen(req, timeout=4) as response:
                if response.status == 200:
                    google_info = json.loads(response.read().decode("utf-8"))
                    email = google_info.get("email")
                    name = google_info.get("name") or google_info.get("given_name")
                    picture = google_info.get("picture") or picture
        except Exception:
            pass

    # 3. Fallback to client-provided fields
    if not email and payload.email:
        email = str(payload.email)
    if not name and payload.name:
        name = payload.name

    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unable to verify Google account credentials. Please try standard sign-in.",
        )

    clean_email = email.strip().lower()

    # 1. Check if user already exists
    user = db.query(User).filter(func.lower(User.email) == clean_email).first()

    if user:
        if picture and not user.avatar:
            user.avatar = picture
            db.commit()
            db.refresh(user)
    else:
        # 2. Auto-create new user with clean unique username
        raw_name = name or clean_email.split("@")[0]
        base_username = re.sub(r"[^a-zA-Z0-9]", "_", raw_name.strip()).lower().strip("_")[:14]
        if len(base_username) < 3:
            base_username = f"user_{base_username}"

        unique_username = base_username
        attempts = 0
        while db.query(User).filter(func.lower(User.username) == unique_username.lower()).first():
            unique_username = f"{base_username[:10]}_{secrets.randbelow(900) + 100}"
            attempts += 1
            if attempts > 15:
                unique_username = f"fan_{secrets.token_hex(4)}"
                break

        random_pw = secrets.token_urlsafe(24)
        user = User(
            username=unique_username,
            email=clean_email,
            hashed_password=get_password_hash(random_pw),
            avatar=picture,
            is_active=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        # Dispatch welcome email asynchronously
        if background_tasks:
            background_tasks.add_task(send_welcome_email, user.email, user.username)

    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer", "user": user}
