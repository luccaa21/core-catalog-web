const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

/** Formata centavos como moeda: 189900 -> "R$ 1.899,00". */
export function money(cents: number) {
  return currency.format(cents / 100);
}

/** Marcas da escala: "R$ 0", "R$ 2 mil", "R$ 4 mil"... */
export function formatMark(cents: number) {
  const reais = cents / 100;
  if (reais === 0) return "R$ 0";
  if (reais >= 1000) {
    return `R$ ${(reais / 1000).toLocaleString("pt-BR", {
      maximumFractionDigits: 1,
    })} mil`;
  }
  return currency.format(reais);
}

/** "2003-05-10T00:00:00.000Z" -> "10/05/2003" */
export function formatDate(iso: string | null) {
  if (!iso) return "—";
  const [year, month, day] = iso.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
