import { Button } from "./Button";
import styles from "./RowActions.module.css";

type RowActionsProps = {
  onEdit: () => void;
  onDelete: () => void;
};

export function RowActions({ onEdit, onDelete }: RowActionsProps) {
  return (
    <div className={styles.actions}>
      <Button variant="secondary" size="sm" onClick={onEdit}>
        Editar
      </Button>
      <Button variant="danger" size="sm" onClick={onDelete}>
        Excluir
      </Button>
    </div>
  );
}
