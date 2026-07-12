from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app.models.maintenance import MaintenanceRequest
from app.models.asset import Asset
from app.models.activity import ActivityLog
from app.schemas.maintenance import MaintenanceCreate, MaintenanceResponse, MaintenanceStatusUpdate, MaintenanceAssign
from app.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/maintenance", tags=["Maintenance"])

@router.post("/", response_model=MaintenanceResponse, status_code=status.HTTP_201_CREATED)
def create_ticket(
    payload: MaintenanceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Lookup asset by tag or ID
    query = db.query(Asset)
    if str(payload.asset_id).isdigit():
        asset = query.filter(Asset.id == int(payload.asset_id)).first()
    else:
        asset = query.filter(Asset.asset_tag == str(payload.asset_id)).first()
        
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
        
    new_tkt = MaintenanceRequest(
        asset_id=asset.id,
        user_id=current_user.id,
        description=payload.description,
        priority=payload.priority,
        status="pending",
        created_at=datetime.utcnow()
    )
    
    # Add activity log and notification
    from app.models.activity import Notification
    log = ActivityLog(
        text=f"Raised maintenance ticket for {asset.name} ({asset.asset_tag})",
        user=current_user.name,
        created_at=datetime.utcnow()
    )
    notif = Notification(
        user_id=None,  # Null user_id targets Admins/global dashboard
        type="Alerts",
        title="Maintenance Request Raised",
        text=f"{current_user.name} raised ticket for {asset.name} ({asset.asset_tag})",
        unread=True,
        created_at=datetime.utcnow()
    )
    db.add(log)
    db.add(notif)
    db.add(new_tkt)
    db.commit()
    db.refresh(new_tkt)
    return new_tkt

@router.get("/", response_model=list[MaintenanceResponse])
def get_tickets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(MaintenanceRequest).all()

@router.patch("/{id}/status", response_model=MaintenanceResponse)
def update_ticket_status(
    id: int | str,  # Support tag (which frontend uses for asset tag item reference) or numeric ID
    payload: MaintenanceStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Find ticket by id, or by asset tag mapping if id is a tag string!
    query = db.query(MaintenanceRequest)
    if str(id).isdigit():
        tkt = query.filter(MaintenanceRequest.id == int(id)).first()
    else:
        # Find asset first, then get active ticket for that asset
        asset = db.query(Asset).filter(Asset.asset_tag == str(id)).first()
        if asset:
            tkt = query.filter(MaintenanceRequest.asset_id == asset.id).order_by(MaintenanceRequest.created_at.desc()).first()
        else:
            tkt = None
            
    if not tkt:
        raise HTTPException(status_code=404, detail="Maintenance ticket not found")
        
    old_status = tkt.status
    tkt.status = payload.status
    
    # Handle resolved date
    if payload.status == "resolved":
        tkt.resolved_at = datetime.utcnow()
        
    # Auto-update asset status
    asset = db.get(Asset, tkt.asset_id)
    if asset:
        if payload.status == "approved" or payload.status == "assigned" or payload.status == "inProgress":
            asset.status = "Under Maintenance"
        elif payload.status == "resolved":
            asset.status = "Available"
            
    # Create notification for employee who raised the ticket
    from app.models.activity import Notification
    notif = Notification(
        user_id=tkt.user_id,
        type="Alerts",
        title="Maintenance Ticket Update",
        text=f"Your ticket #{tkt.id} for {asset.name if asset else 'Asset'} status is now '{payload.status}'.",
        unread=True,
        created_at=datetime.utcnow()
    )
    db.add(notif)

    db.commit()
    db.refresh(tkt)
    return tkt

@router.patch("/{id}/assign", response_model=MaintenanceResponse)
def assign_technician(
    id: int,
    payload: MaintenanceAssign,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tkt = db.get(MaintenanceRequest, id)
    if not tkt:
        raise HTTPException(status_code=404, detail="Maintenance ticket not found")
        
    tkt.technician = payload.technician
    tkt.status = "assigned"
    
    db.commit()
    db.refresh(tkt)
    return tkt
