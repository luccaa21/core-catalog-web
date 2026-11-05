"use client";

import { useEffect, useState } from "react";
import { IBM_Plex_Sans_Condensed } from "next/font/google";
import { getToken } from "../../login/auth_service";
import styles from "./manufacturers.module.css";

const plexCondensed = IBM_Plex_Sans_Condensed({
  subsets: ["latin"],
  weight: ["500", "600"],
});

const API = process.env.NEXT_PUBLIC_API_URL;

type Manufacturer = { id: number; name: string };

function authHeaders(): Record<string, string> {
  return { Authorization: `Bearer ${getToken() ?? ""}` };
}

export default function AdminManufacturersPage() {
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const response = await fetch(`${API}/manufacturers`, { headers: authHeaders() });
      if (!response.ok) throw new Error();
      setManufacturers(await response.json());
    } catch {
      setError("Não foi possível carregar os fabricantes. Verifique a API.");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      const response = await fetch(`${API}/manufacturers`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const msg = Array.isArray(data?.message) ? data.message.join(", ") : data?.message;
        setError(String(msg ?? "Erro ao cadastrar o fabricante."));
        return;
      }

      setName("");
      await load();
    } catch {
      setError("Erro de conexão ao cadastrar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div>
        <h1 className={`${styles.title} ${plexCondensed.className}`}>Fabricantes</h1>
        <p className={styles.subtitle}>As marcas disponíveis ao cadastrar uma peça.</p>
      </div>

      {error && (
        <div className={styles.alert} role="alert">
          {error}
        </div>
      )}

      <div className={styles.columns}>
        <form onSubmit={save} className={styles.formCard}>
          <h2 className={`${styles.formTitle} ${plexCondensed.className}`}>
            Novo fabricante
          </h2>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="name">
              Nome
            </label>
            <input
              id="name"
              className={styles.input}
              placeholder="Ex.: Intel"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={60}
              required
            />
          </div>

          <button type="submit" className={styles.btnPrimary} disabled={saving}>
            {saving ? "Cadastrando..." : "Cadastrar fabricante"}
          </button>
        </form>

        <div className={styles.table}>
          <div className={styles.tableHead}>
            <span className={styles.name}>Nome</span>
            <span className={styles.id}>ID</span>
          </div>

          {manufacturers.length === 0 && (
            <div className={styles.empty}>Nenhum fabricante cadastrado.</div>
          )}

          {manufacturers.map((m) => (
            <div key={m.id} className={styles.row}>
              <span className={styles.name}>{m.name}</span>
              <span className={styles.id}>{m.id}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}