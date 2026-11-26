import { Input, Select } from "@/components/ui/Input";
import { SORT_LABELS, type SortKey } from "@/hooks/useCatalogFilters";
import styles from "./CatalogToolbar.module.css";

type CatalogToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  sort: SortKey;
  onSortChange: (value: SortKey) => void;
};

export function CatalogToolbar({
  search,
  onSearchChange,
  sort,
  onSortChange,
}: CatalogToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.search}>
        <Input
          placeholder="Buscar peça ou fabricante"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className={styles.sortWrap}>
        <label htmlFor="sort" className={styles.sortLabel}>
          Ordenar por
        </label>
        <div className={styles.select}>
          <Select
            id="sort"
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortKey)}
          >
            {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
              <option key={key} value={key}>
                {SORT_LABELS[key]}
              </option>
            ))}
          </Select>
        </div>
      </div>
    </div>
  );
}
