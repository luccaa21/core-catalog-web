import { Button } from "@/components/ui/Button";
import { plexCondensed } from "@/lib/fonts";
import styles from "./AdminIndexItem.module.css";

type AdminIndexItemProps = {
  title: string;
  description: string;
  /** Quantidade cadastrada; null enquanto carrega (mostra "—"). */
  count: number | null;
  countLabel: string;
  href: string;
  linkLabel: string;
};

/** Linha do painel do admin: resumo de um cadastro, contagem e atalho para gerenciá-lo. */
export function AdminIndexItem({
  title,
  description,
  count,
  countLabel,
  href,
  linkLabel,
}: AdminIndexItemProps) {
  return (
    <div className={styles.item}>
      <div className={styles.text}>
        <p className={`${styles.title} ${plexCondensed.className}`}>{title}</p>
        <p className={styles.desc}>{description}</p>
      </div>
      <div className={styles.count}>
        <p className={`${styles.countValue} ${plexCondensed.className}`}>{count ?? "—"}</p>
        <span className={styles.countLabel}>{countLabel}</span>
      </div>
      <Button href={href} variant="secondary" className={styles.link}>
        {linkLabel}
      </Button>
    </div>
  );
}
