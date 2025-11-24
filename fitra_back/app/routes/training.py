# app/routes/training.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.training import TrainingAnalyzeRequest, TrainingAnalyzeResponse
from app.services.training_service import TrainingService

router = APIRouter(prefix="/training", tags=["training"])

@router.post("/analyze", response_model=TrainingAnalyzeResponse)
async def analyze_training(req: TrainingAnalyzeRequest, db: Session = Depends(get_db)):
    # OpenAI で解析
    result_text = await TrainingService.analyze_training(req.text)
    return TrainingAnalyzeResponse(result_text=result_text)
