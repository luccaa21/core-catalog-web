import styles from "./CatalogSidebar.module.css";

type FilterOption = { name: string; count: number };

type CatalogSidebarProps = {
  totalCount: number;
  categories: FilterOption[];
  category: string;
  onCategoryChange: (category: string) => void;
  manufacturers: FilterOption[];
  selectedManufacturers: string[];
  onToggleManufacturer: (name: string) => void;
};

/** Filtros laterais do catálogo: categoria (uma) e fabricantes (várias). */
export function CatalogSidebar({
  totalCount,
  categories,
  category,
  onCategoryChange,
  manufacturers,
  selectedManufacturers,
  onToggleManufacturer,
}: CatalogSidebarProps) {
  const categoryClass = (active: boolean) =>
    `${styles.categoryBtn} ${active ? styles.categoryActive : ""}`;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.group}>
        <p className={styles.title}>Categoria</p>
        <button
          type="button"
          className={categoryClass(category === "")}
          onClick={() => onCategoryChange("")}
        >
          <span>Todas</span>
          <span>{totalCount}</span>
        </button>
        {categories.map((c) => (
          <button
            key={c.name}
            type="button"
            className={categoryClass(category === c.name)}
            onClick={() => onCategoryChange(c.name)}
          >
            <span>{c.name}</span>
            <span>{c.count}</span>
          </button>
        ))}
      </div>

      <div className={styles.group}>
        <p className={styles.title}>Fabricante</p>
        {manufacturers.map((m) => (
          <label key={m.name} className={styles.checkRow}>
            <input
              type="checkbox"
              checked={selectedManufacturers.includes(m.name)}
              onChange={() => onToggleManufacturer(m.name)}
            />
            <span>{m.name}</span>
            <span className={styles.count}>{m.count}</span>
          </label>
        ))}
      </div>
    </aside>
  );
}
