# app/routes/training.py
from fastapi import APIRouter
from app.schemas.training import TrainingAnalyzeRequest
from app.services.training_service import TrainingService

router = APIRouter(prefix="/training", tags=["training"])


@router.post("/analyze")
async def analyze_training(req: TrainingAnalyzeRequest):
    # Pydantic モデル → dict リストへ
    exercises_dict = [ex.dict() for ex in req.exercises]

    result_text = await TrainingService.analyze_training(
        text=req.text,
        exercises=exercises_dict,
    )

    return {"result_text": result_text}
