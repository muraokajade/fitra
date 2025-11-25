from datetime import datetime
from typing import Optional

from sqlalchemy import Integer, Float, DateTime, String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base


class MealLog(Base):
    __tablename__ = "meal_logs"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    # UserProfile への外部キー
    user_id: Mapped[int] = mapped_column(
        ForeignKey("user_profiles.id"), nullable=False, index=True
    )

    logged_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    meal_type: Mapped[str] = mapped_column(String(20))  # breakfast / lunch / dinner / snack

    calories: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    protein_g: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    fat_g: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    carb_g: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    # UserProfile 側と対応する relationship
    user: Mapped["UserProfile"] = relationship(back_populates="meal_logs")
