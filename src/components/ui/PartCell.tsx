import styles from "./PartCell.module.css";

/** Célula "Peça": nome em destaque e fabricante embaixo. */
export function PartCell({ name, brand }: { name: string; brand: string }) {
  return (
    <div>
      <span className={styles.name}>{name}</span>
      <span className={styles.brand}>{brand}</span>
    </div>
  );
}
