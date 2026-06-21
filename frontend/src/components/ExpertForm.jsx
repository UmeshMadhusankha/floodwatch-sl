import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import Input from "./Input";
import Select from "./Select";
import LoadingSpinner from "./LoadingSpinner";
import FormStepper from "./FormStepper";
import { SECTIONS } from "../data/fieldConfig";

import styles from "./ExpertForm.module.css";

export default function ExpertForm({
  formData,
  onChange,
  onPredict,
  onBackToPredict,
  loading,
}) {
  const [current, setCurrent] = useState(0);
  const section = SECTIONS[current];
  const isLast = current === SECTIONS.length - 1;

  const goNext = () => setCurrent((c) => Math.min(c + 1, SECTIONS.length - 1));
  const goBack = () => setCurrent((c) => Math.max(c - 1, 0));

  const renderField = (field) => {
    if (field.type === "checkbox") {
      return (
        <label key={field.name} className={styles.checkboxRow}>
          <input
            type="checkbox"
            name={field.name}
            checked={formData[field.name]}
            onChange={onChange}
          />
          <span>
            <span className={styles.checkboxLabel}>{field.label}</span>
            {field.helper && <span className={styles.checkboxHelper}>{field.helper}</span>}
          </span>
        </label>
      );
    }

    const Comp = field.type === "select" ? Select : Input;
    return (
      <Comp
        key={field.name}
        field={field}
        value={formData[field.name]}
        onChange={onChange}
      />
    );
  };

  return (
    <div className={styles.wrap}>
      <button type="button" className={styles.backToPredictBtn} onClick={onBackToPredict}>
        <ArrowLeft size={16} strokeWidth={2.2} />
        Back to Predict
      </button>

      <div className={styles.header}>
        <h1 className={styles.title}>Expert Assessment</h1>
        <p className={styles.subtitle}>
          Step {current + 1} of {SECTIONS.length} — {section.title}
        </p>
      </div>

      <div className={styles.layout}>
        <FormStepper sections={SECTIONS} current={current} onJump={setCurrent} />

        <div className={styles.panel}>
          <h2 className={styles.sectionTitle}>{section.title}</h2>

          <div className={styles.grid}>{section.fields.map(renderField)}</div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.backBtn}
              onClick={goBack}
              disabled={current === 0}
            >
              <ArrowLeft size={16} strokeWidth={2.2} />
              Back
            </button>

            {isLast ? (
              <button
                type="button"
                className={styles.predictBtn}
                onClick={onPredict}
                disabled={loading}
              >
                {loading ? <LoadingSpinner label="Predicting..." /> : "Predict Flood Risk"}
              </button>
            ) : (
              <button type="button" className={styles.nextBtn} onClick={goNext}>
                Next
                <ArrowRight size={16} strokeWidth={2.2} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
