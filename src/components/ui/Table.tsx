import type { HTMLAttributes, ReactNode } from "react";
import { EmptyMessage } from "./EmptyMessage";
import styles from "./Table.module.css";

type DivProps = HTMLAttributes<HTMLDivElement>;

function join(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

/**
 * Tabela em grid. Quem usa define as colunas com a variável CSS `--cols`
 * (e, se quiser, `--row-min-height`) em uma classe passada ao cabeçalho e às linhas.
 */
export function Table({ className, ...props }: DivProps) {
  return <div className={join(styles.table, className)} {...props} />;
}

export function TableHead({ className, ...props }: DivProps) {
  return <div className={join(styles.head, className)} {...props} />;
}

export function TableRow({ className, ...props }: DivProps) {
  return <div className={join(styles.row, className)} {...props} />;
}

export function TableEmpty({ children }: { children: ReactNode }) {
  return <EmptyMessage>{children}</EmptyMessage>;
}

/** Rodapé pequeno abaixo da tabela, ex.: "Mostrando 6 peças". */
export function TableFooter({ children }: { children: ReactNode }) {
  return <p className={styles.footer}>{children}</p>;
}
