import type { HTMLAttributes, ReactNode } from "react";
import { EmptyMessage } from "./EmptyMessage";
import styles from "./Table.module.css";

type DivProps = HTMLAttributes<HTMLDivElement>;

function join(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

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

export function TableFooter({ children }: { children: ReactNode }) {
  return <p className={styles.footer}>{children}</p>;
}
