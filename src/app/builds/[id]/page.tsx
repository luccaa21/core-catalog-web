"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IBM_Plex_Sans, IBM_Plex_Sans_Condensed } from "next/font/google";
import {
  clearToken,
  getToken,
  isAuthenticated,
} from "../../login/auth_service";
import headerStyles from "../../catalog.module.css";
import styles from "./build-detail.module.css";

const plexSans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "600"] });
const plexCondensed = IBM_Plex_Sans_Condensed({
  subsets: ["latin"],
  weight: ["500", "600"],
});

const API = process.env.NEXT_PUBLIC_API_URL;

type BuildItem = {
  componentId: number;
  name: string;
  category: string;
  manufacturer: string;
  unitPriceCents: number;
  powerWatts: number;
  quantity: number;
  subtotalCents: number;
};

type Summary = {
  name: string;
  owner: string;
  totalCents: number;
  totalWatts: number;
  maxBudgetCents: number;
  overBudget: boolean;
  items: BuildItem[];
};

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const CATEGORY_COLORS: Record<string, string> = {
  CPU: "var(--color-ruler-1)",
  GPU: "var(--color-ruler-2)",
  RAM: "var(--color-ruler-3)",
  Armazenamento: "var(--color-ruler-4)",
};
const FALLBACK_COLORS = [
  "var(--color-ruler-5)",
  "var(--color-ruler-3)",
  "var(--color-ruler-2)",
];

function money(cents: number) {
  return currency.format(cents / 100);
}

// Marcas da escala: "R$ 2 mil", "R$ 4 mil"...
function formatMark(cents: number) {
  const reais = cents / 100;
  if (reais === 0) return "R$ 0";
  if (reais >= 1000) {
    return `R$ ${(reais / 1000).toLocaleString("pt-BR", {
      maximumFractionDigits: 1,
    })} mil`;
  }
  return currency.format(reais);
}

export default function BuildDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [authed, setAuthed] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace(`/login?next=${encodeURIComponent(`/builds/${id}`)}`);
      return;
    }
    setAuthed(true);

    async function load() {
      try {
        const response = await fetch(`${API}/builds/${id}/summary`, {
          headers: { Authorization: `Bearer ${getToken() ?? ""}` },
        });

        if (response.status === 401) {
          clearToken();
          router.replace(`/login?next=${encodeURIComponent(`/builds/${id}`)}`);
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
  }, [id]);

  function logout() {
    clearToken();
    router.push("/login");
  }

  // A escala vai até o maior valor entre o orçamento e o total,
  // para a régua não sair da tela quando a build estoura
  const scale = summary
    ? Math.max(summary.maxBudgetCents, summary.totalCents, 1)
    : 1;
  const pct = (cents: number) => `${(cents / scale) * 100}%`;

  const remaining = summary ? summary.maxBudgetCents - summary.totalCents : 0;
  const totalQty = summary
    ? summary.items.reduce((sum, i) => sum + i.quantity, 0)
    : 0;

  return (
    <div className={`${styles.page} ${plexSans.className}`}>
      <header className={headerStyles.header}>
        <div className={headerStyles.headerLeft}>
          <Link href="/" className={`${headerStyles.brand} ${plexCondensed.className}`}>
            Core Catalog
          </Link>
          <nav className={headerStyles.nav}>
            <Link href="/" className={headerStyles.navLink}>
              Catálogo
            </Link>
            <Link
              href="/builds"
              className={`${headerStyles.navLink} ${headerStyles.navLinkStrong}`}
            >
              Builds
            </Link>
          </nav>
        </div>
        <div className={headerStyles.actions}>
          <button type="button" className={headerStyles.btnSecondary} onClick={logout}>
            Sair
          </button>
          <Link href="/" className={headerStyles.btnPrimary}>
            Catálogo
          </Link>
        </div>
      </header>

      {authed && (
        <main className={styles.content}>
          {error && (
            <div className={headerStyles.alert} role="alert">
              {error}
            </div>
          )}

          {loading && !error && <p className={styles.empty}>Carregando build...</p>}

          {summary && (
            <>
              <div className={styles.titleRow}>
                <div className={styles.titleBlock}>
                  <h1 className={`${styles.title} ${plexCondensed.className}`}>
                    {summary.name}
                  </h1>
                  <p className={styles.subtitle}>Build de {summary.owner}</p>
                </div>
                <Link
                  href={`/?buildId=${id}`}
                  className={headerStyles.btnPrimary}
                >
                  Adicionar peça
                </Link>
              </div>

              {summary.overBudget && (
                <div className={headerStyles.alert} role="alert">
                  Esta build está acima do orçamento em{" "}
                  {money(summary.totalCents - summary.maxBudgetCents)}. Troque uma peça ou aumente o orçamento.
                </div>
              )}

              <section className={styles.card}>
                <div className={styles.values}>
                  <div className={styles.gasto}>
                    <p className={`${styles.gastoValue} ${plexCondensed.className}`}>
                      {money(summary.totalCents)}
                    </p>
                    <span className={styles.gastoOf}>
                      de {money(summary.maxBudgetCents)} de orçamento
                    </span>
                  </div>
                  <div className={styles.resto}>
                    <span className={summary.overBudget ? styles.overText : undefined}>
                      {remaining >= 0
                        ? `Cabem mais ${money(remaining)}`
                        : `Passou ${money(-remaining)}`}
                    </span>
                    <span>{summary.totalWatts} W de consumo</span>
                  </div>
                </div>

                <div className={styles.ruler}>
                  <div className={styles.track} aria-hidden="true">
                    {summary.items.map((item, index) => (
                      <div
                        key={item.componentId}
                        className={styles.segment}
                        style={{
                          width: pct(item.subtotalCents),
                          background:
                            CATEGORY_COLORS[item.category] ??
                            FALLBACK_COLORS[index % FALLBACK_COLORS.length],
                        }}
                      />
                    ))}
                  </div>

                  <div className={styles.scale}>
                    <div className={styles.limit} style={{ left: pct(summary.maxBudgetCents) }} />
                    {[0, 25, 50, 75, 100].map((p) => {
                      const value = (summary.maxBudgetCents * p) / 100;
                      const left = pct(value);
                      return (
                        <div key={p}>
                          <div className={styles.mark} style={{ left }} />
                          <span
                            className={styles.markLabel}
                            style={{
                              left,
                              transform:
                                p === 0
                                  ? "none"
                                  : p === 100
                                  ? "translateX(-100%)"
                                  : "translateX(-50%)",
                            }}
                          >
                            {formatMark(value)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className={styles.legend}>
                    {summary.items.map((item, index) => (
                      <div key={item.componentId} className={styles.legendItem}>
                        <span
                          className={styles.dot}
                          style={{
                            background:
                              CATEGORY_COLORS[item.category] ??
                              FALLBACK_COLORS[index % FALLBACK_COLORS.length],
                          }}
                        />
                        <span>{item.category}</span>
                        <span className={styles.legendPrice}>
                          {money(item.unitPriceCents)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section className={styles.table}>
                <div className={styles.tableHead}>
                  <span>Peça</span>
                  <span>Categoria</span>
                  <span className={styles.right}>Qtd.</span>
                  <span className={styles.right}>Consumo</span>
                  <span className={styles.right}>Unitário</span>
                  <span className={styles.right}>Subtotal</span>
                </div>

                {summary.items.length === 0 && (
                  <div className={styles.empty}>
                    Nenhuma peça ainda. Adicione peças do catálogo e acompanhe o gasto e o consumo aqui.
                  </div>
                )}

                {summary.items.map((item) => (
                  <div key={item.componentId} className={styles.row}>
                    <div>
                      <span className={styles.itemName}>{item.name}</span>
                      <span className={styles.itemBrand}>{item.manufacturer}</span>
                    </div>
                    <div>
                      <span className={styles.chip}>{item.category}</span>
                    </div>
                    <div className={styles.right}>{item.quantity}</div>
                    <div className={styles.right}>{item.powerWatts} W</div>
                    <div className={styles.right}>{money(item.unitPriceCents)}</div>
                    <div className={styles.subtotal}>{money(item.subtotalCents)}</div>
                  </div>
                ))}

                {summary.items.length > 0 && (
                  <div className={styles.totalRow}>
                    <div>Total</div>
                    <div />
                    <div className={styles.right}>{totalQty}</div>
                    <div className={styles.right}>{summary.totalWatts} W</div>
                    <div />
                    <div className={styles.subtotal}>{money(summary.totalCents)}</div>
                  </div>
                )}
              </section>
            </>
          )}
        </main>
      )}
    </div>
  );
}