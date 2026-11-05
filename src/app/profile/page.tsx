"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IBM_Plex_Sans, IBM_Plex_Sans_Condensed } from "next/font/google";
import {
  clearToken,
  getNextPath,
  getToken,
  isAuthenticated,
} from "../login/auth_service";
import headerStyles from "../catalog.module.css";
import styles from "../builds/new/new-build.module.css";
import profileStyles from "./profile.module.css";

const plexSans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "600"] });
const plexCondensed = IBM_Plex_Sans_Condensed({
  subsets: ["latin"],
  weight: ["500", "600"],
});

const API = "http://localhost:3001";

type Profile = {
  id: number;
  userId: number;
  fullName: string;
  birthDate: string | null; // vem como ISO: "1990-01-15T00:00:00.000Z"
  avatarUrl: string | null;
};

function authHeaders(): Record<string, string> {
  return { Authorization: `Bearer ${getToken() ?? ""}` };
}

function formatDate(iso: string) {
  const [year, month, day] = iso.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function ProfilePage() {
  const router = useRouter();

  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  function fillForm(p: Profile | null) {
    setFullName(p?.fullName ?? "");
    setBirthDate(p?.birthDate ? p.birthDate.slice(0, 10) : "");
    setAvatarUrl(p?.avatarUrl ?? "");
  }

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login?next=/perfil");
      return;
    }
    setAuthed(true);

    async function load() {
      try {
        const response = await fetch(`${API}/profiles/me`, {
          headers: authHeaders(),
        });
        if (!response.ok) throw new Error();

        // Sem perfil, o backend responde null (corpo vazio)
        const text = await response.text();
        const data: Profile | null = text ? JSON.parse(text) : null;
        setProfile(data);
        fillForm(data);
      } catch {
        setError("Não foi possível carregar seu perfil.");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    // Campos vazios não são enviados (undefined some no JSON)
    const fields = {
      fullName: fullName.trim(),
      birthDate: birthDate || undefined,
      avatarUrl: avatarUrl.trim() || undefined,
    };

    const url = profile
      ? `${API}/profiles/${profile.id}`
      : `${API}/profiles/me`;

    setSaving(true);
    try {
      const response = await fetch(url, {
        method: profile ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(fields),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const msg = Array.isArray(data?.message)
          ? data.message.join(", ")
          : data?.message;
        setError(String(msg ?? "Não foi possível salvar o perfil."));
        return;
      }

      const saved: Profile = await response.json();
      setProfile(saved);
      fillForm(saved);

      // Se a pessoa veio de outra tela (ex.: Nova build), volta para ela
      const next = getNextPath("");
      if (next) {
        router.push(next);
        return;
      }
      setSuccess("Perfil salvo.");
    } catch {
      setError("Erro de conexão. Verifique se a API está rodando.");
    } finally {
      setSaving(false);
    }
  }

  function logout() {
    clearToken();
    router.push("/login");
  }

  const previewName = fullName.trim() || "Seu perfil";

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
            <Link href="/builds/new" className={headerStyles.navLink}>
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
              <h1 className={`${styles.title} ${plexCondensed.className}`}>
                Meu perfil
              </h1>
              <p className={styles.subtitle}>
                {profile
                  ? "Atualize seus dados. Eles aparecem nas builds que você montar."
                  : "Crie seu perfil para montar builds. Cada conta tem um único perfil."}
              </p>
            </div>

            {error && (
              <div className={headerStyles.alert} role="alert">
                {error}
              </div>
            )}
            {success && <div className={headerStyles.notice}>{success}</div>}

            <form onSubmit={handleSubmit} className={styles.fields}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="fullName">
                  Nome completo
                </label>
                <input
                  id="fullName"
                  className={styles.input}
                  placeholder="Nome completo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  minLength={2}
                  maxLength={120}
                  required
                  disabled={loading}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="birthDate">
                  Data de nascimento
                </label>
                <input
                  id="birthDate"
                  type="date"
                  className={styles.input}
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="avatarUrl">
                  URL do avatar
                </label>
                <input
                  id="avatarUrl"
                  type="url"
                  className={styles.input}
                  placeholder="https://..."
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  maxLength={500}
                  disabled={loading}
                />
                <p className={styles.hint}>Opcional. Cole o link de uma imagem.</p>
              </div>

              <div className={styles.actions}>
                <button
                  type="submit"
                  className={styles.btnPrimary}
                  disabled={saving || loading}
                >
                  {saving
                    ? "Salvando..."
                    : profile
                    ? "Salvar alterações"
                    : "Criar perfil"}
                </button>
                <Link href="/" className={styles.btnSecondary}>
                  Cancelar
                </Link>
              </div>
            </form>
          </section>

          <aside className={styles.preview}>
            <div className={profileStyles.avatarWrap}>
              {avatarUrl.trim() ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl.trim()}
                  alt={previewName}
                  className={profileStyles.avatar}
                />
              ) : (
                <div className={profileStyles.avatarInitials}>
                  {getInitials(previewName)}
                </div>
              )}
              <h2 className={`${styles.previewTitle} ${plexCondensed.className}`}>
                {previewName}
              </h2>
            </div>

            {!loading && !profile && (
              <p className={styles.empty}>
                Você ainda não tem perfil. Preencha o formulário ao lado para criar o seu.
              </p>
            )}

            <div className={profileStyles.infoList}>
              <div className={profileStyles.infoRow}>
                <span className={profileStyles.infoLabel}>Nascimento</span>
                <span className={profileStyles.infoValue}>
                  {birthDate ? formatDate(birthDate) : "—"}
                </span>
              </div>
              <div className={profileStyles.infoRow}>
                <span className={profileStyles.infoLabel}>Situação</span>
                <span className={profileStyles.infoValue}>
                  {profile ? "Perfil criado" : "Sem perfil"}
                </span>
              </div>
            </div>
          </aside>
        </main>
      )}
    </div>
  );
}