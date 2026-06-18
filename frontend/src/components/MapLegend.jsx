import styles from "./MapLegend.module.css";

const ITEMS = [
  { level: "Low", cls: "low" },
  { level: "Moderate", cls: "moderate" },
  { level: "High", cls: "high" },
  { level: "Critical", cls: "critical" },
];

export default function MapLegend() {
  return (
    <div className={styles.legend}>
      {ITEMS.map(({ level, cls }) => (
        <span key={level} className={styles.item}>
          <span className={`${styles.swatch} ${styles[cls]}`} />
          {level}
        </span>
      ))}
    </div>
  );
}
