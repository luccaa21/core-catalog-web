import type { ReactNode } from "react";
import { plexSans } from "@/lib/fonts";
import styles from "./PageShell.module.css";

type PageShellProps = {
  column?: boolean;
  centered?: boolean;
  children: ReactNode;
};

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
