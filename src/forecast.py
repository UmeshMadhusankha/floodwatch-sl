"""
10-day flood-risk forecasting for FloodWatch SL.

Combines Open-Meteo rainfall forecasts (src/weather.py) with per-district
static feature averages to build 10 hypothetical daily records, scores them
with the existing CatBoost ensemble (src/predict.predict_batch), and logs each
prediction so /history and /stats reflect forecast usage.
"""

from __future__ import annotations

import json
from functools import lru_cache
from statistics import mean

import pandas as pd

from src.config import ROOT_DIR
from src.predict import predict_batch
from src.logger import log_prediction
from src.weather import get_forecast, get_rolling_7day_rainfall

CITIES_PATH = ROOT_DIR / "data" / "sri_lanka_cities.json"
DISTRICT_DEFAULTS_PATH = ROOT_DIR / "data" / "district_defaults.json"

FORECAST_DAYS = 10


# ── Cached loaders (read from disk once, reuse) ──────────────────────────────

@lru_cache(maxsize=1)
def _load_cities_index() -> dict:
    """Return {city_name: city_record}. Loaded once; preserves file order."""
    with open(CITIES_PATH, "r") as f:
        cities = json.load(f)["cities"]
    return {city["name"]: city for city in cities}


@lru_cache(maxsize=1)
def _load_district_defaults() -> dict:
    """Return {district: {feature: value}}. Loaded once."""
    with open(DISTRICT_DEFAULTS_PATH, "r") as f:
        return json.load(f)


def list_available_cities() -> list[dict]:
    """Return all city records (name, district, lat, lng)."""
    return list(_load_cities_index().values())


def _resolve_city(city_name: str) -> dict:
    """Look up a city by name (exact, then case-insensitive). Raise if unknown."""
    index = _load_cities_index()
    city = index.get(city_name)
    if city is None:
        for name, record in index.items():
            if name.lower() == city_name.lower():
                return record
        raise ValueError(
            f"Unknown city: {city_name!r}. Use GET /cities for the available list."
        )
    return city


# ── Forecast generation ──────────────────────────────────────────────────────

def generate_forecast(city_name: str, models: list | None = None) -> dict:
    """
    Build and score a 10-day flood-risk forecast for a city.

    Returns a dict with the city, district, a per-day forecast timeline, and a
    summary. Raises ValueError if the city is unknown.
    """
    city = _resolve_city(city_name)
    district = city["district"]

    # Per-district static feature averages; fall back to "Missing" defensively.
    district_defaults = _load_district_defaults()
    defaults = district_defaults.get(district) or district_defaults.get("Missing") or {}

    # Rainfall forecast + rolling 7-day totals.
    days = get_forecast(city["lat"], city["lng"], FORECAST_DAYS)
    rolling_7d = get_rolling_7day_rainfall(days)
    monthly_rainfall = round(sum(d["rainfall_mm"] for d in days), 2)

    # Build one model-ready record per forecast day.
    records = []
    for i, day in enumerate(days):
        records.append({
            **defaults,
            "record_id": f"forecast_{city['name']}_{day['date']}",
            "district": district,
            "latitude": city["lat"],
            "longitude": city["lng"],
            "place_name": city["name"],
            "rainfall_7d_mm": rolling_7d[i],
            "monthly_rainfall_mm": monthly_rainfall,
            "generation_date": day["date"],
        })

    # Score all 10 days with the ensemble.
    result = predict_batch(pd.DataFrame(records), models=models)
    scores = [float(s) for s in result["flood_risk_score"].tolist()]
    levels = result["risk_level"].tolist()
    versions = result["model_version"].tolist()

    # Log each daily forecast prediction (full record as input_data).
    for i, record in enumerate(records):
        log_prediction(record["record_id"], record, scores[i], levels[i], versions[i])

    # Assemble the per-day timeline.
    forecast = [
        {
            "date": day["date"],
            "rainfall_mm": day["rainfall_mm"],
            "rainfall_7d_mm": rolling_7d[i],
            "flood_risk_score": round(scores[i], 4),
            "risk_level": levels[i],
        }
        for i, day in enumerate(days)
    ]

    # Summary statistics.
    peak_i = max(range(len(scores)), key=lambda i: scores[i])
    summary = {
        "max_score": round(scores[peak_i], 4),
        "max_risk_level": levels[peak_i],
        "peak_day": days[peak_i]["date"],
        "avg_score": round(mean(scores), 4),
        "min_score": round(min(scores), 4),
    }

    return {
        "city": city["name"],
        "district": district,
        "forecast": forecast,
        "summary": summary,
    }
