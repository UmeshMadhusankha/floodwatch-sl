import { AlertTriangle, RotateCw } from "lucide-react";

import styles from "./ErrorAlert.module.css";

export default function ErrorAlert({ message, onRetry }) {
  if (!message) return null;

  return (
    <div className={styles.alert} role="alert">
      <AlertTriangle size={18} strokeWidth={2.2} className={styles.icon} />
      <span className={styles.message}>{message}</span>
      {onRetry && (
        <button type="button" className={styles.retry} onClick={onRetry}>
          <RotateCw size={14} strokeWidth={2.2} />
          Retry
        </button>
      )}
    </div>
  );
}
