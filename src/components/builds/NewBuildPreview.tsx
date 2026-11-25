import { plexCondensed } from "@/lib/fonts";
import { money } from "@/lib/format";
import { BudgetScale } from "./BudgetScale";
import { BudgetTrack } from "./BudgetTrack";
import styles from "./NewBuildPreview.module.css";

type NewBuildPreviewProps = {
  name: string;
  budgetCents: number;
};

/** Prévia da régua enquanto a build está sendo criada (ainda sem peças). */
export function NewBuildPreview({ name, budgetCents }: NewBuildPreviewProps) {
  return (
    <>
      <h2 className={`${styles.title} ${plexCondensed.className}`}>
        {name.trim() || "Nova build"}
      </h2>

      <div className={styles.totals}>
        <p className={`${styles.totalValue} ${plexCondensed.className}`}>{money(0)}</p>
        <span className={styles.totalOf}>de {money(budgetCents)}</span>
      </div>

      <div>
        <BudgetTrack />
        <BudgetScale budgetCents={budgetCents} />
      </div>

      <p className={styles.empty}>
        Nenhuma peça ainda. Depois de criar a build, adicione peças do catálogo e acompanhe o gasto e o consumo aqui.
      </p>
    </>
  );
}
