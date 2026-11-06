"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IBM_Plex_Sans, IBM_Plex_Sans_Condensed } from "next/font/google";
import {
  clearToken,
  getToken,
  isAuthenticated,
} from "../../login/auth_service";
import headerStyles from "../../catalog.module.css";
import styles from "./new-build.module.css";

const plexSans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "600"] });
const plexCondensed = IBM_Plex_Sans_Condensed({
  subsets: ["latin"],
  weight: ["500", "600"],
});

const API = process.env.NEXT_PUBLIC_API_URL;

type Profile = { id: number; fullName: string };

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

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

function authHeaders(): Record<string, string> {
  return { Authorization: `Bearer ${getToken() ?? ""}` };
}

export default function NewBuildPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [budgetCents, setBudgetCents] = useState(800000); // R$ 8.000,00
  const [myProfile, setMyProfile] = useState<Profile | null>(null);
  const [profileChecked, setProfileChecked] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login?next=/builds/new");
      return;
    }
    setAuthed(true);

    // Busca só o perfil da conta logada
    fetch(`${API}/profiles/me`, { headers: authHeaders() })
      .then(async (r) => {
        if (!r.ok) throw new Error();
        // Sem perfil, o backend responde corpo vazio (null)
        const text = await r.text();
        setMyProfile(text ? JSON.parse(text) : null);
      })
      .catch(() => setError("Não foi possível carregar seu perfil."))
      .finally(() => setProfileChecked(true));
  }, [router]);

  const marks = useMemo(
    () => [0, 25, 50, 75, 100].map((p) => ({ p, value: (budgetCents * p) / 100 })),
    [budgetCents]
  );

  function handleBudgetChange(value: string) {
    // Só dígitos: os dois últimos são os centavos
    const digits = value.replace(/\D/g, "");
    setBudgetCents(Number(digits) || 0);
  }

  function logout() {
    clearToken();
    router.push("/login");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!myProfile) {
      setError("Crie seu perfil antes de montar uma build.");
      return;
    }
    if (budgetCents <= 0) {
      setError("Informe um orçamento maior que zero.");
      return;
    }

    setSaving(true);
    try {
      // O perfil não é enviado: o backend usa o dono do token
      const response = await fetch(`${API}/builds`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          name: name.trim(),
          maxBudgetCents: budgetCents,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const msg = Array.isArray(data?.message)
          ? data.message.join(", ")
          : data?.message;
        setError(String(msg ?? "Não foi possível criar a build."));
        return;
      }

      const created = await response.json();
      router.push(`/builds/${created.id}`);
    } catch {
      setError("Erro de conexão. Verifique se a API está rodando.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={`${headerStyles.page} ${plexSans.className}`}>
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
        <main className={styles.layout}>
          <section className={styles.form}>
            <div>
              <h1 className={`${styles.title} ${plexCondensed.className}`}>Nova build</h1>
              <p className={styles.subtitle}>
                Defina o orçamento. Cada peça adicionada é conferida contra esse limite.
              </p>
            </div>

            {error && (
              <div className={headerStyles.alert} role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className={styles.fields}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="name">
                  Nome da build
                </label>
                <input
                  id="name"
                  className={styles.input}
                  placeholder="Ex.: PC Gamer 2026"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={100}
                  required
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="budget">
                  Orçamento máximo
                </label>
                <input
                  id="budget"
                  className={styles.input}
                  inputMode="numeric"
                  value={currency.format(budgetCents / 100)}
                  onChange={(e) => handleBudgetChange(e.target.value)}
                  required
                />
                <p className={styles.hint}>
                  Peças que ultrapassem esse valor não serão adicionadas.
                </p>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="profile">
                  Perfil
                </label>
                <input
                  id="profile"
                  className={styles.input}
                  value={
                    myProfile
                      ? myProfile.fullName
                      : profileChecked
                        ? "Você ainda não tem perfil"
                        : "Carregando..."
                  }
                  disabled
                />
                {profileChecked && !myProfile && (
                  <p className={styles.hint}>
                    <Link href="/perfil?next=/builds/new" className={styles.link}>
                      Criar meu perfil
                    </Link>
                  </p>
                )}
              </div>

              <div className={styles.actions}>
                <button
                  type="submit"
                  className={styles.btnPrimary}
                  disabled={saving || !myProfile}
                >
                  {saving ? "Criando..." : "Criar build"}
                </button>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => router.push("/")}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </section>

          <aside className={styles.preview}>
            <h2 className={`${styles.previewTitle} ${plexCondensed.className}`}>
              {name.trim() || "Nova build"}
            </h2>

            <div className={styles.totals}>
              <p className={styles.totalValue}>{currency.format(0)}</p>
              <span className={styles.totalOf}>
                de {currency.format(budgetCents / 100)}
              </span>
            </div>

            <div>
              <div className={styles.track} aria-hidden="true" />
              <div className={styles.scale}>
                {marks.map(({ p, value }) => (
                  <div key={p}>
                    <div className={styles.mark} style={{ left: `${p}%` }} />
                    <span
                      className={styles.markLabel}
                      style={{
                        left: `${p}%`,
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
                ))}
              </div>
            </div>

            <p className={styles.empty}>
              Nenhuma peça ainda. Depois de criar a build, adicione peças do catálogo e acompanhe o gasto e o consumo aqui.
            </p>
          </aside>
        </main>
      )}
    </div>
  );
}