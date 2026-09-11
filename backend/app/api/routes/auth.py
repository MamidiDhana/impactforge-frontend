from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.schemas.auth import TokenResponse, UserLogin, UserRegister, UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new platform user",
)
def register(
    payload: UserRegister,
    db: Session = Depends(get_db),
) -> User:
    existing = db.query(User).filter(User.email == payload.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists.",
        )

    target_role = payload.role.lower().strip()
    if target_role == "faculty":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Public registration for faculty is disabled. Faculty accounts are provisioned via institutional invitation under the University Portal.",
        )

    user = User(
        full_name=payload.full_name.strip(),
        email=payload.email.lower().strip(),
        password_hash=hash_password(payload.password),
        role=payload.role.lower().strip(),
        organization_name=payload.organization_name.strip() if payload.organization_name else None,
        phone=payload.phone.strip() if payload.phone else None,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Authenticate and receive JWT token",
)
def login(
    payload: UserLogin,
    db: Session = Depends(get_db),
) -> TokenResponse:
    user = db.query(User).filter(User.email == payload.email.lower().strip()).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials. Please check your email and password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials. Please check your email and password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Please contact support.",
        )

    # If payload specified role, verify compatibility
    if payload.role and payload.role.lower().strip() != user.role.lower().strip():
        # Allow admin to test or switch roles if needed, otherwise check mismatch
        if user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Account role '{user.role}' does not match requested role '{payload.role}'.",
            )

    token = create_access_token(
        data={"sub": user.email, "role": user.role, "uid": user.id}
    )

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current user profile",
)
def get_me(current_user: User = Depends(get_current_user)) -> User:
    return current_user


@router.post(
    "/logout",
    summary="Log out user",
)
def logout(current_user: User = Depends(get_current_user)):
    return {"message": f"User {current_user.email} successfully logged out."}
