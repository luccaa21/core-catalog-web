import type { ReactNode } from "react";
import styles from "./EmptyMessage.module.css";

export function EmptyMessage({ children }: { children: ReactNode }) {
  return <div className={styles.empty}>{children}</div>;
}
