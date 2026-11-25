import type { ReactNode } from "react";
import styles from "./PageContent.module.css";

type PageContentProps = {
  /** Reduz o espaço vertical em telas estreitas. */
  tight?: boolean;
  children: ReactNode;
};

/** Área principal das telas com cabeçalho do site (coluna com espaçamento padrão). */
export function PageContent({ tight, children }: PageContentProps) {
  return <main className={`${styles.content} ${tight ? styles.tight : ""}`}>{children}</main>;
}
