import { Check } from "lucide-react";

import styles from "./FormStepper.module.css";

/**
 * Sticky vertical stepper. `sections` is the SECTIONS array.
 * `current` is the active index; clicking a step calls onJump(index).
 */
export default function FormStepper({ sections, current, onJump }) {
  return (
    <nav className={styles.stepper} aria-label="Form sections">
      <ol className={styles.list}>
        {sections.map((section, idx) => {
          const state =
            idx === current ? "active" : idx < current ? "done" : "upcoming";
          return (
            <li key={section.id}>
              <button
                type="button"
                className={`${styles.step} ${styles[state]}`}
                onClick={() => onJump(idx)}
              >
                <span className={styles.marker}>
                  {state === "done" ? <Check size={14} strokeWidth={3} /> : idx + 1}
                </span>
                <span className={styles.text}>
                  <span className={styles.stepLabel}>Step {idx + 1}</span>
                  <span className={styles.stepTitle}>{section.title}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
