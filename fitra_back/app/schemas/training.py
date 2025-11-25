# app/schemas/training.py
from pydantic import BaseModel
from typing import List

class TrainingExerciseIn(BaseModel):
    name: str
    weight: float
    reps: int
    sets: int

class TrainingAnalyzeRequest(BaseModel):
    text: str = ""                      # 自由コメント（任意）
    exercises: List[TrainingExerciseIn] = []  # プルダウンで選んだ種目たち