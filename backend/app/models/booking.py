from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Resource(Base):
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False, index=True)
    type = Column(String, nullable=False)  # Room, Vehicle, Equipment
    location = Column(String, nullable=True)

    bookings = relationship("Booking", back_populates="resource", cascade="all, delete-orphan")


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    resource_id = Column(Integer, ForeignKey("resources.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    booked_by = Column(String, nullable=False)
    status = Column(String, default="Upcoming")  # Upcoming, Ongoing, Completed, Cancelled

    resource = relationship("Resource", back_populates="bookings")
