import Link from "next/link";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import type { BuildSummaryItem, Component } from "@/lib/types";
import styles from "./BuildPicker.module.css";

type BuildPickerProps = {
  component: Component;
  builds: Pick<BuildSummaryItem, "id" | "name">[];
  onPick: (buildId: number) => void;
  onCancel: () => void;
};

export function BuildPicker({ component, builds, onPick, onCancel }: BuildPickerProps) {
  return (
    <Alert variant="notice">
      <p className={styles.question}>
        Escolha a build para adicionar <strong>{component.name}</strong>:
      </p>
      {builds.length === 0 ? (
        <p className={styles.empty}>
          Você ainda não tem builds. <Link href="/builds/new">Criar build</Link>
        </p>
      ) : (
        <div className={styles.options}>
          {builds.map((b) => (
            <Button key={b.id} size="sm" onClick={() => onPick(b.id)}>
              {b.name}
            </Button>
          ))}
          <Button variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      )}
    </Alert>
  );
}
