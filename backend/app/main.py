from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import auth, department, user, stats, booking, asset, category, allocation, audit, maintenance, activity

from app.models.asset import Asset
from app.models.category import Category
from app.models.department import Department
from app.models.user import User
from app.models.booking import Resource, Booking
from app.models.allocation import AssetAllocation
from app.models.audit import AuditCycle, AuditItem
from app.models.maintenance import MaintenanceRequest
from app.models.activity import Notification, ActivityLog

# Create Database Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AssetFlow API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(department.router)
app.include_router(user.router)
app.include_router(stats.router)
app.include_router(booking.router)
app.include_router(category.router)
app.include_router(asset.router)
app.include_router(allocation.router)
app.include_router(audit.router)
app.include_router(maintenance.router)
app.include_router(activity.router)

@app.get("/")
def root():
    return {"message": "AssetFlow Backend Running 🚀"}