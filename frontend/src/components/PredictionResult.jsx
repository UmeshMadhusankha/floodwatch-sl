import { Link } from "react-router-dom";
import { RotateCcw, Map as MapIcon, Info, ListChecks } from "lucide-react";

import RiskBadge from "./RiskBadge";
import styles from "./PredictionResult.module.css";

const RISK_CONTENT = {
  Low: {
    meaning:
      "This location currently shows a low likelihood of flooding. Conditions are within normal ranges for the area.",
    actions: [
      "Continue routine monitoring of weather and local water levels.",
      "Keep drainage channels clear as a standard precaution.",
      "No immediate action required.",
    ],
  },
  Moderate: {
    meaning:
      "This location has a moderate flood risk. Some contributing factors are elevated and warrant attention.",
    actions: [
      "Inspect and maintain local drainage, canals, and culverts.",
      "Monitor rainfall forecasts closely over the coming days.",
      "Confirm community awareness of flood-safe routes.",
    ],
  },
  High: {
    meaning:
      "This location has a high flood risk. Multiple factors indicate significant exposure to flooding.",
    actions: [
      "Begin flood mitigation planning for the area.",
      "Pre-position resources and verify evacuation routes.",
      "Alert local response teams and notify vulnerable residents.",
    ],
  },
  Critical: {
    meaning:
      "This location has a critical flood risk. Severe flooding is highly likely under current conditions.",
    actions: [
      "Activate evacuation preparedness procedures immediately.",
      "Coordinate directly with disaster response authorities.",
      "Move people and critical assets away from low-lying areas.",
    ],
  },
};

const LEVEL_CLASS = {
  Low: styles.low,
  Moderate: styles.moderate,
  High: styles.high,
  Critical: styles.critical,
};

export default function PredictionResult({ prediction, onReset }) {
  const { flood_risk_score, risk_level, model_version, record_id } = prediction;
  const content = RISK_CONTENT[risk_level] || RISK_CONTENT.Moderate;
  const levelClass = LEVEL_CLASS[risk_level] || styles.moderate;

  return (
    <div className={styles.wrap}>
      {/* Hero */}
      <div className={`${styles.hero} ${levelClass}`}>
        <span className={styles.heroLabel}>Flood Risk Level</span>
        <h1 className={styles.heroLevel}>{(risk_level || "Unknown").toUpperCase()}</h1>
        <div className={styles.heroMeta}>
          <span className={styles.score}>{Number(flood_risk_score).toFixed(4)}</span>
          <RiskBadge riskLevel={risk_level} />
        </div>
      </div>

      {/* What this means */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>
          <Info size={18} strokeWidth={2.2} />
          What this means
        </h2>
        <p className={styles.cardBody}>{content.meaning}</p>
      </div>

      {/* Recommended actions */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>
          <ListChecks size={18} strokeWidth={2.2} />
          Recommended actions
        </h2>
        <ul className={styles.actions}>
          {content.actions.map((action) => (
            <li key={action}>{action}</li>
          ))}
        </ul>
      </div>

      {/* Buttons */}
      <div className={styles.buttons}>
        <button type="button" className={styles.primaryBtn} onClick={onReset}>
          <RotateCcw size={16} strokeWidth={2.2} />
          New Prediction
        </button>
        <Link to="/map" className={styles.secondaryBtn}>
          <MapIcon size={16} strokeWidth={2.2} />
          View on Map
        </Link>
      </div>

      {/* Meta footer */}
      <p className={styles.footer}>
        Model: {model_version} · Record ID: {record_id}
      </p>
    </div>
  );
}
