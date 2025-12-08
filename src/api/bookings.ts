import { apiFetch, buildQueryString, DEFAULT_COMPANY_ID } from "./config";
import type { Booking, BookingFormData, PaginatedResponse } from "@/types";

// ===========================
// HÄMTA LISTA MED BOKNINGAR
// ===========================
export async function getBookings(
  page = 1,
  pageSize = 20,
  filters: {
    from?: string;
    to?: string;
    customerId?: string | number;
    employeeId?: string | number;
    status?: string;
  } = {}
): Promise<Booking[]> {
  const queryString = buildQueryString({
    companyId: DEFAULT_COMPANY_ID,
    page,
    pageSize,
    ...filters,
  });

  return apiFetch<Booking[]>(`/bookings${queryString}`);
}


// ===========================
// HÄMTA EN BOKNING
// ===========================
export async function getBooking(id: number | string): Promise<Booking> {
  return apiFetch<Booking>(`/bookings/${id}`);
}

// ===========================
// SKAPA BOKNING
// ===========================
export async function createBooking(
  data: BookingFormData
): Promise<Booking> {
  const body = {
    ...data,
    // se till att companyId **alltid** följer med och är 1
    companyId: DEFAULT_COMPANY_ID,
  };

  return apiFetch<Booking>("/bookings", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// ===========================
// UPPDATERA BOKNING
// ===========================
export async function updateBooking(
  id: number | string,
  data: Partial<BookingFormData>
): Promise<Booking> {
  const body = {
    ...data,
    // backend kräver ofta companyId även vid update – säkra upp
    companyId: DEFAULT_COMPANY_ID,
  };

  return apiFetch<Booking>(`/bookings/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

// ===========================
// RADERA BOKNING
// ===========================
export async function deleteBooking(
  id: number | string
): Promise<void> {
  await apiFetch<void>(`/bookings/${id}`, {
    method: "DELETE",
  });
}
