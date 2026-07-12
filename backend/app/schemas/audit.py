from pydantic import BaseModel
from datetime import datetime, date

class AuditCycleBase(BaseModel):
    name: str
    scope_type: str  # Department, Location
    scope_id: int | None = None
    start_date: date
    end_date: date

class AuditCycleCreate(AuditCycleBase):
    pass

class AuditCycleResponse(AuditCycleBase):
    id: int
    status: str
    created_at: datetime
    closed_at: datetime | None = None

    class Config:
        from_attributes = True

class AuditItemVerify(BaseModel):
    status: str  # Verified, Missing, Damaged

class AuditItemResponse(BaseModel):
    id: int
    audit_cycle_id: int
    asset_id: int
    expected_location: str | None = None
    status: str
    verified_at: datetime | None = None
    verified_by_id: int | None = None

    class Config:
        from_attributes = True
