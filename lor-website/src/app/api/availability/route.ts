import { NextResponse, type NextRequest } from "next/server";
import { getAvailableDates, getAvailableSlots, getSettings } from "@/lib/slots";

export const dynamic = "force-dynamic";

/**
 * GET /api/availability           -> { enabled, from, to, dates: [{ date, slots }] }
 * GET /api/availability?date=...  -> { enabled, slots: ["09:00", ...], slotMinutes }
 * Exposes only free time slots — never any patient data.
 */
export async function GET(req: NextRequest) {
  try {
    const settings = await getSettings();
    const headers = { "Cache-Control": "no-store" };
    if (!settings.bookingEnabled) return NextResponse.json({ enabled: false, dates: [], slots: [] }, { headers });
    const date = req.nextUrl.searchParams.get("date");
    if (date) return NextResponse.json({ enabled: true, slots: await getAvailableSlots(date), slotMinutes: settings.slotMinutes }, { headers });
    return NextResponse.json({ enabled: true, ...(await getAvailableDates()) }, { headers });
  } catch (e) {
    console.error("availability failed", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
