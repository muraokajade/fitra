# app/api/routes/diet.py

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.services.diet_service import DietService
from app.db.session import get_db
from app.models.meal_log import MealLog

router = APIRouter(
    prefix="/diet",
    tags=["diet"],
)

# ---- リクエスト / レスポンス ----

class MealInput(BaseModel):
    meal: str


class AnalyzeResponse(BaseModel):
    result: str


# ---- 食事解析（＋DB保存） ----

@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_meal(
        meal_input: MealInput,
        db: Session = Depends(get_db),
):
    # OpenAI で解析
    result = await DietService.analyze_meal(meal_input.meal)

    # 食事ログを保存（MVPなので user_id=1 固定）
    log = MealLog(
        user_id=1,
        meal_type="unknown",
        calories=None,
        protein_g=None,
        fat_g=None,
        carb_g=None,
    )
    db.add(log)
    db.commit()
    db.refresh(log)

    return AnalyzeResponse(result=result)


# ---- ログ一覧取得 ----

@router.get("/logs")
def get_logs(db: Session = Depends(get_db)):
    logs = db.query(MealLog).all()
    return logs
