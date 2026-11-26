import { formatMark } from "@/lib/format";
import styles from "./BudgetScale.module.css";

const PERCENTS = [0, 25, 50, 75, 100];

type BudgetScaleProps = {
  budgetCents: number;
  scaleCents?: number;
  showLimit?: boolean;
};

function labelTransform(percent: number) {
  if (percent === 0) return "none";
  if (percent === 100) return "translateX(-100%)";
  return "translateX(-50%)";
}

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
