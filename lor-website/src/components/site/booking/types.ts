import type { Service } from "@prisma/client";

export type BookableService = Pick<
  Service,
  "id" | "kind" | "name" | "description" | "price" | "priceFrom" | "durationMinutes" | "icon"
>;

export type Availability = { from: string; to: string; dates: { date: string; slots: number }[] };
