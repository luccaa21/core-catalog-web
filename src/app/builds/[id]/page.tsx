"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BuildItemsTable } from "@/components/builds/BuildItemsTable";
import { BuildSummaryCard } from "@/components/builds/BuildSummaryCard";
import { AppHeader } from "@/components/layout/AppHeader";
import { PageContent } from "@/components/layout/PageContent";
import { PageShell } from "@/components/layout/PageShell";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { ButtonGroup } from "@/components/ui/ButtonGroup";
import { EmptyMessage } from "@/components/ui/EmptyMessage";
import { PageHeading } from "@/components/ui/PageHeading";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { apiFetch, readApiError } from "@/lib/api";
import { money } from "@/lib/format";
import type { BuildSummary } from "@/lib/types";

export default function BuildDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { authed, expireSession, logout } = useRequireAuth(`/builds/${id}`);

  const [summary, setSummary] = useState<BuildSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authed) return;

    async function load() {
      try {
        const response = await apiFetch(`/builds/${id}/summary`, { auth: true });

        if (response.status === 401) {
          expireSession();
          return;
        }
        if (response.status === 404) {
          setError("Build não encontrada.");
          return;
        }
        if (!response.ok) throw new Error();

        setSummary(await response.json());
      } catch {
        setError("Não foi possível carregar a build. Verifique a API.");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [authed, id, expireSession]);

  async function removeBuild() {
    if (!summary || !confirm(`Excluir a build "${summary.name}"? Essa ação não pode ser desfeita.`)) {
      return;
    }
    setError("");

    try {
      const response = await apiFetch(`/builds/${id}`, { method: "DELETE", auth: true });

      if (response.status === 401) {
        expireSession();
        return;
      }
      if (!response.ok) {
        setError(await readApiError(response, "Não foi possível excluir a build."));
        return;
      }

      router.push("/builds");
    } catch {
      setError("Erro de conexão. Verifique se a API está rodando.");
    }
  }

  return (
    <PageShell>
      <AppHeader
        nav={[
          { label: "Catálogo", href: "/" },
          { label: "Builds", href: "/builds", strong: true },
        ]}
      >
        <Button variant="secondary" onClick={logout}>
          Sair
        </Button>
        <Button href="/">Catálogo</Button>
      </AppHeader>

      {authed && (
        <PageContent tight>
          {error && <Alert>{error}</Alert>}

          {loading && !error && <EmptyMessage>Carregando build...</EmptyMessage>}

          {summary && (
            <>
              <PageHeading
                title={summary.name}
                subtitle={`Build de ${summary.owner}`}
                action={
                  <ButtonGroup>
                    <Button variant="danger" onClick={() => void removeBuild()}>
                      Excluir build
                    </Button>
                    <Button href={`/?buildId=${id}`}>Adicionar peça</Button>
                  </ButtonGroup>
                }
              />

              {summary.overBudget && (
                <Alert>
                  Esta build está acima do orçamento em{" "}
                  {money(summary.totalCents - summary.maxBudgetCents)}. Troque uma peça ou
                  aumente o orçamento.
                </Alert>
              )}

              <BuildSummaryCard summary={summary} />
              <BuildItemsTable summary={summary} />
            </>
          )}
        </PageContent>
      )}
    </PageShell>
  );
}
