import type { Service } from "@prisma/client";

export type BookableService = Pick<Service, "id" | "category" | "name" | "price" | "priceFrom" | "durationMinutes">;

export type Availability = { from: string; to: string; dates: { date: string; slots: number }[] };

export type BookingPrefill = { serviceId?: string; date?: string };
