import { formatMark } from "@/lib/format";
import styles from "./BudgetScale.module.css";

const PERCENTS = [0, 25, 50, 75, 100];

type BudgetScaleProps = {
  budgetCents: number;
  /**
   * Valor que ocupa 100% da largura. Por padrão é o orçamento; passe um valor maior
   * quando a build estourar, para a régua não sair da tela.
   */
  scaleCents?: number;
  /** Mostra a linha vermelha no limite do orçamento. */
  showLimit?: boolean;
};

function labelTransform(percent: number) {
  if (percent === 0) return "none";
  if (percent === 100) return "translateX(-100%)";
  return "translateX(-50%)";
}

/** Escala da régua: marcas a cada 25% do orçamento e, opcionalmente, o limite. */
export function BudgetScale({ budgetCents, scaleCents = budgetCents, showLimit }: BudgetScaleProps) {
  const pct = (cents: number) => `${(cents / scaleCents) * 100}%`;

  return (
    <div className={styles.scale}>
      {showLimit && <div className={styles.limit} style={{ left: pct(budgetCents) }} />}
      {PERCENTS.map((percent) => {
        const value = (budgetCents * percent) / 100;
        const left = pct(value);
        return (
          <div key={percent}>
            <div className={styles.mark} style={{ left }} />
            <span
              className={styles.markLabel}
              style={{ left, transform: labelTransform(percent) }}
            >
              {formatMark(value)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
