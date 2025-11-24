from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.meal_log import MealLog
from app.services.diet_service import DietService
from app.schemas.diet import DietAnalyzeRequest, DietAnalyzeResponse

router = APIRouter(prefix="/diet", tags=["diet"])

@router.post("/analyze", response_model=DietAnalyzeResponse)
async def analyze_meal(meal_input: DietAnalyzeRequest,db:Session = Depends(get_db)):
    #OpenAIで食事内容を解析
    result = await DietService.analyze_meal(meal_input.meal)

    log = MealLog(
        user_id=1,
        meal_type="unkownn",
        calories=None,
        protein_g=None,
        fat_g=None,
        carb_g=None
    )

    db.add(log)
    db.commit()
    db.refresh(log)

    return DietAnalyzeResponse(result=result)

# ★ ここから追加：ログ一覧取得用
@router.get("/logs")
def get_logs(db: Session = Depends(get_db)):
    logs = db.query(MealLog).all()
    return logs