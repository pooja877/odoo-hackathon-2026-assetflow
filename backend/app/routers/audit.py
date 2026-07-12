from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app.models.audit import AuditCycle, AuditItem
from app.models.asset import Asset
from app.schemas.audit import AuditCycleCreate, AuditCycleResponse, AuditItemResponse, AuditItemVerify
from app.auth import get_admin_user, get_current_user
from app.models.user import User

router = APIRouter(prefix="/audits", tags=["Audits"])

@router.post("/", response_model=AuditCycleResponse, status_code=status.HTTP_201_CREATED)
def start_audit_cycle(
    payload: AuditCycleCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    # 1. Create audit cycle record
    cycle = AuditCycle(
        name=payload.name,
        scope_type=payload.scope_type,
        scope_id=payload.scope_id,
        start_date=payload.start_date,
        end_date=payload.end_date,
        status="Active",
        created_at=datetime.utcnow()
    )
    db.add(cycle)
    db.commit()
    db.refresh(cycle)

    # 2. Query assets inside scope and generate checklist items
    query = db.query(Asset)
    if payload.scope_type.lower() == "department" and payload.scope_id:
        query = query.filter(Asset.department_id == payload.scope_id)
        
    assets = query.all()
    for asset in assets:
        item = AuditItem(
            audit_cycle_id=cycle.id,
            asset_id=asset.id,
            expected_location=asset.location,
            status="Pending"
        )
        db.add(item)
        
    db.commit()
    db.refresh(cycle)
    return cycle

@router.get("/", response_model=list[AuditCycleResponse])
def get_audit_cycles(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(AuditCycle).all()

@router.get("/{audit_id}/checklist", response_model=list[AuditItemResponse])
def get_checklist(
    audit_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Fallback to load all items if audit_id is just a dummy id
    cycle = db.get(AuditCycle, audit_id)
    if not cycle:
        # If no cycle exists yet, return whatever items are in table or empty
        return db.query(AuditItem).all()
        
    return db.query(AuditItem).filter(AuditItem.audit_cycle_id == audit_id).all()

@router.patch("/{audit_id}/items/{item_id}", response_model=AuditItemResponse)
def verify_item(
    audit_id: int,
    item_id: int,
    payload: AuditItemVerify,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Support lookup either by audit item ID directly
    item = db.get(AuditItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Audit item not found")
        
    item.status = payload.status
    item.verified_at = datetime.utcnow()
    item.verified_by_id = current_user.id
    
    db.commit()
    db.refresh(item)
    return item

@router.post("/{audit_id}/close", response_model=AuditCycleResponse)
def close_audit_cycle(
    audit_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    cycle = db.get(AuditCycle, audit_id)
    if not cycle:
        raise HTTPException(status_code=404, detail="Audit cycle not found")
        
    if cycle.status == "Closed":
        raise HTTPException(status_code=400, detail="Audit cycle is already closed")
        
    cycle.status = "Closed"
    cycle.closed_at = datetime.utcnow()
    
    # Process discrepancies and update assets statuses
    items = db.query(AuditItem).filter(AuditItem.audit_cycle_id == audit_id).all()
    for item in items:
        asset = db.get(Asset, item.asset_id)
        if asset:
            if item.status == "Missing":
                asset.status = "Lost"
            elif item.status == "Damaged":
                asset.status = "Under Maintenance"
                
    db.commit()
    db.refresh(cycle)
    return cycle
