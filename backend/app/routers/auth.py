from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token
from app.utils.security import hash_password, verify_password
from app.auth import create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/signup")
def signup(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Bootstrapping: first registered user becomes an active Admin
    total_users = db.query(User).count()
    is_first_user = total_users == 0

    new_user = User(
        name=user.name,
        email=user.email,
        password=hash_password(user.password),
        role="Admin" if is_first_user else "Employee",
        status=True if is_first_user else False,
        department_id=user.department_id,
        designation=user.designation
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Generate employee ID for them
    new_user.employee_id = f"EMP{new_user.id:03d}"
    db.commit()
    db.refresh(new_user)

    # Create notification and log
    from app.models.activity import Notification, ActivityLog
    notif = Notification(
        user_id=None,  # Null user_id targets Admins
        type="Approvals",
        title="New User Registration",
        text=f"New user {new_user.name} ({new_user.email}) registered and is awaiting approval.",
        unread=True,
        created_at=datetime.utcnow()
    )
    log = ActivityLog(
        text=f"User {new_user.name} registered and is pending approval",
        user="System",
        created_at=datetime.utcnow()
    )
    db.add(notif)
    db.add(log)
    db.commit()

    if is_first_user:
        return {"message": "Admin account created and approved successfully"}
    return {"message": "Account created successfully. Pending administrator approval."}


@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    db_user = db.query(User).filter(
        User.email == form_data.username
    ).first()

    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not verify_password(form_data.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not db_user.is_active:
        raise HTTPException(status_code=403, detail="Account is pending approval. Please contact an admin.")

    access_token = create_access_token(
        data={
            "sub": str(db_user.id),
            "role": db_user.role
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user