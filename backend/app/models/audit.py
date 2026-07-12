from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class AuditCycle(Base):
    __tablename__ = "audit_cycles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    scope_type = Column(String(50), nullable=False)  # Department, Location
    scope_id = Column(Integer, nullable=True)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    status = Column(String(50), default="Active", nullable=False)  # Active, Closed
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    closed_at = Column(DateTime, nullable=True)

    items = relationship("AuditItem", back_populates="cycle", cascade="all, delete-orphan")


class AuditItem(Base):
    __tablename__ = "audit_items"

    id = Column(Integer, primary_key=True, index=True)
    audit_cycle_id = Column(Integer, ForeignKey("audit_cycles.id"), nullable=False, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False, index=True)
    expected_location = Column(String(150), nullable=True)
    status = Column(String(50), default="Pending", nullable=False)  # Pending, Verified, Missing, Damaged
    verified_at = Column(DateTime, nullable=True)
    verified_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    cycle = relationship("AuditCycle", back_populates="items")
    asset = relationship("Asset")
    verified_by = relationship("User")
