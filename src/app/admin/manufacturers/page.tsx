"use client";

import { useEffect, useState } from "react";
import { AdminFormCard, AdminSplit } from "@/components/admin/AdminSplit";
import { Alert } from "@/components/ui/Alert";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { PageHeading } from "@/components/ui/PageHeading";
import { Table, TableEmpty, TableHead, TableRow } from "@/components/ui/Table";
import { apiFetch, readApiError } from "@/lib/api";
import type { Manufacturer } from "@/lib/types";
import styles from "./manufacturers.module.css";

export default function AdminManufacturersPage() {
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

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

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      const response = await apiFetch("/manufacturers", {
        method: "POST",
        auth: true,
        body: { name: name.trim() },
      });

      if (!response.ok) {
        setError(await readApiError(response, "Erro ao cadastrar o fabricante."));
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
      <PageHeading
        title="Fabricantes"
        subtitle="As marcas disponíveis ao cadastrar uma peça."
      />

      {error && <Alert spaced>{error}</Alert>}

      <AdminSplit
        form={
          <AdminFormCard
            title="Novo fabricante"
            onSubmit={save}
            saving={saving}
            submitLabel="Cadastrar fabricante"
            savingLabel="Cadastrando..."
            stretch
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
          </TableHead>

          {manufacturers.length === 0 && <TableEmpty>Nenhum fabricante cadastrado.</TableEmpty>}

          {manufacturers.map((m) => (
            <TableRow key={m.id} className={`${styles.cols} ${styles.rowText}`}>
              <span className={styles.name}>{m.name}</span>
              <span className={styles.id}>{m.id}</span>
            </TableRow>
          ))}
        </Table>
      </AdminSplit>
    </>
  );
}
