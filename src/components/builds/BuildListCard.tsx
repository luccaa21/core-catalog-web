import Link from "next/link";
import { plexCondensed } from "@/lib/fonts";
import { money } from "@/lib/format";
import type { BuildSummaryItem } from "@/lib/types";
import styles from "./BuildListCard.module.css";

/** Cartão de uma build na lista "Minhas builds". */
export function BuildListCard({ build }: { build: BuildSummaryItem }) {
  return (
    <Link href={`/builds/${build.id}`} className={styles.card}>
      <span className={`${styles.name} ${plexCondensed.className}`}>{build.name}</span>
      <span className={styles.budget}>Orçamento de {money(build.maxBudgetCents)}</span>
    </Link>
  );
}
