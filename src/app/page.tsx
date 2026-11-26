"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BuildPicker } from "@/components/catalog/BuildPicker";
import { CatalogSidebar } from "@/components/catalog/CatalogSidebar";
import { CatalogToolbar } from "@/components/catalog/CatalogToolbar";
import { ComponentsTable } from "@/components/catalog/ComponentsTable";
import { AppHeader } from "@/components/layout/AppHeader";
import { PageContent } from "@/components/layout/PageContent";
import { PageShell } from "@/components/layout/PageShell";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { PageHeading } from "@/components/ui/PageHeading";
import { TableFooter } from "@/components/ui/Table";
import { useCatalogFilters } from "@/hooks/useCatalogFilters";
import { apiFetch, readApiError } from "@/lib/api";
import { clearToken, isAuthenticated } from "@/lib/auth";
import type { BuildSummaryItem, Component } from "@/lib/types";
import styles from "./catalog.module.css";

export default function CatalogPage() {
  const router = useRouter();

  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authed, setAuthed] = useState(false);
  const [message, setMessage] = useState("");

  const [buildIdParam, setBuildIdParam] = useState<number | null>(null);
  const [pendingComponent, setPendingComponent] = useState<Component | null>(null);
  const [myBuilds, setMyBuilds] = useState<Pick<BuildSummaryItem, "id" | "name">[]>([]);

  const filters = useCatalogFilters(components);

  useEffect(() => {
    setAuthed(isAuthenticated());

    const idFromUrl = new URLSearchParams(window.location.search).get("buildId");
    if (idFromUrl) setBuildIdParam(Number(idFromUrl));

    apiFetch("/components")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data: Component[]) => setComponents(data))
      .catch(() =>
        setError("Não foi possível carregar o catálogo. Verifique se a API está rodando.")
      )
      .finally(() => setLoading(false));
  }, []);

  function requireLogin(destination: string, action?: () => void) {
    if (!isAuthenticated()) {
      router.push(`/login?next=${encodeURIComponent(destination)}`);
      return;
    }
    action?.();
  }

  async function addToBuild(component: Component) {
    setError("");
    setMessage("");

    if (buildIdParam) {
      await addItemToBuild(buildIdParam, component);
      return;
    }

    const response = await apiFetch("/builds/mine", { auth: true });
    if (!response.ok) {
      setError("Não foi possível carregar suas builds.");
      return;
    }
    setMyBuilds(await response.json());
    setPendingComponent(component);
  }

  async function addItemToBuild(buildId: number, component: Component) {
    setError("");
    try {
      const response = await apiFetch(`/builds/${buildId}/items`, {
        method: "POST",
        auth: true,
        body: { componentId: component.id, quantity: 1 },
      });

      if (!response.ok) {
        setError(await readApiError(response, "Não foi possível adicionar a peça."));
        return;
      }

      setPendingComponent(null);
      setMessage(`${component.name} adicionada à build.`);
    } catch {
      setError("Erro de conexão. Verifique se a API está rodando.");
    }
  }

  function logout() {
    clearToken();
    setAuthed(false);
    setMessage("");
  }

  return (
    <PageShell>
      <AppHeader
        nav={[
          { label: "Catálogo" },
          {
            label: "Builds",
            strong: true,
            onClick: () => requireLogin("/builds", () => router.push("/builds")),
          },
        ]}
      >
        {authed ? (
          <>
            <Button href="/admin" variant="secondary">
              Admin
            </Button>
            <Button variant="secondary" onClick={logout}>
              Sair
            </Button>
            <Button href="/">Catálogo</Button>
          </>
        ) : (
          <>
            <Button href="/login?next=/" variant="secondary">
              Entrar
            </Button>
            <Button href="/register">Criar conta</Button>
          </>
        )}
      </AppHeader>

      <PageContent>
        <PageHeading
          title="Catálogo de peças"
          subtitle="Compare preço e consumo antes de montar sua build."
        />

        {error && <Alert>{error}</Alert>}
        {message && <Alert variant="notice">{message}</Alert>}

        <div className={styles.layout}>
          <CatalogSidebar
            totalCount={components.length}
            categories={filters.categories}
            category={filters.category}
            onCategoryChange={filters.setCategory}
            manufacturers={filters.manufacturers}
            selectedManufacturers={filters.selectedManufacturers}
            onToggleManufacturer={filters.toggleManufacturer}
          />

          <section className={styles.list}>
            <CatalogToolbar
              search={filters.search}
              onSearchChange={filters.setSearch}
              sort={filters.sort}
              onSortChange={filters.setSort}
            />

            {pendingComponent && (
              <BuildPicker
                component={pendingComponent}
                builds={myBuilds}
                onPick={(buildId) => void addItemToBuild(buildId, pendingComponent)}
                onCancel={() => setPendingComponent(null)}
              />
            )}

            <ComponentsTable
              components={filters.visible}
              loading={loading}
              emptyMessage="Nenhuma peça encontrada."
              onAdd={(c) =>
                requireLogin(
                  window.location.pathname + window.location.search,
                  () => void addToBuild(c)
                )
              }
            />

            {!loading && (
              <TableFooter>
                Mostrando {filters.visible.length} de {components.length} peças
              </TableFooter>
            )}
          </section>
        </div>
      </PageContent>
    </PageShell>
  );
}
