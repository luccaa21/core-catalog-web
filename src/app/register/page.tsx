"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IBM_Plex_Sans, IBM_Plex_Sans_Condensed } from "next/font/google";
import { getNextPath, saveToken } from "../login/auth_service";
import styles from "../login/login.module.css";

const plexSans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "600"] });
const plexCondensed = IBM_Plex_Sans_Condensed({
  subsets: ["latin"],
  weight: ["500", "600"],
});

const API = "http://localhost:3001";

// Dados fixos só para a prévia visual da tela (protótipo)
const PREVIEW_ITEMS = [
  { category: "CPU", name: "Ryzen 7 7800X3D", price: "R$ 1.899,00" },
  { category: "GPU", name: "GeForce RTX 4070 Super", price: "R$ 4.299,00" },
  { category: "RAM", name: "Vengeance DDR5 32 GB", price: "R$ 799,00" },
  { category: "Armazenamento", name: "990 PRO 1 TB NVMe", price: "R$ 749,00" },
];

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
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
      const response = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const msg = Array.isArray(data?.message)
          ? data.message.join(", ")
          : data?.message;
        setError(String(msg ?? "Não foi possível criar a conta."));
        return;
      }

      // O register já devolve o token, então o usuário entra direto
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
              Criar conta
            </h1>
            <p className={styles.subtitle}>
              Monte builds dentro do orçamento e guarde todas elas em um só lugar.
            </p>
          </div>

          {error && (
            <div className={styles.alert} role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ width: "100%" }}>
            <div className={styles.field} style={{ marginBottom: 24 }}>
              <label className={styles.label} htmlFor="name">
                Nome
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                className={styles.input}
                placeholder="Nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                minLength={3}
                maxLength={100}
                required
              />
              <p className={styles.hint}>Entre 3 e 100 caracteres</p>
            </div>

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
                  autoComplete="new-password"
                  className={styles.input}
                  placeholder="••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                  style={{ paddingRight: 44 }}
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
              <p className={styles.hint}>Mínimo de 6 caracteres</p>
            </div>

            <button className={styles.button} type="submit" disabled={loading}>
              {loading ? "Criando conta..." : "Criar conta"}
            </button>
          </form>

          <p className={styles.alternative}>
            Já tem conta?
            <a className={styles.link} href="/login">
              Entrar
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