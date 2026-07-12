from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.booking import Resource, Booking
from app.schemas.booking import ResourceCreate, ResourceResponse, BookingCreate, BookingResponse
from app.auth import get_current_user, get_admin_user
from app.models.user import User

router = APIRouter(prefix="/bookings", tags=["Bookings"])

# --- Resource Management ---

@router.post("/resources", response_model=ResourceResponse)
def create_resource(
    resource: ResourceCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    existing = db.query(Resource).filter(Resource.name == resource.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Resource already exists")
    
    new_res = Resource(
        name=resource.name,
        type=resource.type,
        location=resource.location
    )
    db.add(new_res)
    db.commit()
    db.refresh(new_res)
    return new_res

@router.get("/resources", response_model=list[ResourceResponse])
def get_resources(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Resource).all()

# --- Booking Workflows ---

@router.post("/", response_model=BookingResponse)
def book_resource(
    booking: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Verify resource exists
    res = db.query(Resource).filter(Resource.id == booking.resource_id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Resource not found")
        
    # 2. Time validation
    if booking.start_time >= booking.end_time:
        raise HTTPException(status_code=400, detail="Start time must be before end time")
        
    # 3. Check for overlapping bookings
    overlap = db.query(Booking).filter(
        Booking.resource_id == booking.resource_id,
        Booking.status != "Cancelled",
        Booking.start_time < booking.end_time,
        Booking.end_time > booking.start_time
    ).first()
    
    if overlap:
        raise HTTPException(
            status_code=400,
            detail=f"Time slot conflicts with an existing booking by {overlap.booked_by} ({overlap.start_time.strftime('%H:%M')} - {overlap.end_time.strftime('%H:%M')})"
        )
        
    # 4. Create booking
    new_booking = Booking(
        resource_id=booking.resource_id,
        user_id=current_user.id,
        start_time=booking.start_time,
        end_time=booking.end_time,
        booked_by=current_user.name,
        status="Upcoming"
    )
    db.add(new_booking)
    
    # Create notification and log
    from app.models.activity import Notification, ActivityLog
    notif = Notification(
        user_id=current_user.id,
        type="Bookings",
        title="Booking Confirmed",
        text=f"Confirmed booking for {res.name} on {booking.start_time.strftime('%Y-%m-%d')}",
        unread=True
    )
    log = ActivityLog(
        text=f"Booked resource {res.name} on {booking.start_time.strftime('%Y-%m-%d')}",
        user=current_user.name
    )
    db.add(notif)
    db.add(log)

    db.commit()
    db.refresh(new_booking)
    return new_booking

@router.get("/", response_model=list[BookingResponse])
def get_bookings(
    resource_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Booking)
    if resource_id:
        query = query.filter(Booking.resource_id == resource_id)
    return query.all()

@router.put("/{booking_id}/cancel", response_model=BookingResponse)
def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    # Only the user who booked it or an Admin can cancel it
    if booking.user_id != current_user.id and current_user.role != "Admin":
        raise HTTPException(status_code=403, detail="Not authorized to cancel this booking")
        
    booking.status = "Cancelled"
    db.commit()
    db.refresh(booking)
    return booking
