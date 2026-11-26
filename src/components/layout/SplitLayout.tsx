import type { ReactNode } from "react";
import styles from "./SplitLayout.module.css";

type SplitLayoutProps = {
  variant: "builder" | "auth";
  form: ReactNode;
  preview: ReactNode;
};

export function SplitLayout({ variant, form, preview }: SplitLayoutProps) {
  return (
    <main className={`${styles.layout} ${styles[variant]}`}>
      <section className={styles.form}>{form}</section>
      <aside className={styles.preview}>{preview}</aside>
    </main>
  );
}
