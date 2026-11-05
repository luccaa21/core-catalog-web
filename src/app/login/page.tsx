"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IBM_Plex_Sans, IBM_Plex_Sans_Condensed } from "next/font/google";
import { getNextPath, saveToken } from "./auth_service";
import styles from "./login.module.css";

const plexSans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "600"] });
const plexCondensed = IBM_Plex_Sans_Condensed({
  subsets: ["latin"],
  weight: ["500", "600"],
});

const API = process.env.NEXT_PUBLIC_API_URL;

// Dados fixos só para a prévia visual da tela (protótipo)
const PREVIEW_ITEMS = [
  { category: "CPU", name: "Ryzen 7 7800X3D", price: "R$ 1.899,00" },
  { category: "GPU", name: "GeForce RTX 4070 Super", price: "R$ 4.299,00" },
  { category: "RAM", name: "Corsair Vengeance DDR5 32 GB", price: "R$ 799,00" },
  { category: "Armazenamento", name: "Samsung 990 PRO 1 TB", price: "R$ 749,00" },
];

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const msg = Array.isArray(data?.message)
          ? data.message.join(", ")
          : data?.message;
        setError(String(msg ?? "Não foi possível entrar."));
        return;
      }

      const data = await response.json();
      saveToken(data.access_token);
      router.replace(getNextPath());
    } catch {
      setError("Erro de conexão. Verifique se a API está rodando.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`${styles.page} ${plexSans.className}`}>
      <main className={styles.content}>
        {/* Formulário */}
        <section className={styles.form}>
          <div>
            <h1 className={`${styles.title} ${plexCondensed.className}`}>
              Entrar
            </h1>
            <p className={styles.subtitle}>
              Acesse sua conta para montar e salvar builds.
            </p>
          </div>

          {error && (
            <div className={styles.alert} role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ width: "100%" }}>
            <div className={styles.field} style={{ marginBottom: 24 }}>
              <label className={styles.label} htmlFor="email">
                E-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className={styles.input}
                placeholder="nome@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className={styles.field} style={{ marginBottom: 24 }}>
              <label className={styles.label} htmlFor="password">
                Senha
              </label>
              <div className={styles.inputWrap}>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className={styles.input}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                  style={{ paddingRight: 40 }}
                />
                <button
                  type="button"
                  className={styles.eyeButton}
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22" />
                  </svg>
                </button>
              </div>
            </div>

            <button className={styles.button} type="submit" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <p className={styles.alternative}>
            Ainda não tem conta?
            <a className={styles.link} href="/register">
              Criar conta
            </a>
          </p>
        </section>

        {/* Prévia da build (visual do protótipo) */}
        <aside className={styles.preview}>
          <h2 className={`${styles.previewTitle} ${plexCondensed.className}`}>
            Sua build, dentro do orçamento
          </h2>
          <p className={styles.previewText}>
            Some o preço e o consumo de cada peça e veja na régua quanto ainda cabe.
          </p>

          <div className={styles.track} aria-hidden="true">
            <div className={styles.segment} style={{ width: "23.5%", background: "var(--color-brand)" }} />
            <div className={styles.segment} style={{ width: "53.7%", background: "var(--color-brand-2)" }} />
            <div className={styles.segment} style={{ width: "9.8%", background: "var(--color-brand-3)" }} />
            <div className={styles.segment} style={{ width: "9.1%", background: "var(--color-brand-4)" }} />
          </div>

          <div className={styles.totals}>
            <span>R$ 7.746,00 de R$ 8.000,00</span>
            <span className={styles.totalsWatts}>357 W</span>
          </div>

          <div>
            {PREVIEW_ITEMS.map((item) => (
              <div key={item.category} className={styles.itemRow}>
                <span className={styles.itemCategory}>{item.category}</span>
                <span className={styles.itemName}>{item.name}</span>
                <span className={styles.itemPrice}>{item.price}</span>
              </div>
            ))}
          </div>
        </aside>
      </main>
    </div>
  );
}