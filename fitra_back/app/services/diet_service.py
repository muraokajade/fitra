from app.core.openai_client import get_openai_client

class DietService:
    """
    ユーザーが入力した食事内容を AI に渡して、
    栄養解析・改善点・アドバイスを返す役割。
    """
    @staticmethod
    async def analyze_meal(meal_text: str) -> str:
        """
        meal_text: 「朝：サラダ、鶏胸肉200g、白米150g」など
        return: AI からのアドバイス
        """
        client = get_openai_client()

        system_prompt = """
        あなたはプロの栄養士です。
        以下の食事内容を読み、栄養評価・改善案・不足栄養素を
        日本語で簡潔かつ具体的にアドバイスしてください。

        出力フォーマットは以下：
        1. 栄養評価（点数 0〜100）
        2. 良い点
        3. 改善点
        4. 不足している栄養素
        5. 次に食べるべきもの（提案3つ）
        """
        response = client.responses.create(
            model="gpt-4o-mini",
            input=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": meal_text}
            ]
        )
        return response.output_text

