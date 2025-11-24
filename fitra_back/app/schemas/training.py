# app/schemas/training.py
from pydantic import BaseModel

class TrainingAnalyzeRequest(BaseModel):
    text: str

class TrainingAnalyzeResponse(BaseModel):
    result_text: str
