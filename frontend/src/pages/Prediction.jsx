import { useState } from "react";

import api from "../services/api";
import ModeSelector from "../components/ModeSelector";
import QuickForm from "../components/QuickForm";
import ExpertForm from "../components/ExpertForm";
import PredictionResult from "../components/PredictionResult";
import ErrorAlert from "../components/ErrorAlert";
import { BASE_DEFAULTS, QUICK_FIELDS, NUMERIC_FIELDS } from "../data/fieldConfig";
import districtDefaults from "../data/district_defaults.json";

import styles from "./Prediction.module.css";

const freshFormData = () => ({ ...BASE_DEFAULTS });

function Prediction() {
  // mode: "select" | "expert" | "quick" | "result"
  const [mode, setMode] = useState("select");
  const [formData, setFormData] = useState(freshFormData);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ---- field updates ----
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const updateFields = (partial) => {
    setFormData((prev) => ({ ...prev, ...partial }));
  };

  // ---- mode transitions ----
  const selectMode = (next) => {
    setError(null);
    if (next === "quick") {
      // Seed sensible Quick Mode rainfall defaults when empty.
      setFormData((prev) => ({
        ...prev,
        rainfall_7d_mm: prev.rainfall_7d_mm === "" ? "50" : prev.rainfall_7d_mm,
        monthly_rainfall_mm: prev.monthly_rainfall_mm === "" ? "180" : prev.monthly_rainfall_mm,
      }));
    }
    setMode(next);
  };

  const reset = () => {
    setFormData(freshFormData());
    setPrediction(null);
    setError(null);
    setMode("select");
  };

  // ---- build the 33-field record per mode ----
  const coerceNumbers = (record) => {
    const out = { ...record };
    NUMERIC_FIELDS.forEach((f) => {
      const v = out[f];
      out[f] = v === "" || v === null || v === undefined ? null : Number(v);
    });
    // Drop a blank record_id so the backend auto-generates one.
    if (!out.record_id) delete out.record_id;
    return out;
  };

  const buildRecord = () => {
    if (mode === "quick") {
      const district = formData.district;
      const base = districtDefaults._default || {};
      const perDistrict = districtDefaults[district] || {};
      // Only override district defaults with fields the user actually filled;
      // a blank visible field falls back to its regional average.
      const visible = QUICK_FIELDS.reduce((acc, key) => {
        const v = formData[key];
        if (v !== "" && v !== null && v !== undefined) acc[key] = v;
        return acc;
      }, {});
      return coerceNumbers({ ...BASE_DEFAULTS, ...base, ...perDistrict, ...visible });
    }
    // expert
    return coerceNumbers({ ...BASE_DEFAULTS, ...formData });
  };

  // ---- API call ----
  const handlePredict = async () => {
    setLoading(true);
    setError(null);

    try {
      const record = buildRecord();
      const response = await api.post("/predict", { record });
      setPrediction(response.data);
      setMode("result");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
          "Prediction failed. Please check your inputs or try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ---- render ----
  return (
    <div className={styles.page}>
      {mode === "select" && <ModeSelector onSelect={selectMode} />}

      {mode === "quick" && (
        <>
          {error && (
            <div className={styles.feedback}>
              <ErrorAlert message={error} />
            </div>
          )}
          <QuickForm
            formData={formData}
            onChange={handleInputChange}
            updateFields={updateFields}
            onPredict={handlePredict}
            onSwitchToExpert={() => setMode("expert")}
            loading={loading}
          />
        </>
      )}

      {mode === "expert" && (
        <>
          {error && (
            <div className={styles.feedback}>
              <ErrorAlert message={error} />
            </div>
          )}
          <ExpertForm
            formData={formData}
            onChange={handleInputChange}
            onPredict={handlePredict}
            loading={loading}
          />
        </>
      )}

      {mode === "result" && prediction && (
        <PredictionResult prediction={prediction} onReset={reset} />
      )}
    </div>
  );
}

export default Prediction;
