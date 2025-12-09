import { apiFetch, DEFAULT_COMPANY_ID } from "./config";
import type { DashboardSummary, Booking } from "@/types";

export async function getDashboardSummary(): Promise<DashboardSummary> {
  // Hämta riktiga bokningar från API:t
  const bookings = await apiFetch<Booking[]>(
    `/bookings?companyId=${DEFAULT_COMPANY_ID}`
  );

  const now = new Date();

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const startOfWeek = new Date();
  const day = startOfWeek.getDay(); // 0 = söndag
  const diff = (day + 6) % 7;       // hur många dagar sen måndag
  startOfWeek.setDate(startOfWeek.getDate() - diff);
  startOfWeek.setHours(0, 0, 0, 0);

  const bookingsToday = bookings.filter(b => {
    const d = new Date(b.startTime);
    return d >= startOfToday;
  }).length;

  const bookingsThisWeek = bookings.filter(b => {
    const d = new Date(b.startTime);
    return d >= startOfWeek;
  }).length;

  const totalCustomers = new Set(
    bookings.map(b => b.customerId)
  ).size;

 const totalRevenue = bookings
  .filter(b => b.status === "Completed")
  .reduce((sum, b) => {
    const pricePerBooking = b.services?.reduce(
      (srvSum, srv) => srvSum + srv.price,
      0
    ) ?? 0;

    return sum + pricePerBooking;
  }, 0);


  const upcomingBookings = bookings
    .filter(b => {
      const d = new Date(b.startTime);
      return d > now && b.status === "Booked";
    })
    .sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    )
    .slice(0, 5);

  return {
    bookingsToday,
    bookingsThisWeek,
    totalCustomers,
    totalRevenue,
    upcomingBookings,
  };
}
