import styles from "./Field.module.css";

/**
 * Labelled select. `field` is a config object from fieldConfig.js
 * ({ name, label, helper, options, required }).
 */
export default function Select({ field, value, onChange }) {
  const { name, label, helper, options = [], required, placeholder } = field;

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={name}>
        {label}
        {required && <span className={styles.req}>*</span>}
      </label>

      <select
        id={name}
        className={styles.control}
        name={name}
        required={required}
        value={value}
        onChange={onChange}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>

      {helper && <p className={styles.helper}>{helper}</p>}
    </div>
  );
}
