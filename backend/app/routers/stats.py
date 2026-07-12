from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.asset import Asset
from app.auth import get_admin_user

router = APIRouter(prefix="/stats", tags=["Stats"])

@router.get("/")
def get_stats(db: Session = Depends(get_db), admin = Depends(get_admin_user)):
    total_users = db.query(User).count()
    pending_approvals = db.query(User).filter(User.status == False).count()
    total_assets = db.query(Asset).count()
    available_assets = db.query(Asset).filter(Asset.status == "Available").count()
    return {
        "total_users": total_users,
        "pending_approvals": pending_approvals,
        "total_assets": total_assets,
        "available_assets": available_assets
    }
