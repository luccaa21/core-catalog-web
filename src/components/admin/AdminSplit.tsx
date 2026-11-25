import type { FormEvent, ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { plexCondensed } from "@/lib/fonts";
import styles from "./AdminSplit.module.css";

type AdminFormCardProps = {
  title: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  saving: boolean;
  submitLabel: string;
  savingLabel: string;
  /** Mostra o botão "Cancelar" (ex.: durante uma edição). */
  onCancel?: () => void;
  /** Botão principal ocupa toda a largura do cartão. */
  stretch?: boolean;
  children: ReactNode;
};

/** Cartão de formulário das telas do admin (coluna da esquerda). */
export function AdminFormCard({
  title,
  onSubmit,
  saving,
  submitLabel,
  savingLabel,
  onCancel,
  stretch,
  children,
}: AdminFormCardProps) {
  return (
    <form onSubmit={onSubmit} className={styles.card}>
      <h2 className={`${styles.cardTitle} ${plexCondensed.className}`}>{title}</h2>
      {children}
      <div className={styles.actions}>
        <Button type="submit" fullWidth={stretch} disabled={saving}>
          {saving ? savingLabel : submitLabel}
        </Button>
        {onCancel && (
          <Button variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}

/** Layout do admin: formulário à esquerda e lista à direita; empilha em telas estreitas. */
export function AdminSplit({ form, children }: { form: ReactNode; children: ReactNode }) {
  return (
    <div className={styles.columns}>
      {form}
      <div className={styles.main}>{children}</div>
    </div>
  );
}
