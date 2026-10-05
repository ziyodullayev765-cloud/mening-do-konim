import type { ServiceCategoryKey } from "@/lib/schemas/service";

/** Serializable row passed from the server page to the client manager. */
export type ServiceRow = {
  id: string;
  name: string;
  category: ServiceCategoryKey;
  description: string;
  price: number | null;
  priceFrom: boolean;
  durationMinutes: number | null;
  icon: string;
  imageUrl: string | null;
  indication: string;
  recovery: string;
  nameRu: string;
  descriptionRu: string;
  indicationRu: string;
  recoveryRu: string;
  showInPricing: boolean;
  active: boolean;
  sortOrder: number;
  createdAt: string;
  /** Upcoming non-cancelled appointments linked to this service. */
  upcomingCount: number;
  /** Set only on optimistic rows while a server action is in flight. */
  pending?: boolean;
};

export type CategoryFilter = "ALL" | ServiceCategoryKey;
export type StatusFilter = "all" | "active" | "inactive";
export type SortKey = "manual" | "nameAsc" | "priceAsc" | "priceDesc" | "durationAsc" | "newest";
export const SORT_KEYS: SortKey[] = ["manual", "nameAsc", "priceAsc", "priceDesc", "durationAsc", "newest"];

export type Filters = { q: string; category: CategoryFilter; status: StatusFilter; sort: SortKey };
