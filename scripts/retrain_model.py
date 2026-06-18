import json
import sys
import pandas as pd
from pathlib import Path
import joblib
from sklearn.preprocessing import PowerTransformer, QuantileTransformer
from catboost import CatBoostRegressor

# Replicate the Python path configuration from fit_transformers.py
ROOT_DIR = Path(__file__).resolve().parents[1]
sys.path.append(str(ROOT_DIR))

try:
    from src.config import MODEL_DIR, FEATURE_LIST_PATH, CATEGORICAL_FEATURES_PATH
except ImportError:
    MODEL_DIR = ROOT_DIR / "models"
    FEATURE_LIST_PATH = MODEL_DIR / "champion_v014_seed_ensemble" / "feature_list.json"
    CATEGORICAL_FEATURES_PATH = MODEL_DIR / "champion_v014_seed_ensemble" / "categorical_features.json"

TRAIN_DATA_CSV = ROOT_DIR / "data" / "processed" / "train_dropmissing.csv"
NEW_DATA_CSV = ROOT_DIR / "data" / "new_ground_truth.csv"
RETRAINED_MODEL_DIR = ROOT_DIR / "models" / "retrained"


def load_json(path: Path):
    with open(path, "r") as f:
        return json.load(f)


def load_feature_list() -> list[str]:
    return load_json(FEATURE_LIST_PATH)


def load_categorical_features() -> list[str]:
    return load_json(CATEGORICAL_FEATURES_PATH)

def refit_and_transform_quantile(values: pd.Series, output_path: Path) -> pd.Series:
    """Refits the QuantileTransformer and immediately applies it to the data."""
    clean = values.dropna().to_numpy().reshape(-1, 1)
    n_quantiles = min(1000, len(clean))
    transformer = QuantileTransformer(
        output_distribution="normal", n_quantiles=n_quantiles, random_state=42
    )
    transformer.fit(clean)
    joblib.dump(transformer, output_path)
    
    # Transform replacing NaNs temporarily with median to maintain array shape
    filled_vals = values.fillna(values.median()).to_numpy().reshape(-1, 1)
    return transformer.transform(filled_vals).flatten()

def refit_and_transform_yeojohnson(values: pd.Series, output_path: Path) -> pd.Series:
    """Refits the Yeo-Johnson PowerTransformer and immediately applies it."""
    clean = values.dropna().to_numpy().reshape(-1, 1)
    transformer = PowerTransformer(method="yeo-johnson")
    transformer.fit(clean)
    joblib.dump(transformer, output_path)
    
    filled_vals = values.fillna(values.median()).to_numpy().reshape(-1, 1)
    return transformer.transform(filled_vals).flatten()

def load_training_data() -> pd.DataFrame:
    if not TRAIN_DATA_CSV.exists():
        raise FileNotFoundError(f"Training data not found: {TRAIN_DATA_CSV}")

    df_old = pd.read_csv(TRAIN_DATA_CSV)

    if NEW_DATA_CSV.exists():
        df_new = pd.read_csv(NEW_DATA_CSV)
        print(f"2. Concatenating datasets ({len(df_old)} old + {len(df_new)} new)...")
        return pd.concat([df_old, df_new], ignore_index=True)

    print(f"2. No new_ground_truth.csv found, using base training data only ({len(df_old)} rows)...")
    return df_old


def main():
    RETRAINED_MODEL_DIR.mkdir(parents=True, exist_ok=True)
    
    CATBOOST_MODEL_PATH = RETRAINED_MODEL_DIR / "catboost_model.cbm" 
    TARGET_COL = "flood_risk_score"
    feature_list = load_feature_list()
    categorical_features = load_categorical_features()
    
    print("1. Loading training data...")
    df_combined = load_training_data()
    
    print("3. Refitting Transformers & applying column transformations...")
    df_combined['ndvi_qmap'] = refit_and_transform_quantile(
        df_combined['ndvi'], RETRAINED_MODEL_DIR / "transformer_ndvi_qmap.joblib"
    )
    df_combined['ndwi_qmap'] = refit_and_transform_quantile(
        df_combined['ndwi'], RETRAINED_MODEL_DIR / "transformer_ndwi_qmap.joblib"
    )
    df_combined['elevation_m_yeojohnson'] = refit_and_transform_yeojohnson(
        df_combined['elevation_m'], RETRAINED_MODEL_DIR / "transformer_elevation_yeojohnson.joblib"
    )
    
    print("4. Preparing structured features for CatBoost...")
    missing_features = [col for col in feature_list if col not in df_combined.columns]
    if missing_features:
        raise ValueError(f"Training data is missing required features: {missing_features}")

    X = df_combined[feature_list].copy()
    y = df_combined[TARGET_COL]
    
    missing_categoricals = [col for col in categorical_features if col not in X.columns]
    if missing_categoricals:
        raise ValueError(f"Training data is missing categorical features: {missing_categoricals}")

    cat_features = categorical_features
    
    # Standardize categoricals to avoid mixed-type typing errors (e.g., NaN + string)
    for col in cat_features:
        X[col] = X[col].fillna("Missing").astype(str)
        
    print(f"5. Retraining CatBoostRegressor on {len(X)} rows...")
    model = CatBoostRegressor(
        iterations=1000, 
        learning_rate=0.05, 
        depth=6, 
        cat_features=cat_features,
        verbose=100,
        random_state=42
    )
    
    model.fit(X, y)
    
    print(f"6. Overwriting model weights to {CATBOOST_MODEL_PATH}...")
    model.save_model(str(CATBOOST_MODEL_PATH))
    print("✅ Model successfully retrained. Artifacts saved to 'models/retrained/'. Ready for CI/CD auto-deployment!")

if __name__ == "__main__":
    main()