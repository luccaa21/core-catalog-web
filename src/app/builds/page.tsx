"use client";

import { useEffect, useState } from "react";
import { BuildListCard } from "@/components/builds/BuildListCard";
import { AppHeader } from "@/components/layout/AppHeader";
import { PageContent } from "@/components/layout/PageContent";
import { PageShell } from "@/components/layout/PageShell";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { EmptyMessage } from "@/components/ui/EmptyMessage";
import { PageHeading } from "@/components/ui/PageHeading";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { apiFetch } from "@/lib/api";
import type { BuildSummaryItem } from "@/lib/types";

export default function BuildsListPage() {
  const { authed, expireSession, logout } = useRequireAuth("/builds");

  const [builds, setBuilds] = useState<BuildSummaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authed) return;

    async function load() {
      try {
        const response = await apiFetch("/builds/mine", { auth: true });

        if (response.status === 401) {
          expireSession();
          return;
        }
        if (!response.ok) throw new Error();

        setBuilds(await response.json());
      } catch {
        setError("Não foi possível carregar suas builds.");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [authed, expireSession]);

  return (
    <PageShell>
      <AppHeader nav={[{ label: "Catálogo", href: "/" }, { label: "Builds", strong: true }]}>
        <Button href="/" variant="secondary">
          Catálogo
        </Button>
        <Button variant="secondary" onClick={logout}>
          Sair
        </Button>
        <Button href="/builds/new">Nova build</Button>
      </AppHeader>

      {authed && (
        <PageContent tight>
          <PageHeading title="Builds" subtitle="Suas montagens e o orçamento de cada uma." />

          {error && <Alert>{error}</Alert>}

          {loading && <EmptyMessage>Carregando builds...</EmptyMessage>}

          {!loading && !error && builds.length === 0 && (
            <EmptyMessage>Você ainda não tem builds. Crie a primeira para começar.</EmptyMessage>
          )}

          {builds.map((build) => (
            <BuildListCard key={build.id} build={build} />
          ))}
        </PageContent>
      )}
    </PageShell>
  );
}
