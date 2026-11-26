import type { FormEvent, ReactNode } from "react";
import styles from "./Form.module.css";

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

export function FormActions({ children }: { children: ReactNode }) {
  return <div className={styles.actions}>{children}</div>;
}
