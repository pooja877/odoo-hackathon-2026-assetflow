from pydantic import BaseModel
from datetime import datetime

class MaintenanceCreate(BaseModel):
    asset_id: int | str  # Support both ID or Tag
    description: str
    priority: str  # High, Medium, Low

class MaintenanceStatusUpdate(BaseModel):
    status: str

class MaintenanceAssign(BaseModel):
    technician: str

class MaintenanceResponse(BaseModel):
    id: int
    asset_id: int
    user_id: int
    description: str
    priority: str
    technician: str
    status: str
    created_at: datetime
    resolved_at: datetime | None = None

    class Config:
        from_attributes = True
