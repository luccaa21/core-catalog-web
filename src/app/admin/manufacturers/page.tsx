"use client";

import { useEffect, useState } from "react";
import { AdminFormCard, AdminSplit } from "@/components/admin/AdminSplit";
import { Alert } from "@/components/ui/Alert";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { PageHeading } from "@/components/ui/PageHeading";
import { RowActions } from "@/components/ui/RowActions";
import { Table, TableEmpty, TableHead, TableRow } from "@/components/ui/Table";
import { apiFetch, readApiError } from "@/lib/api";
import type { Manufacturer } from "@/lib/types";
import styles from "./manufacturers.module.css";

export default function AdminManufacturersPage() {
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [id, setId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const isEditing = id !== null;

  async function load() {
    try {
      const response = await apiFetch("/manufacturers", { auth: true });
      if (!response.ok) throw new Error();
      setManufacturers(await response.json());
    } catch {
      setError("Não foi possível carregar os fabricantes. Verifique a API.");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function resetForm() {
    setId(null);
    setName("");
  }

  function edit(manufacturer: Manufacturer) {
    setError("");
    setId(manufacturer.id);
    setName(manufacturer.name);
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      const response = await apiFetch(isEditing ? `/manufacturers/${id}` : "/manufacturers", {
        method: isEditing ? "PATCH" : "POST",
        auth: true,
        body: { name: name.trim() },
      });

      if (!response.ok) {
        setError(
          await readApiError(
            response,
            isEditing ? "Erro ao salvar o fabricante." : "Erro ao cadastrar o fabricante."
          )
        );
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

  async function remove(manufacturer: Manufacturer) {
    if (!confirm(`Excluir o fabricante "${manufacturer.name}"?`)) return;
    setError("");
    try {
      const response = await apiFetch(`/manufacturers/${manufacturer.id}`, {
        method: "DELETE",
        auth: true,
      });
      if (!response.ok) {
        setError(await readApiError(response, "Não foi possível excluir o fabricante."));
        return;
      }
      if (id === manufacturer.id) resetForm();
      await load();
    } catch {
      setError("Erro de conexão ao excluir.");
    }
  }

  return (
    <>
      <PageHeading
        title="Fabricantes"
        subtitle="As marcas disponíveis ao cadastrar uma peça."
      />

      {error && <Alert spaced>{error}</Alert>}

      <AdminSplit
        form={
          <AdminFormCard
            title={isEditing ? "Editar fabricante" : "Novo fabricante"}
            onSubmit={save}
            saving={saving}
            submitLabel={isEditing ? "Salvar" : "Cadastrar fabricante"}
            savingLabel={isEditing ? "Salvando..." : "Cadastrando..."}
            onCancel={isEditing ? resetForm : undefined}
            stretch={!isEditing}
          >
            <FormField label="Nome" htmlFor="name">
              <Input
                id="name"
                placeholder="Ex.: Intel"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={60}
                required
              />
            </FormField>
          </AdminFormCard>
        }
      >
        <Table>
          <TableHead className={styles.cols}>
            <span>Nome</span>
            <span style={{ textAlign: "right" }}>ID</span>
            <span style={{ textAlign: "right" }}>Ações</span>
          </TableHead>

          {manufacturers.length === 0 && <TableEmpty>Nenhum fabricante cadastrado.</TableEmpty>}

          {manufacturers.map((m) => (
            <TableRow key={m.id} className={`${styles.cols} ${styles.rowText}`}>
              <span className={styles.name}>{m.name}</span>
              <span className={styles.id}>{m.id}</span>
              <RowActions onEdit={() => edit(m)} onDelete={() => void remove(m)} />
            </TableRow>
          ))}
        </Table>
      </AdminSplit>
    </>
  );
}
