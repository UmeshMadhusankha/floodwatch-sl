import { Gauge, Zap, ArrowRight } from "lucide-react";

import styles from "./ModeSelector.module.css";

const MODES = [
  {
    id: "expert",
    icon: Gauge,
    title: "Expert Mode",
    tag: "Most accurate",
    subtitle: "For technical users with full environmental data",
    description:
      "Provides the most precise flood risk score by using all 33 environmental and geographic parameters. Recommended for insurance assessors, civil engineers, and disaster planning officials with access to detailed location data.",
    cta: "Use Expert Mode",
  },
  {
    id: "quick",
    icon: Zap,
    title: "Quick Mode",
    tag: "Fast & easy",
    subtitle: "For field officers and quick assessments",
    description:
      "Get a fast, reliable flood risk estimate by entering only essential location and weather information. Recommended for disaster response teams, NGO field workers, and rapid risk screening.",
    cta: "Use Quick Mode",
  },
];

export default function ModeSelector({ onSelect }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h1 className={styles.title}>Flood Risk Prediction</h1>
        <p className={styles.subtitle}>
          Choose how you'd like to assess flood risk for a location.
        </p>
      </div>

      <div className={styles.cards}>
        {MODES.map(({ id, icon: Icon, title, tag, subtitle, description, cta }) => (
          <button
            key={id}
            type="button"
            className={styles.card}
            onClick={() => onSelect(id)}
          >
            <div className={styles.cardTop}>
              <span className={styles.iconWrap}>
                <Icon size={24} strokeWidth={2.2} />
              </span>
              <span className={styles.tag}>{tag}</span>
            </div>

            <h2 className={styles.cardTitle}>{title}</h2>
            <p className={styles.cardSubtitle}>{subtitle}</p>
            <p className={styles.cardDesc}>{description}</p>

            <span className={styles.cta}>
              {cta}
              <ArrowRight size={16} strokeWidth={2.4} />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
