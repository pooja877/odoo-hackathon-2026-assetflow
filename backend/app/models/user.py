from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(100), nullable=False)

    email = Column(String(150), unique=True, nullable=False, index=True)

    password = Column(String(255), nullable=False)

    role = Column(
        String(50),
        default="Employee",
        nullable=False
    )

    status = Column(Boolean, default=True)

    @property
    def is_active(self):
        return self.status

    @is_active.setter
    def is_active(self, value):
        self.status = value

    department_id = Column(
        Integer,
        ForeignKey("departments.id"),
        nullable=True
    )

    department = relationship(
        "Department",
        back_populates="users"
    )