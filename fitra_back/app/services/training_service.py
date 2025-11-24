# app/services/training_service.py
from app.core.openai_client import get_openai_client

class TrainingService:

    @staticmethod
    async def analyze_training(text: str) -> str:
        openai_client = get_openai_client()

        prompt = f"""
あなたはトレーニングAIアナリストです。

以下のフォーマットで必ず返答してください：

今日のトレーニング総評:
(1〜3行の短いまとめ)

良い点:
- 箇条書き

改善ポイント:
- 箇条書き

次にやるべきこと:
- 箇条書き

score: 0〜100

------ ユーザー入力 ------
{text}
"""

        # ★ await なし（同期API）
        completion = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "user", "content": prompt}
            ],
        )

        # ★ v1 SDK は dict ではなく属性アクセス
        return completion.choices[0].message.content
