# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.diet import router as diet_router
from app.routes.auth import router as auth_router
from app.db.session import engine
from app.models.base import Base
from dotenv import load_dotenv

# ★ ここが超重要：モデルを import（先頭に # が付いていないこと！）
from app.models.meal_log import MealLog  # ← MealLog クラスが読み込まれる
from app.routes import training

load_dotenv()

app = FastAPI(title="Fitra API")

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_start_up():
    Base.metadata.create_all(bind=engine)

app.include_router(diet_router)
app.include_router(training.router)
app.include_router(auth_router)
@app.get("/")
def root():
    return {"message": "Fitra API Running"}

