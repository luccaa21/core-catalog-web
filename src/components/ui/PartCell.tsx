import styles from "./PartCell.module.css";

export function PartCell({ name, brand }: { name: string; brand: string }) {
  return (
    <div>
      <span className={styles.name}>{name}</span>
      <span className={styles.brand}>{brand}</span>
    </div>
  );
}
