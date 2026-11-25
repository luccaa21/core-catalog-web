import type { ReactNode } from "react";
import { plexSans } from "@/lib/fonts";
import styles from "./PageShell.module.css";

type PageShellProps = {
  /** Empilha o conteúdo em coluna (admin e telas de autenticação). */
  column?: boolean;
  /** Centraliza o conteúdo na vertical (telas de autenticação). */
  centered?: boolean;
  children: ReactNode;
};

/** Container de página: fundo, cores, fonte e altura mínima. */
export function PageShell({ column, centered, children }: PageShellProps) {
  const classes = [
    styles.page,
    plexSans.className,
    (column || centered) && styles.column,
    centered && styles.centered,
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={classes}>{children}</div>;
}
