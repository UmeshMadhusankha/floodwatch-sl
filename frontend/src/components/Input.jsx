import styles from "./Field.module.css";

/**
 * Labelled input. `field` is a config object from fieldConfig.js
 * ({ name, label, helper, unit, placeholder, type, step, min, max, required }).
 */
export default function Input({ field, value, onChange }) {
  const { name, label, helper, unit, placeholder, type = "text", step, min, max, required } = field;

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={name}>
        {label}
        {unit && <span className={styles.unit}>({unit})</span>}
        {required && <span className={styles.req}>*</span>}
      </label>

      <input
        id={name}
        className={styles.control}
        name={name}
        type={type}
        step={step}
        min={min}
        max={max}
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={onChange}
      />

      {helper && <p className={styles.helper}>{helper}</p>}
    </div>
  );
}
