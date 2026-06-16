"""
Log Round 1 training results to MLflow.

This script reads the saved training artifacts and recreates the full
experiment history in MLflow's tracking system. It does NOT retrain any
models — it tells the story of work that was already done.

Run once:  python scripts/log_to_mlflow.py
View UI:   mlflow ui --backend-store-uri sqlite:///mlflow.db
           (then open http://localhost:5000)
"""

from __future__ import annotations

import json
from pathlib import Path

import mlflow
import pandas as pd

# ── Project paths ────────────────────────────────────────────────────────────
ROOT      = Path(__file__).resolve().parent.parent
MODEL_DIR = ROOT / "models" / "champion_v014_seed_ensemble"

METADATA_PATH   = MODEL_DIR / "model_metadata.json"
SEED_SCORES     = MODEL_DIR / "seed_scores.csv"
COMPARISON_CSV  = MODEL_DIR / "model_comparison.csv"

# ── MLflow tracking location ─────────────────────────────────────────────────
# Metadata (runs, params, metrics, tags) lives in a SQLite database.
# Artifacts (model files, plots) live in a separate folder.
mlflow.set_tracking_uri(f"sqlite:///{ROOT / 'mlflow.db'}")
ARTIFACT_LOCATION = (ROOT / "mlartifacts").as_uri()


# ─────────────────────────────────────────────────────────────────────────────
# Helper — create experiment with artifact location if missing
# ─────────────────────────────────────────────────────────────────────────────
def get_or_create_experiment(name: str) -> str:
    """
    Returns the experiment ID. Creates it with the correct artifact location
    if it doesn't already exist.
    """
    existing = mlflow.get_experiment_by_name(name)
    if existing:
        mlflow.set_experiment(name)
        return existing.experiment_id

    experiment_id = mlflow.create_experiment(
        name=name,
        artifact_location=ARTIFACT_LOCATION,
    )
    mlflow.set_experiment(name)
    return experiment_id


# ─────────────────────────────────────────────────────────────────────────────
# EXPERIMENT 1 — Per-seed runs
# ─────────────────────────────────────────────────────────────────────────────
def log_seed_runs(metadata: dict, seed_scores: pd.DataFrame) -> None:
    """
    Create one MLflow run per random seed.
    Shows how consistent the model is across different random initializations.
    """
    get_or_create_experiment("floodwatch-sl-seeds")

    for _, row in seed_scores.iterrows():
        seed = int(row["seed"])

        with mlflow.start_run(run_name=f"seed_{seed}"):
            # ── Parameters: the inputs for this run ──
            mlflow.log_param("seed",              seed)
            mlflow.log_param("model_type",        "CatBoostRegressor")
            mlflow.log_param("validation_method", metadata["validation_method"])
            mlflow.log_param("n_splits",          metadata["n_splits"])
            mlflow.log_param("feature_count",     metadata["feature_count"])
            mlflow.log_param("training_data",     metadata["training_data"])

            # ── Metrics: the measured outcomes ──
            mlflow.log_metric("cv_rmse",          row["oof_rmse"])
            mlflow.log_metric("cv_mae",           row["oof_mae"])
            mlflow.log_metric("cv_r2",            row["oof_r2"])
            mlflow.log_metric("test_pred_min",    row["test_pred_min"])
            mlflow.log_metric("test_pred_max",    row["test_pred_max"])
            mlflow.log_metric("test_pred_mean",   row["test_pred_mean"])
            mlflow.log_metric("test_pred_std",    row["test_pred_std"])

            # ── Tags: labels for organizing/filtering ──
            mlflow.set_tag("round",        "1")
            mlflow.set_tag("feature_pack", "alpha")
            mlflow.set_tag("status",       "seed_member")

            print(f"  Logged seed {seed}: CV RMSE = {row['oof_rmse']:.5f}")


# ─────────────────────────────────────────────────────────────────────────────
# EXPERIMENT 2 — Model approach comparison
# ─────────────────────────────────────────────────────────────────────────────
def log_model_comparison(comparison: pd.DataFrame) -> None:
    """
    Create one MLflow run per model approach tried in Round 1.
    Shows the engineering journey from V010 (single model) to V014 (ensemble).
    """
    get_or_create_experiment("floodwatch-sl-models")

    for _, row in comparison.iterrows():
        version = row["version"]

        with mlflow.start_run(run_name=version):
            # ── Parameters ──
            mlflow.log_param("model",        row["model"])
            mlflow.log_param("rows",         int(row["rows"]))
            mlflow.log_param("features",     row["features"])

            # ── Metrics ──
            mlflow.log_metric("cv_rmse",        row["cv_rmse"])
            mlflow.log_metric("cv_mae",         row["cv_mae"])
            mlflow.log_metric("cv_r2",          row["cv_r2"])
            mlflow.log_metric("prediction_std", row["prediction_std"])

            # public_score may be empty for some rows — only log if present
            if pd.notna(row["public_score"]):
                mlflow.log_metric("public_score", row["public_score"])

            # ── Tags ──
            mlflow.set_tag("round", "1")
            if "ensemble" in version.lower():
                mlflow.set_tag("approach", "ensemble")
            else:
                mlflow.set_tag("approach", "single_model")

            print(f"  Logged version {version}: CV RMSE = {row['cv_rmse']:.5f}")


# ─────────────────────────────────────────────────────────────────────────────
# EXPERIMENT 3 — Production champion
# ─────────────────────────────────────────────────────────────────────────────
def log_champion(metadata: dict) -> None:
    """
    Create one MLflow run representing the final deployed production model.
    """
    get_or_create_experiment("floodwatch-sl-champion")

    with mlflow.start_run(run_name=metadata["model_version"]):
        # ── Parameters ──
        mlflow.log_param("model_name",        metadata["model_name"])
        mlflow.log_param("model_version",     metadata["model_version"])
        mlflow.log_param("model_type",        metadata["model_type"])
        mlflow.log_param("target",            metadata["target"])
        mlflow.log_param("validation_method", metadata["validation_method"])
        mlflow.log_param("n_splits",          metadata["n_splits"])
        mlflow.log_param("feature_count",     metadata["feature_count"])
        mlflow.log_param("number_of_models",  metadata["number_of_models"])
        mlflow.log_param("seeds",             str(metadata["seeds"]))
        mlflow.log_param("training_data",     metadata["training_data"])

        # ── Metrics ──
        mlflow.log_metric("cv_rmse",         metadata["cv_rmse"])
        mlflow.log_metric("cv_mae",          metadata["cv_mae"])
        mlflow.log_metric("cv_r2",           metadata["cv_r2"])
        mlflow.log_metric("prediction_min",  metadata["prediction_min"])
        mlflow.log_metric("prediction_max",  metadata["prediction_max"])
        mlflow.log_metric("prediction_mean", metadata["prediction_mean"])
        mlflow.log_metric("prediction_std",  metadata["prediction_std"])
        mlflow.log_metric("public_score",    metadata["round1_reference_public_score"])

        # ── Tags ──
        mlflow.set_tag("status",       "production")
        mlflow.set_tag("round",        "1")
        mlflow.set_tag("feature_pack", "alpha")
        mlflow.set_tag("notes",        metadata["notes"])

        print(f"  Logged champion: {metadata['model_version']}")


# ─────────────────────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────────────────────
def main() -> None:
    print("Reading training artifacts...")
    metadata    = json.loads(METADATA_PATH.read_text())
    seed_scores = pd.read_csv(SEED_SCORES)
    comparison  = pd.read_csv(COMPARISON_CSV)

    print("\nLogging Experiment 1: per-seed runs")
    log_seed_runs(metadata, seed_scores)

    print("\nLogging Experiment 2: model approach comparison")
    log_model_comparison(comparison)

    print("\nLogging Experiment 3: production champion")
    log_champion(metadata)

    print("\nAll done.")
    print(f"MLflow database: {ROOT / 'mlflow.db'}")
    print("Run 'mlflow ui --backend-store-uri sqlite:///mlflow.db' to launch the dashboard.")


if __name__ == "__main__":
    main()