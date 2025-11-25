from sqlalchemy.orm import Session

from app.models.user import (
    UserProfile,
    Mode as DbMode,
    NutritionLevel as DbNutritionLevel,
)
from app.schemas.user import UserCreate, Mode as ApiMode
from app.core.security import get_password_hash  # 既存のハッシュ関数を想定


def decide_initial_nutrition_level(mode: DbMode) -> DbNutritionLevel:
    """
    サインアップ時に、選ばれた mode から 初期 nutrition_level を決める。

    - CHILL(まったり)  → BEGINNER
    - PRO(ガチ)         → INTERMEDIATE
    """
    if mode == DbMode.CHILL:
        return DbNutritionLevel.BEGINNER
    if mode == DbMode.PRO:
        return DbNutritionLevel.INTERMEDIATE

    # 保険
    return DbNutritionLevel.BEGINNER


def create_user(db: Session, data: UserCreate) -> UserProfile:
    """
    ユーザー新規作成ロジック。
    """
    # API側 Enum → DB側 Enum に変換
    db_mode = DbMode(data.mode.value)

    # mode から 初期 nutrition_level を決定
    db_nutrition_level = decide_initial_nutrition_level(db_mode)

    # パスワードをハッシュ化
    hashed_password = get_password_hash(data.password)

    # UserProfile インスタンスを作成
    user = UserProfile(
        name=data.name,
        email=data.email,
        hashed_password=hashed_password,
        mode=db_mode,
        nutrition_level=db_nutrition_level,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user
