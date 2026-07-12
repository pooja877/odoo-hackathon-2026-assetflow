from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class MaintenanceRequest(Base):
    __tablename__ = "maintenance_requests"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    description = Column(String(255), nullable=False)
    priority = Column(String(50), nullable=False)  # High, Medium, Low
    technician = Column(String(100), default="Unassigned", nullable=False)
    status = Column(String(50), default="pending", nullable=False)  # pending, approved, assigned, inProgress, resolved
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    resolved_at = Column(DateTime, nullable=True)

    asset = relationship("Asset")
    user = relationship("User")
