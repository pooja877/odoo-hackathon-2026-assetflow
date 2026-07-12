from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate, UserCreate
from app.utils.security import hash_password
from app.auth import get_admin_user

router = APIRouter(
    prefix="/users",
    tags=["Users"],
    dependencies=[Depends(get_admin_user)]
)

@router.get("/", response_model=list[UserResponse])
def get_users(
    db: Session = Depends(get_db)
):

    users = db.query(User).all()

    return users


@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id:int,
    db:Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.id == user_id
    ).first()


    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return user


@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id:int,
    data:UserUpdate,
    db:Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.id == user_id
    ).first()


    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )


    approved_now = False
    changes = data.model_dump(exclude_unset=True)
    if "is_active" in changes and changes["is_active"] is True and not user.status:
        approved_now = True

    for key,value in changes.items():
        setattr(user,key,value)

    if approved_now:
        from app.models.activity import Notification, ActivityLog
        from datetime import datetime
        notif = Notification(
            user_id=user.id,
            type="Approvals",
            title="Account Approved",
            text="Your AssetFlow registration has been approved. Welcome to the system!",
            unread=True,
            created_at=datetime.utcnow()
        )
        log = ActivityLog(
            text=f"Approved user registration for {user.name}",
            user="Admin",
            created_at=datetime.utcnow()
        )
        db.add(notif)
        db.add(log)

    db.commit()
    db.refresh(user)

    return user


@router.delete("/{user_id}")
def deactivate_user(
    user_id:int,
    db:Session = Depends(get_db)
):

    user=db.query(User).filter(
        User.id==user_id
    ).first()


    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )


    user.is_active=False

    db.commit()


    return {
        "message":"User deactivated successfully"
    }


@router.post("/", response_model=UserResponse)
def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):

    # Check existing email
    existing_user = db.query(User).filter(
        User.email == user_data.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )


    # Create user without employee id first
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        password=hash_password(user_data.password),
        role=user_data.role,
        designation=user_data.designation,
        department_id=user_data.department_id
    )


    db.add(new_user)
    db.commit()
    db.refresh(new_user)


    # Generate Employee ID
    new_user.employee_id = f"EMP{new_user.id:03d}"


    db.commit()
    db.refresh(new_user)


    return new_user