import type { ReactNode } from "react";
import styles from "./Chip.module.css";

export function Chip({ children }: { children: ReactNode }) {
  return <span className={styles.chip}>{children}</span>;
}
