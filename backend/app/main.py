from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import auth, department, user, stats, booking
from app.models.department import Department
from app.models.user import User
from app.models.booking import Resource, Booking

# Create Database Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AssetFlow API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this later for production
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


@app.get("/")
def root():
    return {"message": "AssetFlow Backend Running 🚀"}