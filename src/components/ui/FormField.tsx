import type { ReactNode } from "react";
import styles from "./FormField.module.css";

type FormFieldProps = {
  label: string;
  htmlFor: string;
  hint?: ReactNode;
  size?: "md" | "lg";
  children: ReactNode;
};

export function FormField({ label, htmlFor, hint, size = "md", children }: FormFieldProps) {
  return (
    <div className={`${styles.field} ${size === "lg" ? styles.lg : ""}`}>
      <label className={styles.label} htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {hint && <p className={styles.hint}>{hint}</p>}
    </div>
  );
}
