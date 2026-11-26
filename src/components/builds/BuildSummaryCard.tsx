import { getCategoryColor } from "@/lib/categoryColors";
import { plexCondensed } from "@/lib/fonts";
import { money } from "@/lib/format";
import type { BuildSummary } from "@/lib/types";
import { BudgetScale } from "./BudgetScale";
import { BudgetTrack } from "./BudgetTrack";
import styles from "./BuildSummaryCard.module.css";

export function BuildSummaryCard({ summary }: { summary: BuildSummary }) {
  const scale = Math.max(summary.maxBudgetCents, summary.totalCents, 1);
  const remaining = summary.maxBudgetCents - summary.totalCents;

  const segments = summary.items.map((item, index) => ({
    key: item.componentId,
    width: `${(item.subtotalCents / scale) * 100}%`,
    color: getCategoryColor(item.category, index),
  }));

  return (
    <section className={styles.card}>
      <div className={styles.values}>
        <div className={styles.spent}>
          <p className={`${styles.spentValue} ${plexCondensed.className}`}>
            {money(summary.totalCents)}
          </p>
          <span className={styles.spentOf}>
            de {money(summary.maxBudgetCents)} de orçamento
          </span>
        </div>
        <div className={styles.rest}>
          <span className={summary.overBudget ? styles.overText : undefined}>
            {remaining >= 0 ? `Cabem mais ${money(remaining)}` : `Passou ${money(-remaining)}`}
          </span>
          <span>{summary.totalWatts} W de consumo</span>
        </div>
      </div>

      <div className={styles.ruler}>
        <BudgetTrack segments={segments} />
        <BudgetScale budgetCents={summary.maxBudgetCents} scaleCents={scale} showLimit />

        <div className={styles.legend}>
          {summary.items.map((item, index) => (
            <div key={item.componentId} className={styles.legendItem}>
              <span
                className={styles.dot}
                style={{ background: getCategoryColor(item.category, index) }}
              />
              <span>{item.category}</span>
              <span className={styles.legendPrice}>{money(item.unitPriceCents)}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
