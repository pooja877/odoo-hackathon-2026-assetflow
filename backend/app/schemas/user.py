from pydantic import BaseModel, EmailStr
from datetime import datetime


# ---------- Signup Request ----------
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


# ---------- Login Request ----------
class UserLogin(BaseModel):
    email: EmailStr
    password: str


# ---------- User Response ----------
class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    department_id: int | None = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True   # For Pydantic v2


# ---------- JWT Token Response ----------
class Token(BaseModel):
    access_token: str
    token_type: str