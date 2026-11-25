import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { PartCell } from "@/components/ui/PartCell";
import { Table, TableEmpty, TableHead, TableRow } from "@/components/ui/Table";
import { money } from "@/lib/format";
import type { Component } from "@/lib/types";
import styles from "./ComponentsTable.module.css";

type ComponentsTableProps = {
  components: Component[];
  loading?: boolean;
  emptyMessage: string;
  /** Quando informado, mostra o botão "Adicionar" em cada linha. */
  onAdd?: (component: Component) => void;
};

/** Tabela de peças (nome, categoria, consumo e preço), usada no catálogo e no admin. */
export function ComponentsTable({
  components,
  loading = false,
  emptyMessage,
  onAdd,
}: ComponentsTableProps) {
  const cols = onAdd ? styles.withAction : styles.cols;

  return (
    <Table>
      <TableHead className={cols}>
        <span>Peça</span>
        <span>Categoria</span>
        <span style={{ textAlign: "right" }}>Consumo</span>
        <span style={{ textAlign: "right" }}>Preço</span>
        {onAdd && <span />}
      </TableHead>

      {loading && <TableEmpty>Carregando peças...</TableEmpty>}
      {!loading && components.length === 0 && <TableEmpty>{emptyMessage}</TableEmpty>}

      {components.map((c) => (
        <TableRow key={c.id} className={cols}>
          <PartCell name={c.name} brand={c.manufacturer.name} />
          <div>
            <Chip>{c.category}</Chip>
          </div>
          <div className={styles.right}>{c.powerWatts} W</div>
          <div className={styles.price}>{money(c.priceCents)}</div>
          {onAdd && (
            <div className={styles.action}>
              <Button size="sm" onClick={() => onAdd(c)}>
                Adicionar
              </Button>
            </div>
          )}
        </TableRow>
      ))}
    </Table>
  );
}
