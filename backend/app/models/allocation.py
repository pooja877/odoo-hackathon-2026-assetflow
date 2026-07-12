from sqlalchemy import Column, Integer, String, DateTime, Date, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class AssetAllocation(Base):
    __tablename__ = "allocations"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True, index=True)
    
    allocated_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    expected_return_date = Column(Date, nullable=True)
    returned_at = Column(DateTime, nullable=True)
    return_condition = Column(String(100), nullable=True)
    status = Column(String(50), default="Allocated", nullable=False)  # Allocated, Returned, Transfer Pending

    asset = relationship("Asset")
    user = relationship("User")
    department = relationship("Department")
