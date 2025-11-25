import sys
import os

from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

# === ここから追加 ===
# プロジェクトルート (fitra_back/) を Python パスに追加
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

# ★★★ ここが決定版 ★★★
from app.models import Base


# Alembic Config オブジェクト
config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# ここを Base.metadata にする
target_metadata = Base.metadata
