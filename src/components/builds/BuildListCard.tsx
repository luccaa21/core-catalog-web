import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { plexCondensed } from "@/lib/fonts";
import { money } from "@/lib/format";
import type { BuildSummaryItem } from "@/lib/types";
import styles from "./BuildListCard.module.css";

type BuildListCardProps = {
  build: BuildSummaryItem;
  onDelete: () => void;
};

/** Cartão de uma build na lista "Minhas builds": abre a build ou permite excluí-la. */
export function BuildListCard({ build, onDelete }: BuildListCardProps) {
  return (
    <div className={styles.card}>
      <Link href={`/builds/${build.id}`} className={styles.info}>
        <span className={`${styles.name} ${plexCondensed.className}`}>{build.name}</span>
        <span className={styles.budget}>Orçamento de {money(build.maxBudgetCents)}</span>
      </Link>
      <Button variant="danger" size="sm" onClick={onDelete}>
        Excluir
      </Button>
    </div>
  );
}
