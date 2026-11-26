import type { ReactNode } from "react";
import styles from "./ButtonGroup.module.css";

/** Botões lado a lado, com espaçamento padrão. */
export function ButtonGroup({ children }: { children: ReactNode }) {
  return <div className={styles.group}>{children}</div>;
}
