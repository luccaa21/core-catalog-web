"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IBM_Plex_Sans, IBM_Plex_Sans_Condensed } from "next/font/google";
import { clearToken, getToken, isAuthenticated } from "../login/auth_service";
import headerStyles from "../catalog.module.css";
import styles from "./[id]/build-detail.module.css";

const plexSans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "600"] });
const plexCondensed = IBM_Plex_Sans_Condensed({
  subsets: ["latin"],
  weight: ["500", "600"],
});

const API = "http://localhost:3001";

type BuildSummaryItem = { id: number; name: string; maxBudgetCents: number };

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export default function BuildsListPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [builds, setBuilds] = useState<BuildSummaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login?next=/builds");
      return;
    }
    setAuthed(true);

    fetch(`${API}/builds/mine`, {
      headers: { Authorization: `Bearer ${getToken() ?? ""}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data: BuildSummaryItem[]) => setBuilds(data))
      .catch(() => setError("Não foi possível carregar suas builds."))
      .finally(() => setLoading(false));
  }, []);

  function logout() {
    clearToken();
    router.push("/login");
  }

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
            <span className={`${headerStyles.navLink} ${headerStyles.navLinkStrong}`}>
              Builds
            </span>
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
          <div className={styles.titleRow}>
            <div className={styles.titleBlock}>
              <h1 className={`${styles.title} ${plexCondensed.className}`}>Builds</h1>
              <p className={styles.subtitle}>Suas montagens e o orçamento de cada uma.</p>
            </div>
            <Link href="/builds/new" className={headerStyles.btnPrimary}>
              Nova build
            </Link>
          </div>

          {error && (
            <div className={headerStyles.alert} role="alert">
              {error}
            </div>
          )}

          {loading && <p className={styles.empty}>Carregando builds...</p>}

          {!loading && !error && builds.length === 0 && (
            <p className={styles.empty}>
              Você ainda não tem builds. Crie a primeira para começar.
            </p>
          )}

          {builds.map((b) => (
            <Link
              key={b.id}
              href={`/builds/${b.id}`}
              className={styles.card}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <span className={`${styles.title} ${plexCondensed.className}`} style={{ fontSize: 24, lineHeight: "32px" }}>
                {b.name}
              </span>
              <span className={styles.subtitle} style={{ margin: 0 }}>
                Orçamento de {currency.format(b.maxBudgetCents / 100)}
              </span>
            </Link>
          ))}
        </main>
      )}
    </div>
  );
}