from __future__ import annotations

import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

from src.config import ROOT_DIR

# The database file will be saved at data/predictions.db
DB_PATH = ROOT_DIR / "data" / "predictions.db"


def init_db() -> None:
    """
    Creates the predictions table if it doesn't already exist.
    Called once when the API server starts.
    """
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)

    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS predictions (
                id               INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp        TEXT    NOT NULL,
                record_id        TEXT,
                input_json       TEXT,
                flood_risk_score REAL    NOT NULL,
                risk_level       TEXT    NOT NULL,
                model_version    TEXT    NOT NULL
            )
        """)
        conn.commit()


def log_prediction(
    record_id: str,
    input_data: dict,
    score: float,
    risk_level: str,
    model_version: str,
) -> None:
    """
    Saves one prediction to the database.
    Called every time /predict or /predict/batch is used.
    """
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            """
            INSERT INTO predictions
                (timestamp, record_id, input_json, flood_risk_score, risk_level, model_version)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                datetime.now(timezone.utc).isoformat(),  # current time in UTC
                str(record_id),
                json.dumps(input_data, default=str),     # converts dict to JSON text
                float(score),
                risk_level,
                model_version,
            ),
        )
        conn.commit()


def get_recent_predictions(limit: int = 100) -> list[dict]:
    """
    Returns the most recent predictions from the database.
    Used by the GET /history endpoint.
    """
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row   # makes rows behave like dicts
        cursor = conn.execute(
            """
            SELECT id, timestamp, record_id, flood_risk_score, risk_level, model_version
            FROM predictions
            ORDER BY id DESC
            LIMIT ?
            """,
            (limit,),
        )
        return [dict(row) for row in cursor.fetchall()]


def get_prediction_stats() -> dict:
    """
    Returns summary statistics across all predictions.
    Used by the GET /stats endpoint and monitoring dashboard.
    """
    with sqlite3.connect(DB_PATH) as conn:
        row = conn.execute(
            """
            SELECT
                COUNT(*)                               AS total_predictions,
                ROUND(AVG(flood_risk_score), 4)        AS avg_score,
                ROUND(MIN(flood_risk_score), 4)        AS min_score,
                ROUND(MAX(flood_risk_score), 4)        AS max_score,
                SUM(CASE WHEN risk_level = 'Low'      THEN 1 ELSE 0 END) AS count_low,
                SUM(CASE WHEN risk_level = 'Moderate' THEN 1 ELSE 0 END) AS count_moderate,
                SUM(CASE WHEN risk_level = 'High'     THEN 1 ELSE 0 END) AS count_high,
                SUM(CASE WHEN risk_level = 'Critical' THEN 1 ELSE 0 END) AS count_critical
            FROM predictions
            """
        ).fetchone()

    return {
        "total_predictions": row[0] or 0,
        "avg_score":         row[1] or 0.0,
        "min_score":         row[2] or 0.0,
        "max_score":         row[3] or 0.0,
        "risk_breakdown": {
            "Low":      row[4] or 0,
            "Moderate": row[5] or 0,
            "High":     row[6] or 0,
            "Critical": row[7] or 0,
        },
    }