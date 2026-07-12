from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import asset, auth, category, department, user, stats
from app.models.asset import Asset
from app.models.category import Category
from app.models.department import Department
from app.models.user import User

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
app.include_router(category.router)
app.include_router(asset.router)


@app.get("/")
def root():
    return {"message": "AssetFlow Backend Running 🚀"}
