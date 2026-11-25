import type { ReactNode } from "react";
import styles from "./Alert.module.css";

type AlertProps = {
  /** "error" (vermelho, role=alert) ou "notice" (informativo). */
  variant?: "error" | "notice";
  /** Margem superior, usada nas telas do admin. */
  spaced?: boolean;
  large?: boolean;
  children: ReactNode;
};

export function Alert({ variant = "error", spaced, large, children }: AlertProps) {
  const classes = [styles.alert, styles[variant], spaced && styles.spaced, large && styles.large]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} role={variant === "error" ? "alert" : undefined}>
      {children}
    </div>
  );
}
