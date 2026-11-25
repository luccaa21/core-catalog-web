import { Chip } from "@/components/ui/Chip";
import { PartCell } from "@/components/ui/PartCell";
import { Table, TableEmpty, TableHead, TableRow } from "@/components/ui/Table";
import { money } from "@/lib/format";
import type { BuildSummary } from "@/lib/types";
import styles from "./BuildItemsTable.module.css";

/** Tabela das peças de uma build, com quantidade, consumo, valores e linha de total. */
export function BuildItemsTable({ summary }: { summary: BuildSummary }) {
  const { items } = summary;
  const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Table>
      <TableHead className={styles.cols}>
        <span>Peça</span>
        <span>Categoria</span>
        <span className={styles.right}>Qtd.</span>
        <span className={styles.right}>Consumo</span>
        <span className={styles.right}>Unitário</span>
        <span className={styles.right}>Subtotal</span>
      </TableHead>

      {items.length === 0 && (
        <TableEmpty>
          Nenhuma peça ainda. Adicione peças do catálogo e acompanhe o gasto e o consumo aqui.
        </TableEmpty>
      )}

      {items.map((item) => (
        <TableRow key={item.componentId} className={styles.cols}>
          <PartCell name={item.name} brand={item.manufacturer} />
          <div>
            <Chip>{item.category}</Chip>
          </div>
          <div className={styles.right}>{item.quantity}</div>
          <div className={styles.right}>{item.powerWatts} W</div>
          <div className={styles.right}>{money(item.unitPriceCents)}</div>
          <div className={styles.subtotal}>{money(item.subtotalCents)}</div>
        </TableRow>
      ))}

      {items.length > 0 && (
        <TableRow className={`${styles.cols} ${styles.totalRow}`}>
          <div>Total</div>
          <div />
          <div className={styles.right}>{totalQty}</div>
          <div className={styles.right}>{summary.totalWatts} W</div>
          <div />
          <div className={styles.subtotal}>{money(summary.totalCents)}</div>
        </TableRow>
      )}
    </Table>
  );
}
