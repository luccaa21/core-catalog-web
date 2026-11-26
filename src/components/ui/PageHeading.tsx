import type { ReactNode } from "react";
import { plexCondensed } from "@/lib/fonts";
import styles from "./PageHeading.module.css";

type PageHeadingProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  size?: "md" | "lg";
  action?: ReactNode;
};

export function PageHeading({ title, subtitle, size = "md", action }: PageHeadingProps) {
  const heading = (
    <div className={size === "lg" ? styles.lg : styles.block}>
      <h1 className={`${styles.title} ${plexCondensed.className}`}>{title}</h1>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </div>
  );

  if (!action) return heading;

  return (
    <div className={styles.row}>
      {heading}
      {action}
    </div>
  );
}
