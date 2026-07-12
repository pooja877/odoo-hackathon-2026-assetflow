from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import auth
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


@app.get("/")
def root():
    return {"message": "AssetFlow Backend Running 🚀"}