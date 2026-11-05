"use client";

import { useEffect, useState } from "react";
import { IBM_Plex_Sans_Condensed } from "next/font/google";
import { getToken } from "../../login/auth_service";
import styles from "./users.module.css";

const plexCondensed = IBM_Plex_Sans_Condensed({
  subsets: ["latin"],
  weight: ["500", "600"],
});

const API = process.env.NEXT_PUBLIC_API_URL;

type User = { id: number; name: string; email: string };

function authHeaders(): Record<string, string> {
  return { Authorization: `Bearer ${getToken() ?? ""}` };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [id, setId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const isEditing = id !== null;

  async function load() {
    try {
      const response = await fetch(`${API}/users`, { headers: authHeaders() });
      if (!response.ok) throw new Error();
      setUsers(await response.json());
    } catch {
      setError("Não foi possível carregar os usuários. Verifique a API.");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function resetForm() {
    setId(null);
    setName("");
    setEmail("");
    setPassword("");
  }

  function edit(user: User) {
    setError("");
    setId(user.id);
    setName(user.name);
    setEmail(user.email);
    setPassword("");
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaving(true);

    // Na edição a senha não é alterada aqui; no cadastro, vai em texto puro (o backend gera o hash)
    const body: Record<string, string> = { name, email };
    if (!isEditing) body.password = password;

    try {
      const response = await fetch(isEditing ? `${API}/users/${id}` : `${API}/users`, {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const msg = Array.isArray(data?.message) ? data.message.join(", ") : data?.message;
        setError(String(msg ?? "Erro ao salvar o usuário."));
        return;
      }

      resetForm();
      await load();
    } catch {
      setError("Erro de conexão ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(userId: number) {
    if (!confirm("Excluir este usuário?")) return;
    setError("");
    try {
      const response = await fetch(`${API}/users/${userId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!response.ok) throw new Error();
      if (id === userId) resetForm();
      await load();
    } catch {
      setError("Não foi possível excluir o usuário.");
    }
  }

  return (
    <>
      <h1 className={`${styles.title} ${plexCondensed.className}`}>Usuários</h1>

      {error && (
        <div className={styles.alert} role="alert">
          {error}
        </div>
      )}

      <form onSubmit={save} className={styles.form}>
        <div className={`${styles.fields} ${isEditing ? styles.fieldsTwo : ""}`}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="name">
              Nome
            </label>
            <input
              id="name"
              className={styles.input}
              placeholder="Nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              className={styles.input}
              placeholder="nome@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {!isEditing && (
            <div className={styles.field}>
              <label className={styles.label} htmlFor="password">
                Senha
              </label>
              <input
                id="password"
                type="password"
                className={styles.input}
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
              <p className={styles.hint}>Mínimo de 6 caracteres</p>
            </div>
          )}
        </div>

        <div className={styles.actions}>
          <button type="submit" className={styles.btnPrimary} disabled={saving}>
            {saving ? "Salvando..." : isEditing ? "Salvar" : "Cadastrar"}
          </button>
          {isEditing && (
            <button type="button" className={styles.btnSecondary} onClick={resetForm}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className={styles.table}>
        <div className={styles.tableHead}>
          <span>Nome</span>
          <span>E-mail</span>
          <span style={{ textAlign: "right" }}>Ações</span>
        </div>

        {users.length === 0 && (
          <div className={styles.empty}>Nenhum usuário cadastrado.</div>
        )}

        {users.map((user) => (
          <div key={user.id} className={styles.row}>
            <span className={styles.rowName}>{user.name}</span>
            <span className={styles.rowEmail}>{user.email}</span>
            <div className={styles.rowActions}>
              <button type="button" className={styles.btnEdit} onClick={() => edit(user)}>
                Editar
              </button>
              <button
                type="button"
                className={styles.btnDelete}
                onClick={() => void remove(user.id)}
              >
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}