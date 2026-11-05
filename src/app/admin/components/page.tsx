"use client";

import { useEffect, useState } from "react";
import { IBM_Plex_Sans_Condensed } from "next/font/google";
import { getToken } from "../../login/auth_service";
import styles from "./components.module.css";

const plexCondensed = IBM_Plex_Sans_Condensed({
  subsets: ["latin"],
  weight: ["500", "600"],
});

const API = process.env.NEXT_PUBLIC_API_URL;

type Manufacturer = { id: number; name: string };

type Component = {
  id: number;
  name: string;
  category: string;
  priceCents: number;
  powerWatts: number;
  manufacturer: { name: string };
};

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function authHeaders(): Record<string, string> {
  return { Authorization: `Bearer ${getToken() ?? ""}` };
}

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
        fetch(`${API}/components`),
        fetch(`${API}/manufacturers`, { headers: authHeaders() }),
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

  // Digitar só números: os dois últimos dígitos são os centavos
  function handlePriceChange(value: string) {
    const digits = value.replace(/\D/g, "");
    setPriceCents(Number(digits) || 0);
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
      const response = await fetch(`${API}/components`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          name: name.trim(),
          category: category.trim(),
          manufacturerId: Number(manufacturerId),
          priceCents,
          powerWatts: Number(watts),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const msg = Array.isArray(data?.message) ? data.message.join(", ") : data?.message;
        setError(String(msg ?? "Erro ao cadastrar a peça."));
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
      <div>
        <h1 className={`${styles.title} ${plexCondensed.className}`}>Peças</h1>
        <p className={styles.subtitle}>
          Cadastre as peças que aparecem no catálogo, com preço e consumo.
        </p>
      </div>

      {error && (
        <div className={styles.alert} role="alert">
          {error}
        </div>
      )}

      <div className={styles.columns}>
        <form onSubmit={save} className={styles.formCard}>
          <h2 className={`${styles.formTitle} ${plexCondensed.className}`}>Nova peça</h2>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="name">
              Nome
            </label>
            <input
              id="name"
              className={styles.input}
              placeholder="Ex.: Ryzen 7 7800X3D"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={120}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="category">
              Categoria
            </label>
            <input
              id="category"
              className={styles.input}
              placeholder="Ex.: CPU, GPU, RAM"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              maxLength={40}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="manufacturer">
              Fabricante
            </label>
            <select
              id="manufacturer"
              className={styles.select}
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
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="price">
              Preço
            </label>
            <input
              id="price"
              inputMode="numeric"
              className={styles.input}
              value={currency.format(priceCents / 100)}
              onChange={(e) => handlePriceChange(e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="watts">
              Consumo
            </label>
            <input
              id="watts"
              type="number"
              min={0}
              className={styles.input}
              placeholder="0 W"
              value={watts}
              onChange={(e) => setWatts(e.target.value)}
              required
            />
            <p className={styles.hint}>Consumo máximo da peça em watts</p>
          </div>

          <button type="submit" className={styles.btnPrimary} disabled={saving}>
            {saving ? "Cadastrando..." : "Cadastrar peça"}
          </button>
        </form>

        <div className={styles.list}>
          <div className={styles.table}>
            <div className={styles.tableHead}>
              <span>Peça</span>
              <span>Categoria</span>
              <span style={{ textAlign: "right" }}>Consumo</span>
              <span style={{ textAlign: "right" }}>Preço</span>
            </div>

            {components.length === 0 && (
              <div className={styles.empty}>Nenhuma peça cadastrada.</div>
            )}

            {components.map((c) => (
              <div key={c.id} className={styles.row}>
                <div>
                  <span className={styles.itemName}>{c.name}</span>
                  <span className={styles.itemBrand}>{c.manufacturer.name}</span>
                </div>
                <div>
                  <span className={styles.chip}>{c.category}</span>
                </div>
                <div className={styles.right}>{c.powerWatts} W</div>
                <div className={styles.price}>{currency.format(c.priceCents / 100)}</div>
              </div>
            ))}
          </div>

          {components.length > 0 && (
            <p className={styles.footer}>Mostrando {components.length} peças</p>
          )}
        </div>
      </div>
    </>
  );
}