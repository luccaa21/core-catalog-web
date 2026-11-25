import type { ReactNode } from "react";
import styles from "./SplitLayout.module.css";

type SplitLayoutProps = {
  /** "builder": telas de build e perfil. "auth": login e cadastro. */
  variant: "builder" | "auth";
  /** Coluna do formulário (à esquerda). */
  form: ReactNode;
  /** Painel de prévia (à direita). */
  preview: ReactNode;
};

/** Tela dividida em formulário e painel de prévia; empilha em telas estreitas. */
export function SplitLayout({ variant, form, preview }: SplitLayoutProps) {
  return (
    <main className={`${styles.layout} ${styles[variant]}`}>
      <section className={styles.form}>{form}</section>
      <aside className={styles.preview}>{preview}</aside>
    </main>
  );
}
