from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.activity import Notification, ActivityLog
from app.schemas.activity import NotificationResponse, ActivityLogResponse
from app.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("/", response_model=list[NotificationResponse])
def get_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Returns notifications for this user, or global notifications (user_id is Null)
    return db.query(Notification).filter(
        (Notification.user_id == current_user.id) | (Notification.user_id == None)
    ).order_by(Notification.created_at.desc()).all()

@router.get("/activity-logs", response_model=list[ActivityLogResponse])
def get_activity_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(ActivityLog).order_by(ActivityLog.created_at.desc()).all()

@router.patch("/{id}/read", response_model=NotificationResponse)
def mark_as_read(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notif = db.get(Notification, id)
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    notif.unread = False
    db.commit()
    db.refresh(notif)
    return notif

@router.patch("/read-all")
def mark_all_as_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db.query(Notification).filter(
        (Notification.user_id == current_user.id) | (Notification.user_id == None)
    ).update({Notification.unread: False}, synchronize_session=False)
    db.commit()
    return {"message": "All notifications marked as read"}
