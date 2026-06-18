import { Play, Pause } from "lucide-react";

import styles from "./DaySlider.module.css";

function formatFull(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`);
  return new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" }).format(d);
}

/**
 * Day-of-forecast slider (0-9) with a Play/Pause button to animate through the
 * 10 days. The filled portion of the track uses --blue.
 */
export default function DaySlider({ days, value, onChange, isPlaying, onTogglePlay, disabled }) {
  const count = days.length || 10;
  const current = days[value];
  const label = current ? `${formatFull(current.date)} (Day ${value + 1} of ${count})` : "—";
  const pct = count > 1 ? (value / (count - 1)) * 100 : 0;

  return (
    <div className={styles.wrap}>
      <div className={styles.label}>{label}</div>

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.playBtn}
          onClick={onTogglePlay}
          disabled={disabled}
          aria-label={isPlaying ? "Pause animation" : "Play animation"}
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} />}
        </button>

        <input
          type="range"
          min={0}
          max={count - 1}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={disabled}
          className={styles.slider}
          style={{
            background: `linear-gradient(to right, var(--blue) 0%, var(--blue) ${pct}%, var(--border) ${pct}%, var(--border) 100%)`,
          }}
          aria-label="Forecast day"
        />
      </div>

      <div className={styles.ends}>
        <span>{days[0] ? formatFull(days[0].date) : ""}</span>
        <span>{days[count - 1] ? formatFull(days[count - 1].date) : ""}</span>
      </div>
    </div>
  );
}
