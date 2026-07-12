from pydantic import BaseModel
from datetime import datetime

class NotificationResponse(BaseModel):
    id: int
    user_id: int | None = None
    type: str  # Alerts, Approvals, Bookings
    title: str
    text: str
    unread: bool
    created_at: datetime

    class Config:
        from_attributes = True

class ActivityLogResponse(BaseModel):
    id: int
    text: str
    user: str
    created_at: datetime

    class Config:
        from_attributes = True
