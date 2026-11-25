import type { ReactNode } from "react";
import { plexCondensed } from "@/lib/fonts";
import styles from "./PageHeading.module.css";

type PageHeadingProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  /** "lg" é o tamanho usado nas telas de login e cadastro. */
  size?: "md" | "lg";
  /** Botão ou link alinhado à direita do título. */
  action?: ReactNode;
};

/** Título (h1) com subtítulo opcional, no padrão visual das telas. */
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
