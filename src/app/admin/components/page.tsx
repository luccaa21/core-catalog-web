"use client";

import { useEffect, useState } from "react";
import { AdminFormCard, AdminSplit } from "@/components/admin/AdminSplit";
import { ComponentsTable } from "@/components/catalog/ComponentsTable";
import { Alert } from "@/components/ui/Alert";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { FormField } from "@/components/ui/FormField";
import { Input, Select } from "@/components/ui/Input";
import { PageHeading } from "@/components/ui/PageHeading";
import { TableFooter } from "@/components/ui/Table";
import { apiFetch, readApiError } from "@/lib/api";
import type { Component, Manufacturer } from "@/lib/types";

export default function AdminComponentsPage() {
  const [components, setComponents] = useState<Component[]>([]);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [manufacturerId, setManufacturerId] = useState("");
  const [priceCents, setPriceCents] = useState(0);
  const [watts, setWatts] = useState("");

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const [componentsRes, manufacturersRes] = await Promise.all([
        apiFetch("/components"),
        apiFetch("/manufacturers", { auth: true }),
      ]);
      if (!componentsRes.ok || !manufacturersRes.ok) throw new Error();
      setComponents(await componentsRes.json());
      setManufacturers(await manufacturersRes.json());
    } catch {
      setError("Não foi possível carregar as peças. Verifique a API.");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function resetForm() {
    setName("");
    setCategory("");
    setManufacturerId("");
    setPriceCents(0);
    setWatts("");
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (priceCents <= 0) {
      setError("Informe um preço maior que zero.");
      return;
    }

    setSaving(true);
    try {
      const response = await apiFetch("/components", {
        method: "POST",
        auth: true,
        body: {
          name: name.trim(),
          category: category.trim(),
          manufacturerId: Number(manufacturerId),
          priceCents,
          powerWatts: Number(watts),
        },
      });

      if (!response.ok) {
        setError(await readApiError(response, "Erro ao cadastrar a peça."));
        return;
      }

      resetForm();
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
        title="Peças"
        subtitle="Cadastre as peças que aparecem no catálogo, com preço e consumo."
      />

      {error && <Alert spaced>{error}</Alert>}

      <AdminSplit
        form={
          <AdminFormCard
            title="Nova peça"
            onSubmit={save}
            saving={saving}
            submitLabel="Cadastrar peça"
            savingLabel="Cadastrando..."
            stretch
          >
            <FormField label="Nome" htmlFor="name">
              <Input
                id="name"
                placeholder="Ex.: Ryzen 7 7800X3D"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={120}
                required
              />
            </FormField>

            <FormField label="Categoria" htmlFor="category">
              <Input
                id="category"
                placeholder="Ex.: CPU, GPU, RAM"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                maxLength={40}
                required
              />
            </FormField>

            <FormField label="Fabricante" htmlFor="manufacturer">
              <Select
                id="manufacturer"
                value={manufacturerId}
                onChange={(e) => setManufacturerId(e.target.value)}
                required
              >
                <option value="">Selecione um fabricante</option>
                {manufacturers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label="Preço" htmlFor="price">
              <CurrencyInput id="price" cents={priceCents} onChangeCents={setPriceCents} required />
            </FormField>

            <FormField label="Consumo" htmlFor="watts" hint="Consumo máximo da peça em watts">
              <Input
                id="watts"
                type="number"
                min={0}
                placeholder="0 W"
                value={watts}
                onChange={(e) => setWatts(e.target.value)}
                required
              />
            </FormField>
          </AdminFormCard>
        }
      >
        <ComponentsTable components={components} emptyMessage="Nenhuma peça cadastrada." />

        {components.length > 0 && <TableFooter>Mostrando {components.length} peças</TableFooter>}
      </AdminSplit>
    </>
  );
}
