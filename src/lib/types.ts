export type Manufacturer = { id: number; name: string };

export type Component = {
  id: number;
  name: string;
  category: string;
  priceCents: number;
  powerWatts: number;
  manufacturerId: number;
  manufacturer: { name: string };
};

export type User = { id: number; name: string; email: string };

export type Profile = {
  id: number;
  userId: number;
  fullName: string;
  birthDate: string | null; // vem como ISO: "2003-05-10T00:00:00.000Z"
  avatarUrl: string | null;
};

export type ProfileWithUser = Profile & {
  user: { name: string; email: string };
};

export type BuildSummaryItem = { id: number; name: string; maxBudgetCents: number };

export type BuildItem = {
  componentId: number;
  name: string;
  category: string;
  manufacturer: string;
  unitPriceCents: number;
  powerWatts: number;
  quantity: number;
  subtotalCents: number;
};

export type BuildSummary = {
  name: string;
  owner: string;
  totalCents: number;
  totalWatts: number;
  maxBudgetCents: number;
  overBudget: boolean;
  items: BuildItem[];
};
