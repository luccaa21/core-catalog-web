import type { ReactNode } from "react";
import styles from "./EmptyMessage.module.css";

/** Mensagem centralizada para listas vazias ou em carregamento. */
export function EmptyMessage({ children }: { children: ReactNode }) {
  return <div className={styles.empty}>{children}</div>;
}
