"use client";

import { useEffect, useState } from "react";
import { RowActions } from "@/components/ui/RowActions";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { PageHeading } from "@/components/ui/PageHeading";
import { Table, TableEmpty, TableHead, TableRow } from "@/components/ui/Table";
import { FormActions } from "@/components/ui/Form";
import { apiFetch, readApiError } from "@/lib/api";
import type { User } from "@/lib/types";
import styles from "./users.module.css";

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
      const response = await apiFetch("/users", { auth: true });
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

    const body: Record<string, string> = { name, email };
    if (!isEditing) body.password = password;

    try {
      const response = await apiFetch(isEditing ? `/users/${id}` : "/users", {
        method: isEditing ? "PATCH" : "POST",
        auth: true,
        body,
      });

      if (!response.ok) {
        setError(await readApiError(response, "Erro ao salvar o usuário."));
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
      const response = await apiFetch(`/users/${userId}`, { method: "DELETE", auth: true });
      if (!response.ok) throw new Error();
      if (id === userId) resetForm();
      await load();
    } catch {
      setError("Não foi possível excluir o usuário.");
    }
  }

  return (
    <>
      <PageHeading title="Usuários" />

      {error && <Alert spaced>{error}</Alert>}

      <form onSubmit={save} className={styles.form}>
        <div className={`${styles.fields} ${isEditing ? styles.fieldsTwo : ""}`}>
          <FormField label="Nome" htmlFor="name">
            <Input
              id="name"
              placeholder="Nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </FormField>

          <FormField label="E-mail" htmlFor="email">
            <Input
              id="email"
              type="email"
              placeholder="nome@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </FormField>

          {!isEditing && (
            <FormField label="Senha" htmlFor="password" hint="Mínimo de 6 caracteres">
              <Input
                id="password"
                type="password"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </FormField>
          )}
        </div>

        <FormActions>
          <Button type="submit" disabled={saving}>
            {saving ? "Salvando..." : isEditing ? "Salvar" : "Cadastrar"}
          </Button>
          {isEditing && (
            <Button variant="secondary" onClick={resetForm}>
              Cancelar
            </Button>
          )}
        </FormActions>
      </form>

      <Table className={styles.table}>
        <TableHead className={styles.cols}>
          <span>Nome</span>
          <span>E-mail</span>
          <span style={{ textAlign: "right" }}>Ações</span>
        </TableHead>

        {users.length === 0 && <TableEmpty>Nenhum usuário cadastrado.</TableEmpty>}

        {users.map((user) => (
          <TableRow key={user.id} className={`${styles.cols} ${styles.rowText}`}>
            <span className={styles.name}>{user.name}</span>
            <span className={styles.email}>{user.email}</span>
            <RowActions onEdit={() => edit(user)} onDelete={() => void remove(user.id)} />
          </TableRow>
        ))}
      </Table>
    </>
  );
}
