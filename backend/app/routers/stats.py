from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.auth import get_admin_user

router = APIRouter(prefix="/stats", tags=["Stats"])

@router.get("/")
def get_stats(db: Session = Depends(get_db), admin = Depends(get_admin_user)):
    total_users = db.query(User).count()
    pending_approvals = db.query(User).filter(User.is_active == False).count()
    return {
        "total_users": total_users,
        "pending_approvals": pending_approvals,
        "total_assets": 300,
        "available_assets": 80
    }
