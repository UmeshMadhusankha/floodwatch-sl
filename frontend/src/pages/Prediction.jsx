import { useState } from "react";
import api from "../services/api";

function Prediction() {
  // =========================
  // Input States
  // =========================
  const [district, setDistrict] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [rainfall, setRainfall] = useState("");

  // =========================
  // Output States
  // =========================
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // =========================
  // API Call
  // =========================
  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    setPrediction(null);

    try {
      const response = await api.post("/predict", {
        record: {
          district: district,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          rainfall_7d_mm: parseFloat(rainfall),
        },
      });

      setPrediction(response.data);
    } catch (err) {
      console.error(err);
      setError("Prediction failed. Please check backend or inputs.");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>FloodWatch SL - Prediction</h2>

      {/* Inputs */}
      <div style={styles.form}>

        <input
          style={styles.input}
          placeholder="District"
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
        />

        <input
          style={styles.input}
          placeholder="Latitude"
          value={latitude}
          onChange={(e) => setLatitude(e.target.value)}
        />

        <input
          style={styles.input}
          placeholder="Longitude"
          value={longitude}
          onChange={(e) => setLongitude(e.target.value)}
        />

        <input
          style={styles.input}
          placeholder="7-Day Rainfall (mm)"
          value={rainfall}
          onChange={(e) => setRainfall(e.target.value)}
        />

        <button
          style={styles.button}
          onClick={handlePredict}
          disabled={loading}
        >
          {loading ? "Predicting..." : "Predict"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={styles.error}>
          {error}
        </div>
      )}

      {/* Result */}
      {prediction && (
        <div style={styles.result}>
          <h2>Prediction Result</h2>

          <p>
            <b>Flood Risk Score:</b>{" "}
            {prediction.flood_risk_score}
          </p>

          <p>
            <b>Risk Level:</b>{" "}
            {prediction.risk_level}
          </p>
        </div>
      )}
    </div>
  );
}

// =========================
// Basic Styling
// =========================
const styles = {
  container: {
    padding: "30px",
    fontFamily: "Arial",
    maxWidth: "600px",
    margin: "0 auto",
  },
  title: {
    textAlign: "center",
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  input: {
    padding: "10px",
    fontSize: "16px",
  },
  button: {
    padding: "10px",
    fontSize: "16px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    cursor: "pointer",
  },
  error: {
    marginTop: "15px",
    color: "red",
  },
  result: {
    marginTop: "20px",
    padding: "15px",
    border: "1px solid #ccc",
  },
};

export default Prediction;