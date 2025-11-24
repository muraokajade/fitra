from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import Integer, Float, DateTime, String  # ★ ForeignKey は消す！
from datetime import datetime
from .base import Base


class MealLog(Base):
    __tablename__ = "meal_logs"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    # ★ ここを ForeignKey なしの素の Integer に変更
    user_id: Mapped[int] = mapped_column(Integer)

    logged_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    meal_type: Mapped[str] = mapped_column(String(20))  # breakfast / lunch / dinner / snack

    calories: Mapped[float | None] = mapped_column(Float, nullable=True)
    protein_g: Mapped[float | None] = mapped_column(Float, nullable=True)
    fat_g: Mapped[float | None] = mapped_column(Float, nullable=True)
    carb_g: Mapped[float | None] = mapped_column(Float, nullable=True)
