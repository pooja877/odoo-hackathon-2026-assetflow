from datetime import date, datetime
from decimal import Decimal
from enum import Enum

from pydantic import BaseModel, Field


class AssetStatus(str, Enum):
    AVAILABLE = "Available"
    ALLOCATED = "Allocated"
    RESERVED = "Reserved"
    UNDER_MAINTENANCE = "Under Maintenance"
    LOST = "Lost"
    RETIRED = "Retired"
    DISPOSED = "Disposed"


class AssetBase(BaseModel):
    name: str = Field(min_length=1, max_length=150)
    serial_number: str = Field(min_length=1, max_length=100)
    acquisition_date: date
    acquisition_cost: Decimal = Field(ge=0, max_digits=12, decimal_places=2)
    condition: str = Field(min_length=1, max_length=50)
    location: str = Field(min_length=1, max_length=150)
    photo_url: str | None = Field(default=None, max_length=500)
    is_shared: bool = False
    status: AssetStatus = AssetStatus.AVAILABLE
    category_id: int = Field(gt=0)
    department_id: int = Field(gt=0)


class AssetCreate(AssetBase):
    pass


class AssetUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=150)
    serial_number: str | None = Field(default=None, min_length=1, max_length=100)
    acquisition_date: date | None = None
    acquisition_cost: Decimal | None = Field(
        default=None, ge=0, max_digits=12, decimal_places=2
    )
    condition: str | None = Field(default=None, min_length=1, max_length=50)
    location: str | None = Field(default=None, min_length=1, max_length=150)
    photo_url: str | None = Field(default=None, max_length=500)
    is_shared: bool | None = None
    status: AssetStatus | None = None
    category_id: int | None = Field(default=None, gt=0)
    department_id: int | None = Field(default=None, gt=0)


class AssetResponse(AssetBase):
    id: int
    asset_tag: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
