from datetime import datetime

from sqlalchemy import Boolean, Column, Date, DateTime, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import relationship

from app.database import Base


class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False, index=True)
    asset_tag = Column(String(50), unique=True, nullable=False, index=True)
    serial_number = Column(String(100), unique=True, nullable=False, index=True)
    acquisition_date = Column(Date, nullable=False)
    acquisition_cost = Column(Numeric(12, 2), nullable=False)
    condition = Column(String(50), nullable=False)
    location = Column(String(150), nullable=False, index=True)
    photo_url = Column(String(500), nullable=True)
    is_shared = Column(Boolean, default=False, nullable=False)
    status = Column(String(50), default="Available", nullable=False, index=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False, index=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    category = relationship("Category", back_populates="assets")
    department = relationship("Department")
