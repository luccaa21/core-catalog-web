import type { FormEvent, ReactNode } from "react";
import styles from "./Form.module.css";

/** Formulário em coluna, com espaçamento padrão entre os campos. */
export function Form({
  onSubmit,
  children,
}: {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
}) {
  return (
    <form onSubmit={onSubmit} className={styles.form}>
      {children}
    </form>
  );
}

/** Linha de botões no fim de um formulário. */
export function FormActions({ children }: { children: ReactNode }) {
  return <div className={styles.actions}>{children}</div>;
}
