from pydantic import BaseModel
from datetime import datetime, date

class AllocationBase(BaseModel):
    asset_id: int
    user_id: int | None = None
    department_id: int | None = None
    expected_return_date: date | None = None

class AllocationCreate(AllocationBase):
    pass

class AllocationResponse(BaseModel):
    id: int
    asset_id: int
    user_id: int | None = None
    department_id: int | None = None
    allocated_at: datetime
    expected_return_date: date | None = None
    returned_at: datetime | None = None
    return_condition: str | None = None
    status: str

    class Config:
        from_attributes = True

class TransferRequest(BaseModel):
    asset_id: str | int  # Support both string tag or int ID
    target_department_id: int
    note: str | None = None

class ReturnRequest(BaseModel):
    return_condition: str
