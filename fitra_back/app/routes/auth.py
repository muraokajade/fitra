from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db      # DBセッション
from app.schemas.user import UserCreate, UserRead
from app.services.user_service import create_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=UserRead)
def signup(payload: UserCreate, db: Session = Depends(get_db)):
    """
    サインアップAPI。

    - email / password / mode を受け取る
    - create_user() が nutrition_level を自動決定して保存
    """
    user = create_user(db, payload)
    return user
