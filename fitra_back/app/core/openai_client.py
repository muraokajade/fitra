# app/core/openai_client.py
from openai import OpenAI
import os

# 環境変数 OPENAI_API_KEY にキーを入れておく想定
def get_openai_client() -> OpenAI:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        # ローカル開発用のエラー
        raise RuntimeError("OPENAI_API_KEY が設定されていません。")
    return OpenAI(api_key=api_key)
