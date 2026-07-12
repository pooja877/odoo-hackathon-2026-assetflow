from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.asset import Asset
from app.models.category import Category
from app.models.department import Department
from app.schemas.asset import AssetCreate, AssetResponse, AssetStatus, AssetUpdate

router = APIRouter(prefix="/assets", tags=["Assets"])


def _get_asset_or_404(asset_id: int, db: Session) -> Asset:
    asset = db.get(Asset, asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return asset


def _validate_references(category_id: int, department_id: int, db: Session) -> None:
    if not db.get(Category, category_id):
        raise HTTPException(status_code=400, detail="Category not found")
    if not db.get(Department, department_id):
        raise HTTPException(status_code=400, detail="Department not found")


def _new_asset_tag(db: Session) -> str:
    while True:
        tag = f"AST-{uuid4().hex[:10].upper()}"
        if not db.query(Asset).filter(Asset.asset_tag == tag).first():
            return tag


@router.post("/", response_model=AssetResponse, status_code=status.HTTP_201_CREATED)
def create_asset(payload: AssetCreate, db: Session = Depends(get_db)):
    if db.query(Asset).filter(Asset.serial_number == payload.serial_number).first():
        raise HTTPException(status_code=400, detail="Serial number already exists")
    _validate_references(payload.category_id, payload.department_id, db)
    values = payload.model_dump()
    values["status"] = values["status"].value
    asset = Asset(asset_tag=_new_asset_tag(db), **values)
    db.add(asset)
    db.commit()
    db.refresh(asset)
    return asset


@router.get("/", response_model=list[AssetResponse])
def get_assets(
    asset_tag: str | None = None,
    serial_number: str | None = None,
    category: str | None = None,
    category_id: int | None = None,
    status_value: AssetStatus | None = Query(default=None, alias="status"),
    department_id: int | None = None,
    location: str | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(Asset)
    if asset_tag:
        query = query.filter(Asset.asset_tag.ilike(f"%{asset_tag}%"))
    if serial_number:
        query = query.filter(Asset.serial_number.ilike(f"%{serial_number}%"))
    if category:
        query = query.join(Category).filter(Category.name.ilike(f"%{category}%"))
    if category_id is not None:
        query = query.filter(Asset.category_id == category_id)
    if status_value is not None:
        query = query.filter(Asset.status == status_value.value)
    if department_id is not None:
        query = query.filter(Asset.department_id == department_id)
    if location:
        query = query.filter(Asset.location.ilike(f"%{location}%"))
    return query.order_by(Asset.created_at.desc()).all()


@router.get("/{asset_id}", response_model=AssetResponse)
def get_asset(asset_id: int, db: Session = Depends(get_db)):
    return _get_asset_or_404(asset_id, db)


@router.put("/{asset_id}", response_model=AssetResponse)
def update_asset(asset_id: int, payload: AssetUpdate, db: Session = Depends(get_db)):
    asset = _get_asset_or_404(asset_id, db)
    changes = payload.model_dump(exclude_unset=True)
    if "serial_number" in changes and db.query(Asset).filter(
        Asset.serial_number == changes["serial_number"], Asset.id != asset_id
    ).first():
        raise HTTPException(status_code=400, detail="Serial number already exists")
    category_id = changes.get("category_id", asset.category_id)
    department_id = changes.get("department_id", asset.department_id)
    _validate_references(category_id, department_id, db)
    if "status" in changes:
        changes["status"] = changes["status"].value
    for field, value in changes.items():
        setattr(asset, field, value)
    db.commit()
    db.refresh(asset)
    return asset


@router.delete("/{asset_id}")
def delete_asset(asset_id: int, db: Session = Depends(get_db)):
    asset = _get_asset_or_404(asset_id, db)
    db.delete(asset)
    db.commit()
    return {"message": "Asset deleted successfully"}
