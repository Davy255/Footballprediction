from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import (
    verify_password, get_password_hash,
    create_access_token, get_current_user,
    login_rate_limiter, register_rate_limiter, password_reset_rate_limiter,
    create_password_reset_token, verify_password_reset_token,
)
from app.models.user import User
from app.schemas.schemas import UserCreate, UserOut, Token, ForgotPasswordRequest, ResetPasswordRequest

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=Token, dependencies=[Depends(register_rate_limiter)])
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    clean_email = user_in.email.strip().lower()
    clean_username = user_in.username.strip()

    if db.query(User).filter(User.email == clean_email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.query(User).filter(User.username == clean_username).first():
        raise HTTPException(status_code=400, detail="Username already taken")

    user = User(
        username=clean_username,
        email=clean_email,
        hashed_password=get_password_hash(user_in.password),
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer", "user": user}


@router.post("/login", response_model=Token, dependencies=[Depends(login_rate_limiter)])
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Accept email or username in the "username" field (case-insensitive for email)
    identifier = form_data.username.strip()
    user = db.query(User).filter(
        (User.email == identifier.lower()) | (User.username == identifier)
    ).first()

    if not user or not verify_password(form_data.password, user.hashed_password):
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
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    clean_email = payload.email.strip().lower()
    user = db.query(User).filter(User.email == clean_email).first()

    # Always return a success response to prevent email enumeration attacks
    if not user:
        return {
            "detail": "If this email is registered, you will receive password reset instructions.",
            "reset_token": None,
        }

    reset_token = create_password_reset_token(user.email)
    return {
        "detail": "Password reset token generated successfully. (Valid for 15 minutes)",
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

    return {"detail": "Your password has been successfully reset! You can now sign in with your new password."}
