from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app.models.allocation import AssetAllocation
from app.models.asset import Asset
from app.schemas.allocation import AllocationCreate, AllocationResponse, TransferRequest, ReturnRequest
from app.auth import get_current_user, get_admin_user
from app.models.user import User

router = APIRouter(prefix="/allocations", tags=["Allocations"])

@router.post("/", response_model=AllocationResponse, status_code=status.HTTP_201_CREATED)
def allocate_asset(
    payload: AllocationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Verify asset
    asset = db.get(Asset, payload.asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
        
    # 2. Check current status
    if asset.status in ["Allocated", "Under Maintenance", "Lost", "Retired", "Disposed"]:
        raise HTTPException(
            status_code=400,
            detail=f"Asset cannot be allocated. Current status is '{asset.status}'"
        )
        
    # 3. Create allocation
    new_alloc = AssetAllocation(
        asset_id=payload.asset_id,
        user_id=payload.user_id,
        department_id=payload.department_id,
        expected_return_date=payload.expected_return_date,
        status="Allocated",
        allocated_at=datetime.utcnow()
    )
    
    # Update asset state
    asset.status = "Allocated"
    if payload.department_id:
        asset.department_id = payload.department_id
        
    db.add(new_alloc)
    db.commit()
    db.refresh(new_alloc)
    return new_alloc

@router.get("/", response_model=list[AllocationResponse])
def get_allocations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(AssetAllocation).all()

@router.get("/history/{asset_id}", response_model=list[AllocationResponse])
def get_allocation_history(
    asset_id: str, # Support tag (string) or id (numeric string)
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Find asset by tag or ID
    query = db.query(Asset)
    if asset_id.isdigit():
        asset = query.filter(Asset.id == int(asset_id)).first()
    else:
        asset = query.filter(Asset.asset_tag == asset_id).first()
        
    if not asset:
        return [] # Return empty history if asset doesn't exist
        
    return db.query(AssetAllocation).filter(AssetAllocation.asset_id == asset.id).order_by(AssetAllocation.allocated_at.desc()).all()

@router.post("/{id}/return", response_model=AllocationResponse)
def return_asset(
    id: int,
    payload: ReturnRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    alloc = db.get(AssetAllocation, id)
    if not alloc:
        raise HTTPException(status_code=404, detail="Allocation record not found")
        
    if alloc.status == "Returned":
        raise HTTPException(status_code=400, detail="Asset already returned")
        
    # Update allocation
    alloc.returned_at = datetime.utcnow()
    alloc.return_condition = payload.return_condition
    alloc.status = "Returned"
    
    # Update asset state
    asset = db.get(Asset, alloc.asset_id)
    if asset:
        asset.status = "Available"
        asset.condition = payload.return_condition
        
    db.commit()
    db.refresh(alloc)
    return alloc

@router.post("/transfer")
def request_transfer(
    payload: TransferRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Retrieve asset by ID or Tag
    query = db.query(Asset)
    if str(payload.asset_id).isdigit():
        asset = query.filter(Asset.id == int(payload.asset_id)).first()
    else:
        asset = query.filter(Asset.asset_tag == str(payload.asset_id)).first()
        
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
        
    # Find active allocation
    active_alloc = db.query(AssetAllocation).filter(
        AssetAllocation.asset_id == asset.id,
        AssetAllocation.status == "Allocated"
    ).first()
    
    if active_alloc:
        active_alloc.status = "Transfer Pending"
        
    # Create new placeholder allocation representing the pending transfer
    db.commit()
    return {"message": "Transfer request submitted successfully"}
