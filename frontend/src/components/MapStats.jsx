import styles from "./MapStats.module.css";

/**
 * Compact 3-stat strip shown above the map for the currently selected day.
 */
export default function MapStats({ highRiskCount, peakDay, avgToday }) {
  const items = [
    { label: "Cities at High Risk Today", value: highRiskCount },
    { label: "Peak Day Across Country", value: peakDay || "—" },
    { label: "Avg Risk Today", value: avgToday.toFixed(2) },
  ];

  return (
    <div className={styles.strip}>
      {items.map((it) => (
        <div key={it.label} className={styles.stat}>
          <span className={styles.value}>{it.value}</span>
          <span className={styles.label}>{it.label}</span>
        </div>
      ))}
    </div>
  );
}
