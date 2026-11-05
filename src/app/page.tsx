"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IBM_Plex_Sans, IBM_Plex_Sans_Condensed } from "next/font/google";
import { clearToken, isAuthenticated } from "./login/auth_service";
import styles from "./catalog.module.css";

const plexSans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "600"] });
const plexCondensed = IBM_Plex_Sans_Condensed({
  subsets: ["latin"],
  weight: ["500", "600"],
});

const API = "http://localhost:3001";

type Component = {
  id: number;
  name: string;
  category: string;
  priceCents: number;
  powerWatts: number;
  manufacturer: { name: string };
};

type SortKey = "price-asc" | "price-desc" | "watts-asc" | "name";

const SORT_LABELS: Record<SortKey, string> = {
  "price-asc": "Menor preço",
  "price-desc": "Maior preço",
  "watts-asc": "Menor consumo",
  name: "Nome",
};

// Ordem das categorias como no protótipo; categorias extras vão para o fim
const CATEGORY_ORDER = ["CPU", "GPU", "Placa-mãe", "RAM", "Armazenamento", "Fonte"];

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function countBy<T>(items: T[], key: (item: T) => string) {
  const counts = new Map<string, number>();
  for (const item of items) {
    const k = key(item);
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return counts;
}

export default function CatalogPage() {
  const router = useRouter();

  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authed, setAuthed] = useState(false);

  const [category, setCategory] = useState("");
  const [selectedManufacturers, setSelectedManufacturers] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("price-asc");
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Lê o token só no navegador, para evitar diferença entre servidor e cliente
    setAuthed(isAuthenticated());

    fetch(`${API}/components`)
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

  // Categorias com contagem, na ordem do protótipo
  const categories = useMemo(() => {
    const counts = countBy(components, (c) => c.category);
    return [...counts.keys()]
      .sort((a, b) => {
        const ia = CATEGORY_ORDER.indexOf(a);
        const ib = CATEGORY_ORDER.indexOf(b);
        return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib) || a.localeCompare(b);
      })
      .map((name) => ({ name, count: counts.get(name) ?? 0 }));
  }, [components]);

  // Fabricantes com contagem, em ordem alfabética
  const manufacturers = useMemo(() => {
    const counts = countBy(components, (c) => c.manufacturer.name);
    return [...counts.keys()]
      .sort((a, b) => a.localeCompare(b, "pt-BR"))
      .map((name) => ({ name, count: counts.get(name) ?? 0 }));
  }, [components]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();

    const filtered = components.filter(
      (c) =>
        (!category || c.category === category) &&
        (selectedManufacturers.length === 0 ||
          selectedManufacturers.includes(c.manufacturer.name)) &&
        (!term ||
          c.name.toLowerCase().includes(term) ||
          c.manufacturer.name.toLowerCase().includes(term))
    );

    const sorted = [...filtered];
    switch (sort) {
      case "price-asc":
        sorted.sort((a, b) => a.priceCents - b.priceCents);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.priceCents - a.priceCents);
        break;
      case "watts-asc":
        sorted.sort((a, b) => a.powerWatts - b.powerWatts);
        break;
      case "name":
        sorted.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
        break;
    }
    return sorted;
  }, [components, category, selectedManufacturers, search, sort]);

  function toggleManufacturer(name: string) {
    setSelectedManufacturers((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  }

  // Ações que exigem login: se não estiver logado, manda para /login e volta depois
  function requireLogin(destination: string, action?: () => void) {
    if (!isAuthenticated()) {
      router.push(`/login?next=${encodeURIComponent(destination)}`);
      return;
    }
    action?.();
  }

  function addToBuild() {
    setMessage("Escolha uma build para adicionar a peça. Essa etapa chega com a tela de builds.");
  }

  function logout() {
    clearToken();
    setAuthed(false);
    setMessage("");
  }

  return (
    <div className={`${styles.page} ${plexSans.className}`}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/" className={`${styles.brand} ${plexCondensed.className}`}>
            Core Catalog
          </Link>
          <nav className={styles.nav}>
            <span>Catálogo</span>
            <button
              type="button"
              className={`${styles.navLink} ${styles.navLinkStrong}`}
              onClick={() => requireLogin("/builds", () => router.push("/builds"))}
            >
              Builds
            </button>
          </nav>
        </div>

        <div className={styles.actions}>
          {authed ? (
            <>
              <button type="button" className={styles.btnSecondary} onClick={logout}>
                Sair
              </button>
              <Link href="/" className={styles.btnPrimary}>
                Catálogo
              </Link>
            </>
          ) : (
            <>
              <Link href="/login?next=/" className={styles.btnSecondary}>
                Entrar
              </Link>
              <Link href="/register" className={styles.btnPrimary}>
                Criar conta
              </Link>
            </>
          )}
        </div>
      </header>

      <main className={styles.content}>
        <div>
          <h1 className={`${styles.title} ${plexCondensed.className}`}>
            Catálogo de peças
          </h1>
          <p className={styles.subtitle}>
            Compare preço e consumo antes de montar sua build.
          </p>
        </div>

        {error && (
          <div className={styles.alert} role="alert">
            {error}
          </div>
        )}
        {message && <div className={styles.notice}>{message}</div>}

        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            <div className={styles.filterGroup}>
              <p className={styles.filterTitle}>Categoria</p>
              <button
                type="button"
                className={`${styles.categoryBtn} ${category === "" ? styles.categoryActive : ""}`}
                onClick={() => setCategory("")}
              >
                <span>Todas</span>
                <span>{components.length}</span>
              </button>
              {categories.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  className={`${styles.categoryBtn} ${category === c.name ? styles.categoryActive : ""}`}
                  onClick={() => setCategory(c.name)}
                >
                  <span>{c.name}</span>
                  <span>{c.count}</span>
                </button>
              ))}
            </div>

            <div className={styles.filterGroup}>
              <p className={styles.filterTitle}>Fabricante</p>
              {manufacturers.map((m) => (
                <label key={m.name} className={styles.checkRow}>
                  <input
                    type="checkbox"
                    checked={selectedManufacturers.includes(m.name)}
                    onChange={() => toggleManufacturer(m.name)}
                  />
                  <span>{m.name}</span>
                  <span className={styles.count}>{m.count}</span>
                </label>
              ))}
            </div>
          </aside>

          <section className={styles.list}>
            <div className={styles.toolbar}>
              <input
                className={styles.search}
                placeholder="Buscar peça ou fabricante"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className={styles.sortWrap}>
                <label htmlFor="sort" className={styles.sortLabel}>
                  Ordenar por
                </label>
                <select
                  id="sort"
                  className={styles.select}
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                >
                  {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                    <option key={key} value={key}>
                      {SORT_LABELS[key]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.table}>
              <div className={styles.tableHead}>
                <span>Peça</span>
                <span>Categoria</span>
                <span style={{ textAlign: "right" }}>Consumo</span>
                <span style={{ textAlign: "right" }}>Preço</span>
                <span />
              </div>

              {loading && <div className={styles.empty}>Carregando peças...</div>}

              {!loading && visible.length === 0 && (
                <div className={styles.empty}>Nenhuma peça encontrada.</div>
              )}

              {visible.map((c) => (
                <div key={c.id} className={styles.row}>
                  <div>
                    <span className={styles.itemName}>{c.name}</span>
                    <span className={styles.itemBrand}>{c.manufacturer.name}</span>
                  </div>
                  <div>
                    <span className={styles.chip}>{c.category}</span>
                  </div>
                  <div className={styles.cellWatts}>{c.powerWatts} W</div>
                  <div className={styles.cellPrice}>
                    {currency.format(c.priceCents / 100)}
                  </div>
                  <div className={styles.cellAction}>
                    <button
                      type="button"
                      className={styles.btnAdd}
                      onClick={() => requireLogin("/", addToBuild)}
                    >
                      Adicionar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {!loading && (
              <p className={styles.footer}>
                Mostrando {visible.length} de {components.length} peças
              </p>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}