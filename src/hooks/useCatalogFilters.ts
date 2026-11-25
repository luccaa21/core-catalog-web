"use client";

import { useMemo, useState } from "react";
import type { Component } from "@/lib/types";

export type SortKey = "price-asc" | "price-desc" | "watts-asc" | "name";

export const SORT_LABELS: Record<SortKey, string> = {
  "price-asc": "Menor preço",
  "price-desc": "Maior preço",
  "watts-asc": "Menor consumo",
  name: "Nome",
};

// Ordem das categorias como no protótipo; categorias extras vão para o fim
const CATEGORY_ORDER = ["CPU", "GPU", "Placa-mãe", "RAM", "Armazenamento", "Fonte"];

function countBy<T>(items: T[], key: (item: T) => string) {
  const counts = new Map<string, number>();
  for (const item of items) {
    const k = key(item);
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return counts;
}

/** Filtros (categoria, fabricantes, busca) e ordenação do catálogo de peças. */
export function useCatalogFilters(components: Component[]) {
  const [category, setCategory] = useState("");
  const [selectedManufacturers, setSelectedManufacturers] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("price-asc");

  // Categorias com contagem, na ordem do protótipo
  const categories = useMemo(() => {
    const counts = countBy(components, (c) => c.category);
    return [...counts.keys()]
      .sort((a, b) => {
        const ia = CATEGORY_ORDER.indexOf(a);
        const ib = CATEGORY_ORDER.indexOf(b);
        return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib) || a.localeCompare(b);
      })
      .map((name) => ({ name, count: counts.get(name) ?? 0 }));
  }, [components]);

  // Fabricantes com contagem, em ordem alfabética
  const manufacturers = useMemo(() => {
    const counts = countBy(components, (c) => c.manufacturer.name);
    return [...counts.keys()]
      .sort((a, b) => a.localeCompare(b, "pt-BR"))
      .map((name) => ({ name, count: counts.get(name) ?? 0 }));
  }, [components]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();

    const filtered = components.filter(
      (c) =>
        (!category || c.category === category) &&
        (selectedManufacturers.length === 0 ||
          selectedManufacturers.includes(c.manufacturer.name)) &&
        (!term ||
          c.name.toLowerCase().includes(term) ||
          c.manufacturer.name.toLowerCase().includes(term))
    );

    const sorted = [...filtered];
    switch (sort) {
      case "price-asc":
        sorted.sort((a, b) => a.priceCents - b.priceCents);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.priceCents - a.priceCents);
        break;
      case "watts-asc":
        sorted.sort((a, b) => a.powerWatts - b.powerWatts);
        break;
      case "name":
        sorted.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
        break;
    }
    return sorted;
  }, [components, category, selectedManufacturers, search, sort]);

  function toggleManufacturer(name: string) {
    setSelectedManufacturers((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  }

  return {
    categories,
    manufacturers,
    visible,
    category,
    setCategory,
    selectedManufacturers,
    toggleManufacturer,
    search,
    setSearch,
    sort,
    setSort,
  };
}
