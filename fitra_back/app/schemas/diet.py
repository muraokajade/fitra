# app/schemas/diet.py
from typing import List
from pydantic import BaseModel

class Meal(BaseModel):
    time: str # "breakfast" / "lunch" / "dinner" / "snack"
    name: str # 例: "サラダチキン"
    quantity: str # 例: "100g", "1杯"

class DietRequest(BaseModel):
    meals: List[Meal]

class DietAdvice(BaseModel):
    summary: str
    calories_estimated: int
    protein_estimated: int
    improvements: List[str]

# app/schemas/diet.py
from pydantic import BaseModel

class DietAnalyzeRequest(BaseModel):
    meal: str


class DietAnalyzeResponse(BaseModel):
    result: str

