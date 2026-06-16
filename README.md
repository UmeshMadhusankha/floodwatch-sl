# FloodWatch SL

FloodWatch SL is an end-to-end ML system for predicting flood risk scores for Sri Lankan
locations. It serves the Round 1 champion model (**V014 CatBoost Alpha Pack seed ensemble**)
through a FastAPI backend and a React (Vite) frontend, with prediction logging and monitoring.

---

## Features

- **CatBoost seed-ensemble prediction** — 25 models (5 seeds × 5 folds) averaged into one score.
- **Raw-record scoring** — the API accepts plain location/environmental inputs and builds every
  feature the model needs internally (no pre-processed CSV required).
- **Single and batch prediction** — `POST /predict` and `POST /predict/batch`.
- **FastAPI service** — typed Pydantic schemas, CORS enabled, models loaded once at startup.
- **Prediction logging** — every prediction is stored in a SQLite database (`data/predictions.db`).
- **Monitoring endpoints** — `GET /history` and `GET /stats` expose recent predictions and
  aggregate statistics (totals, average score, risk-level breakdown).
- **React frontend** — a prediction form wired to the API, plus scaffolded Map, Batch, and
  Monitoring pages.

---

## Project structure

```
floodwatch-sl/
├── api/                     FastAPI app
│   ├── main.py              endpoints + CORS + lifespan model loading
│   └── schemas.py           Pydantic request/response models
├── src/                     prediction library
│   ├── config.py            paths, columns, risk thresholds
│   ├── feature_engineering.py   Alpha Pack + log1p/qmap/yeojohnson features
│   ├── data_validation.py   input validation
│   ├── predict.py           model loading + ensemble inference
│   └── logger.py            SQLite prediction logging + stats
├── scripts/
│   ├── fit_transformers.py  one-time fit of the 3 fitted transformers
│   └── test_predict_pipeline.py   end-to-end smoke test
├── models/champion_v014_seed_ensemble/
│   ├── *.cbm                25 CatBoost models
│   ├── *.joblib             fitted preprocessing transformers
│   ├── feature_list.json    35 model features
│   ├── categorical_features.json
│   └── model_metadata.json
├── frontend/                React + Vite app
│   └── src/pages/           Prediction, BatchUpload, MapPage, Monitoring
├── data/processed/          train/test CSVs
└── requirements.txt
```

---

## The model (V014)

- **Type:** CatBoost Regressor seed ensemble (25 models, averaged).
- **Target:** `flood_risk_score` (0–1).
- **Features:** 35 Alpha Pack features (10 categorical), including engineered ratio features and
  `log1p` / quantile-map / Yeo-Johnson transforms.
- **Validation:** target-binned StratifiedKFold (5 splits) across seeds 42, 202, 777, 2026, 9999.
- **Risk levels:** Low (<0.30), Moderate (0.30–0.55), High (0.55–0.75), Critical (≥0.75).
  In practice model outputs fall in roughly 0.36–0.64, i.e. Moderate/High.

### Feature engineering / preprocessing

A raw input record is turned into the 35 model features by `src/feature_engineering.py`:

1. **4 Alpha Pack ratio features** computed from distance / rainfall / inundation.
2. **5 `log1p` features** computed directly from the raw columns.
3. **3 fitted transforms** (`ndvi_qmap`, `ndwi_qmap`, `elevation_m_yeojohnson`) applied from
   transformers saved under `models/champion_v014_seed_ensemble/*.joblib`.

The fitted transformers are produced once with:

```bash
python scripts/fit_transformers.py
```

(re-run only if the model is retrained).

---

## Setup

### Backend

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# one-time: generate the fitted transformer artifacts
python scripts/fit_transformers.py

# run the API
uvicorn api.main:app --reload --port 8000
```

API docs (Swagger UI): http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App: http://localhost:5173

---

## API endpoints

| Method | Path             | Description                                            |
|--------|------------------|--------------------------------------------------------|
| GET    | `/`              | Service status message                                 |
| GET    | `/health`        | Health check + model-loaded flag                       |
| GET    | `/model-info`    | Model name, version, feature count, validation method  |
| POST   | `/predict`       | Score a single record `{ "record": { ... } }`          |
| POST   | `/predict/batch` | Score multiple records `{ "records": [ ... ] }`        |
| GET    | `/history`       | Most recent logged predictions (`?limit=`)             |
| GET    | `/stats`         | Aggregate stats: totals, avg score, risk breakdown     |

**Example:**

```bash
curl -X POST http://localhost:8000/predict \
  -H 'Content-Type: application/json' \
  -d '{"record": {"district":"Kandy","latitude":7.30,"longitude":80.60,"rainfall_7d_mm":5, ...}}'
# -> {"record_id":"...","flood_risk_score":0.62,"risk_level":"High","model_version":"champion_v014_seed_ensemble"}
```

---

## Frontend pages

| Page              | URL                              | Status            |
|-------------------|----------------------------------|-------------------|
| Prediction (form) | http://localhost:5173/           | Wired to `/predict` |
| Batch Upload      | http://localhost:5173/batch      | Scaffold          |
| Map               | http://localhost:5173/map        | Scaffold          |
| Monitoring        | http://localhost:5173/monitoring | Scaffold          |

The Prediction page collects raw location/environmental data and calls `POST /predict`, then
displays the flood risk score, risk level, model version, and record ID.

---

## Testing

```bash
# end-to-end batch smoke test on the processed test set
python scripts/test_predict_pipeline.py
```

---

## Round 1 foundation

The system is based on our Round 1 best model: **CatBoost Alpha Pack + drop-missing train rows**,
extended into a seed ensemble (V014). See `docs/round1_results_summary.md` for the full
experiment history and public-score progression.
