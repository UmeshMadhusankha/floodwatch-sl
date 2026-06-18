import os
import json
import psycopg2
import pandas as pd
from pathlib import Path
from scipy.stats import ks_2samp

def main():
    ROOT_DIR = Path(__file__).resolve().parents[1]
    
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("Error: DATABASE_URL environment variable is missing.")
        return

    # 1. Fetch live data from PostgreSQL
    print("Connecting to database and fetching last 1000 predictions...")
    try:
        with psycopg2.connect(db_url) as conn:
            with conn.cursor() as cur:
                # Fetching the JSON feature payload directly
                cur.execute("SELECT input_json FROM predictions ORDER BY id DESC LIMIT 1000;")
                rows = cur.fetchall()
    except Exception as e:
        print(f"Database connection failed: {e}")
        return

    if not rows:
        print("No live predictions found in the database. Exiting.")
        return
        
    # Extract JSON payloads into a live DataFrame
    live_records = [json.loads(row[0]) for row in rows if row[0]]
    live_df = pd.DataFrame(live_records)
    print(f"Fetched {len(live_df)} live prediction records.")

    # 2. Load baseline training data
    baseline_path = ROOT_DIR / "data" / "train.csv"
    if not baseline_path.exists():
        # Fallback to the available dropmissing dataset
        baseline_path = ROOT_DIR / "data" / "train_dropmissing.csv"
        
    print(f"Loading baseline dataset from {baseline_path}...")
    baseline_df = pd.read_csv(baseline_path)

    # 3. Identify common numerical features to test
    num_cols_baseline = baseline_df.select_dtypes(include=['number']).columns
    common_num_features = [col for col in num_cols_baseline if col in live_df.columns]

    if not common_num_features:
        print("No common numerical features found to compare.")
        return

    print(f"Performing Kolmogorov-Smirnov tests on {len(common_num_features)} features...")
    drift_detected = False
    alpha_threshold = 0.05

    for feature in common_num_features:
        # Drop NaNs to ensure ks_2samp calculations succeed
        baseline_vals = baseline_df[feature].dropna()
        live_vals = live_df[feature].dropna()
        
        if len(baseline_vals) < 5 or len(live_vals) < 5:
            continue
            
        # The KS test checks if two samples are drawn from the same continuous distribution
        stat, p_value = ks_2samp(baseline_vals, live_vals)
        
        if p_value < alpha_threshold:
            print(f"🚨 DRIFT ALERT: '{feature}' distribution has drifted! (p-value: {p_value:.4e})")
            drift_detected = True

    if not drift_detected:
        print("✅ No significant data drift detected in numerical features.")

if __name__ == "__main__":
    main()