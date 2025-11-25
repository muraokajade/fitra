# app/services/training_service.py
import json
from typing import Any, Dict, List
from app.core.openai_client import get_openai_client

# あなたが設定した MAX_VOLUME（100点満点の基準）
MAX_VOLUME = 22500  # 100kgスクワット10×5 + 75kgベンチ10×10 + 100kgデッド10×10


class TrainingService:

    # ==========================================================
    # ① トレーニング解析メイン処理
    # ==========================================================
    @staticmethod
    async def analyze_training(
        text: str,
        exercises: List[Dict[str, Any]] = None
    ) -> str:

        exercises = exercises or []

        # ---- 数学ベースのスコア計算 ----
        total_volume = TrainingService._calculate_volume(exercises)
        score = int((total_volume / MAX_VOLUME) * 100)
        score = max(0, min(100, score))

        # ---- AIで総評・良い点・改善点をつくる ----
        summary, good, bad, next_actions = await TrainingService._summarize_with_ai(
            text=text,
            total_volume=total_volume,
            score=score,
            exercises=exercises
        )

        # ---- フロント用の最終テキスト ----
        return TrainingService._build_text_response(
            score, summary, good, bad, next_actions
        )

    # ==========================================================
    # ② ボリューム計算（weight × reps × sets）
    # ==========================================================
    @staticmethod
    def _calculate_volume(exercises: List[Dict[str, Any]]) -> int:
        total = 0
        for ex in exercises:
            try:
                w = float(ex.get("weight", 0))
                r = float(ex.get("reps", 0))
                s = float(ex.get("sets", 0))
                total += w * r * s
            except Exception:
                continue
        return int(total)

    # ==========================================================
    # ③ AI に要約だけ任せる
    # ==========================================================
    @staticmethod
    async def _summarize_with_ai(
        text: str,
        total_volume: int,
        score: int,
        exercises: List[Dict[str, Any]]
    ):
        client = get_openai_client()

        exercises_text = json.dumps(exercises, ensure_ascii=False)

        system_prompt = """
あなたは筋トレの専門AIコーチです。
以下の構造で必ず JSON のみ返してください。

{
  "summary": "全体要約",
  "good": ["良い点1", "良い点2"],
  "bad": ["改善点1", "改善点2"],
  "next_actions": ["次の行動1", "次の行動2"]
}

短く・読みやすく・日本語で。
        """

        user_prompt = f"""
ユーザーコメント:
{text}

本日の総ボリューム: {total_volume}
スコア(0-100): {score}

種目データ(JSON):
{exercises_text}

この内容を踏まえて上記JSON形式に沿って返してください。
"""

        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        )

        raw = completion.choices[0].message.content or "{}"

        try:
            data = json.loads(raw)
        except Exception:
            return (
                "今日のトレーニングを解析しました。",
                ["継続できている", "ボリュームが増えている"],
                ["特に問題なし"],
                ["次回はフォームを意識"]
            )

        return (
            data.get("summary", "今日の内容を解析しました。"),
            data.get("good", ["継続が良い", "ボリュームOK"]),
            data.get("bad", ["大きな問題なし"]),
            data.get("next_actions", ["次回も継続"])
        )

    # ==========================================================
    # ④ 最終的にフロントへ返すテキスト
    # ==========================================================
    @staticmethod
    def _build_text_response(
        score: int,
        summary: str,
        good: List[str],
        bad: List[str],
        next_actions: List[str]
    ) -> str:

        g1 = good[0] if len(good) > 0 else ""
        g2 = good[1] if len(good) > 1 else ""

        b1 = bad[0] if len(bad) > 0 else ""
        b2 = bad[1] if len(bad) > 1 else ""

        n1 = next_actions[0] if len(next_actions) > 0 else ""
        n2 = next_actions[1] if len(next_actions) > 1 else ""

        text = f"""
総評: {summary}

良い点:
- {g1}
- {g2}

改善点:
- {b1}
- {b2}

次にやるべきこと:
- {n1}
- {n2}

score: {score}
"""

        return text.strip()
