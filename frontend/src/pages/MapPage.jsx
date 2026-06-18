import { useState, useEffect, useCallback } from "react";

import api from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorAlert from "../components/ErrorAlert";
import RiskMap from "../components/RiskMap";
import DaySlider from "../components/DaySlider";
import MapLegend from "../components/MapLegend";
import MapStats from "../components/MapStats";

import styles from "./MapPage.module.css";

const MODEL_VERSION = "champion_v014_seed_ensemble";

function formatPeak(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(`${dateStr}T00:00:00`);
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(d);
}

export default function MapPage() {
  const [forecasts, setForecasts] = useState([]);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showSlowHint, setShowSlowHint] = useState(false);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [generatedAt, setGeneratedAt] = useState(null);

  const load = useCallback(async () => {
    const res = await api.get("/forecast/all");
    setForecasts(res.data.cities || []);
    setGeneratedAt(res.data.generated_at);
  }, []);

  // Initial load.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        await load();
      } catch {
        if (active) setError("Could not load the map forecasts. Is the API running?");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [load]);

  // Slow-load hint after 10s.
  useEffect(() => {
    if (!loading) return undefined;
    const t = setTimeout(() => setShowSlowHint(true), 10000);
    return () => clearTimeout(t);
  }, [loading]);

  // Auto-play animation through the 10 days.
  useEffect(() => {
    if (!isPlaying) return undefined;
    const id = setInterval(() => setSelectedDayIndex((i) => (i + 1) % 10), 800);
    return () => clearInterval(id);
  }, [isPlaying]);

  const handleRetry = useCallback(async () => {
    setLoading(true);
    setError(null);
    setShowSlowHint(false);
    try {
      await load();
    } catch {
      setError("Could not load the map forecasts. Is the API running?");
    } finally {
      setLoading(false);
    }
  }, [load]);

  // Derived values for the selected day.
  const days = forecasts[0]?.forecast || [];
  const highRiskCount = forecasts.filter((c) => {
    const lvl = c.forecast[selectedDayIndex]?.risk_level;
    return lvl === "High" || lvl === "Critical";
  }).length;
  const avgToday = forecasts.length
    ? forecasts.reduce((s, c) => s + (c.forecast[selectedDayIndex]?.flood_risk_score || 0), 0) / forecasts.length
    : 0;

  let peakScore = -1;
  let peakDate = null;
  for (const c of forecasts) {
    for (const d of c.forecast) {
      if (d.flood_risk_score > peakScore) {
        peakScore = d.flood_risk_score;
        peakDate = d.date;
      }
    }
  }

  const generatedTime = generatedAt
    ? new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" }).format(new Date(generatedAt))
    : null;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Sri Lanka Flood Risk Map</h1>
          <p className={styles.subtitle}>10-day risk forecast across 27 cities</p>
        </div>
        <div className={styles.dataSource}>
          <span>Data: Open-Meteo · Model: {MODEL_VERSION}</span>
          {generatedTime && <span className={styles.asOf}>Data as of {generatedTime}</span>}
        </div>
      </header>

      {loading && (
        <div className={styles.loading}>
          <LoadingSpinner size={28} variant="dark" />
          <p className={styles.loadingText}>Loading forecasts for 27 cities…</p>
          {showSlowHint && (
            <p className={styles.slowHint}>
              First load takes 20–40 seconds. Cached for 1 hour after.
            </p>
          )}
        </div>
      )}

      {!loading && error && <ErrorAlert message={error} onRetry={handleRetry} />}

      {!loading && !error && forecasts.length > 0 && (
        <>
          <MapStats
            highRiskCount={highRiskCount}
            peakDay={formatPeak(peakDate)}
            avgToday={avgToday}
          />

          <div className={styles.mapCard}>
            <div className={styles.mapWrap}>
              <RiskMap cities={forecasts} dayIndex={selectedDayIndex} />
              <MapLegend />
            </div>

            <DaySlider
              days={days}
              value={selectedDayIndex}
              onChange={(v) => {
                setIsPlaying(false);
                setSelectedDayIndex(v);
              }}
              isPlaying={isPlaying}
              onTogglePlay={() => setIsPlaying((p) => !p)}
              disabled={false}
            />
          </div>
        </>
      )}
    </div>
  );
}
