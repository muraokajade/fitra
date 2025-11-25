# app/schemas/user.py
from pydantic import BaseModel, EmailStr
from app.models.user import Mode, NutritionLevel

class UserBase(BaseModel):
    email: EmailStr
    mode: Mode
    nutrition_level: NutritionLevel


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    mode: Mode  # ← サインアップ画面から送ってもらうのは mode だけ


class UserRead(UserBase):
    id: int

    class Config:
        from_attributes = True