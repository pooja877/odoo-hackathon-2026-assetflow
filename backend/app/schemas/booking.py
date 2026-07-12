from pydantic import BaseModel
from datetime import datetime

class ResourceBase(BaseModel):
    name: str
    type: str  # Room, Vehicle, Equipment
    location: str | None = None

class ResourceCreate(ResourceBase):
    pass

class ResourceResponse(ResourceBase):
    id: int

    class Config:
        from_attributes = True

class BookingCreate(BaseModel):
    resource_id: int
    start_time: datetime
    end_time: datetime

class BookingResponse(BaseModel):
    id: int
    resource_id: int
    user_id: int
    start_time: datetime
    end_time: datetime
    booked_by: str
    status: str
    resource: ResourceResponse

    class Config:
        from_attributes = True
