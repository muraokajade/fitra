from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Integer, Float, Enum as SAEnum
from enum import Enum

from .base import Base
from app.models.meal_log import MealLog


# -----------------------
# Enum 定義
# -----------------------
class Mode(str, Enum):
    CHILL = "chill"        # まったり
    PRO = "pro"            # ガチ勢


class NutritionLevel(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


# -----------------------
# UserProfile モデル
# -----------------------
class UserProfile(Base):
    __tablename__ = "user_profiles"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String)
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)

    sex: Mapped[str | None] = mapped_column(String(10), nullable=True)
    age: Mapped[int | None] = mapped_column(Integer, nullable=True)
    height_cm: Mapped[float | None] = mapped_column(Float, nullable=True)
    weight_kg: Mapped[float | None] = mapped_column(Float, nullable=True)
    activity_level: Mapped[str | None] = mapped_column(String(20), nullable=True)

    # MealLog リレーション
    meal_logs: Mapped[list["MealLog"]] = relationship(back_populates="user")

    # ユーザーモード（chill / pro）
    mode: Mapped[Mode] = mapped_column(SAEnum(Mode), nullable=False, default=Mode.CHILL)

    # 初級/中級/上級
    nutrition_level: Mapped[NutritionLevel] = mapped_column(
        SAEnum(NutritionLevel),
        nullable=False,
        default=NutritionLevel.BEGINNER,
    )
