import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import RiskBadge from "./RiskBadge";
import { readRiskColors } from "./riskColors";

import styles from "./RiskMap.module.css";

const CENTER = [7.8731, 80.7718];

function formatDate(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`);
  return new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" }).format(d);
}

/**
 * Leaflet map of Sri Lanka with one circle marker per city, colored by that
 * city's risk level for the selected forecast day.
 */
export default function RiskMap({ cities, dayIndex }) {
  const colors = readRiskColors();

  return (
    <MapContainer center={CENTER} zoom={7} scrollWheelZoom={false} className={styles.map}>
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {cities.map((c) => {
        const day = c.forecast[dayIndex];
        if (!day) return null;
        const fill = colors[day.risk_level] || colors.Moderate;
        return (
          <CircleMarker
            key={c.city}
            center={[c.lat, c.lng]}
            radius={12}
            pathOptions={{ color: "#ffffff", weight: 2, fillColor: fill, fillOpacity: 0.75 }}
            eventHandlers={{
              mouseover: (e) => e.target.setStyle({ radius: 16, weight: 3 }),
              mouseout: (e) => e.target.setStyle({ radius: 12, weight: 2 }),
            }}
          >
            <Popup>
              <div className={styles.popup}>
                <div className={styles.popCity}>{c.city}</div>
                <div className={styles.popDistrict}>{c.district}</div>
                <div className={styles.popBadge}>
                  <RiskBadge riskLevel={day.risk_level} />
                </div>
                <div className={styles.popMetric}>
                  Risk Score: <strong>{day.flood_risk_score.toFixed(3)}</strong>
                </div>
                <div className={styles.popMetric}>
                  Rainfall: <strong>{day.rainfall_mm} mm</strong>
                </div>
                <div className={styles.popDate}>{formatDate(day.date)}</div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
