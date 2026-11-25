import Link from "next/link";
import type { FormEvent, ReactNode } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { PageHeading } from "@/components/ui/PageHeading";
import styles from "./AuthForm.module.css";

type AuthFormProps = {
  title: string;
  subtitle: string;
  error: string;
  loading: boolean;
  submitLabel: string;
  loadingLabel: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  /** Texto e link para a outra tela (ex.: "Ainda não tem conta?" + "Criar conta"). */
  alternative: { text: string; linkLabel: string; href: string };
  /** Campos do formulário. */
  children: ReactNode;
};

/** Coluna do formulário das telas de login e cadastro. */
export function AuthForm({
  title,
  subtitle,
  error,
  loading,
  submitLabel,
  loadingLabel,
  onSubmit,
  alternative,
  children,
}: AuthFormProps) {
  return (
    <>
      <PageHeading size="lg" title={title} subtitle={subtitle} />

      {error && (
        <Alert large>{error}</Alert>
      )}

      <form onSubmit={onSubmit} className={styles.form}>
        {children}
        <Button type="submit" size="lg" fullWidth disabled={loading}>
          {loading ? loadingLabel : submitLabel}
        </Button>
      </form>

      <p className={styles.alternative}>
        {alternative.text}
        <Link className={styles.link} href={alternative.href}>
          {alternative.linkLabel}
        </Link>
      </p>
    </>
  );
}
