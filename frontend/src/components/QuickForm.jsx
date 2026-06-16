import { MapContainer, TileLayer, CircleMarker, useMapEvents } from "react-leaflet";
import { Info, Zap } from "lucide-react";
import "leaflet/dist/leaflet.css";

import Input from "./Input";
import Select from "./Select";
import LoadingSpinner from "./LoadingSpinner";
import { FIELDS, QUICK_FIELDS } from "../data/fieldConfig";
import { SRI_LANKA_CENTER, nearestDistrict } from "../data/district_centroids";

import styles from "./QuickForm.module.css";

// Captures map clicks and reports the coordinates upward.
function ClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function QuickForm({
  formData,
  onChange,
  updateFields,
  onPredict,
  onSwitchToExpert,
  loading,
}) {
  const lat = parseFloat(formData.latitude);
  const lng = parseFloat(formData.longitude);
  const hasPin = Number.isFinite(lat) && Number.isFinite(lng);

  const handlePick = (pickedLat, pickedLng) => {
    updateFields({
      latitude: pickedLat.toFixed(4),
      longitude: pickedLng.toFixed(4),
      district: nearestDistrict(pickedLat, pickedLng),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onPredict();
  };

  return (
    <form className={styles.wrap} onSubmit={handleSubmit}>
      <div className={styles.header}>
        <h1 className={styles.title}>Quick Assessment</h1>
        <p className={styles.subtitle}>
          Click the map to drop a pin, or enter the details below.
        </p>
      </div>

      <div className={styles.mapCard}>
        <MapContainer
          center={[SRI_LANKA_CENTER.lat, SRI_LANKA_CENTER.lng]}
          zoom={7}
          className={styles.map}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onPick={handlePick} />
          {hasPin && (
            <CircleMarker
              center={[lat, lng]}
              radius={9}
              pathOptions={{ color: "#185FA5", fillColor: "#185FA5", fillOpacity: 0.6 }}
            />
          )}
        </MapContainer>
        {hasPin && (
          <p className={styles.pinNote}>
            Pin set at {lat.toFixed(4)}, {lng.toFixed(4)} — nearest district:{" "}
            <strong>{formData.district || "—"}</strong>
          </p>
        )}
      </div>

      <div className={styles.fields}>
        {QUICK_FIELDS.map((name) => {
          const field = FIELDS[name];
          const Comp = field.type === "select" ? Select : Input;
          return (
            <Comp
              key={name}
              field={field}
              value={formData[name]}
              onChange={onChange}
            />
          );
        })}
      </div>

      <div className={styles.banner}>
        <Info size={18} strokeWidth={2.2} className={styles.bannerIcon} />
        <span>
          Quick Mode fills the remaining environmental factors (vegetation, terrain,
          infrastructure) with regional averages for the selected district. Leave a field
          blank to use its regional average. For full control, switch to Expert Mode.
        </span>
      </div>

      <button type="submit" className={styles.predictBtn} disabled={loading}>
        {loading ? <LoadingSpinner label="Predicting..." /> : "Get Flood Risk Prediction"}
      </button>

      <button type="button" className={styles.switchLink} onClick={onSwitchToExpert}>
        <Zap size={14} strokeWidth={2.2} />
        Switch to Expert Mode for full control
      </button>
    </form>
  );
}
