from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)  # Null if global alert
    type = Column(String(50), nullable=False)  # Alerts, Approvals, Bookings
    title = Column(String(150), nullable=False)
    text = Column(String(255), nullable=False)
    unread = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User")


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(String(255), nullable=False)
    user = Column(String(100), nullable=False)  # Store username directly
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
