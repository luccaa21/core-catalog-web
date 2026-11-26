import type { ReactNode } from "react";
import styles from "./Alert.module.css";

type AlertProps = {
  variant?: "error" | "notice";
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
