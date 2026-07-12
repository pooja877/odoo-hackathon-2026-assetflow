from pydantic import BaseModel, EmailStr
from datetime import datetime


# ---------- Signup Request ----------
class UserSignup(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserCreate(BaseModel):
    employee_id: str | None = None
    name: str
    email: EmailStr
    password: str
    role: str = "Employee"
    designation: str | None = None
    department_id: int | None = None

class UserUpdate(BaseModel):
    name: str | None = None
    role: str | None = None
    designation: str | None = None
    department_id: int | None = None
    is_active: bool | None = None
# ---------- Login Request ----------
class UserLogin(BaseModel):
    email: EmailStr
    password: str


# ---------- User Response ----------
class UserResponse(BaseModel):
    id: int
    employee_id: str | None = None
    name: str
    email: EmailStr
    role: str
    designation: str | None = None
    department_id: int | None = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
# ---------- JWT Token Response ----------
class Token(BaseModel):
    access_token: str
    token_type: str