import { plexCondensed } from "@/lib/fonts";
import styles from "./BuildPreview.module.css";

export type PreviewItem = { category: string; name: string; price: string };

const SEGMENTS = [
  { width: "23.5%", color: "var(--color-brand)" },
  { width: "53.7%", color: "var(--color-brand-2)" },
  { width: "9.8%", color: "var(--color-brand-3)" },
  { width: "9.1%", color: "var(--color-brand-4)" },
];

export function BuildPreview({ items }: { items: PreviewItem[] }) {
  return (
    <>
      <h2 className={`${styles.title} ${plexCondensed.className}`}>
        Sua build, dentro do orçamento
      </h2>
      <p className={styles.text}>
        Some o preço e o consumo de cada peça e veja na régua quanto ainda cabe.
      </p>

      <div className={styles.track} aria-hidden="true">
        {SEGMENTS.map((segment) => (
          <div
            key={segment.width}
            className={styles.segment}
            style={{ width: segment.width, background: segment.color }}
          />
        ))}
      </div>

      <div className={styles.totals}>
        <span>R$ 7.746,00 de R$ 8.000,00</span>
        <span className={styles.watts}>357 W</span>
      </div>

      <div>
        {items.map((item) => (
          <div key={item.category} className={styles.itemRow}>
            <span className={styles.itemCategory}>{item.category}</span>
            <span className={styles.itemName}>{item.name}</span>
            <span className={styles.itemPrice}>{item.price}</span>
          </div>
        ))}
      </div>
    </>
  );
}
