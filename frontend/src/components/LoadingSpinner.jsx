import styles from "./LoadingSpinner.module.css";

export default function LoadingSpinner({ size = 18, label, variant = "light" }) {
  const spinnerClass =
    variant === "dark" ? `${styles.spinner} ${styles.dark}` : styles.spinner;
  return (
    <span className={styles.wrap}>
      <span
        className={spinnerClass}
        style={{ width: size, height: size }}
        aria-hidden="true"
      />
      {label && <span className={styles.label}>{label}</span>}
    </span>
  );
}
