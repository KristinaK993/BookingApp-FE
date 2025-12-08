// src/api/customers.ts
import { apiFetch, buildQueryString, DEFAULT_COMPANY_ID } from "./config";
import type { CustomerFormData } from "@/types";

// Lista kunder med pagination
export async function getCustomers(page: number, pageSize: number) {
  const params = {
    companyId: DEFAULT_COMPANY_ID,
    page,
    pageSize,
  };

  const qs = buildQueryString(params);
  // Returnerar t.ex. { data: Customer[], totalPages, totalCount, page }
  return apiFetch(`/customers${qs}`);
}

// Skapa kund
export async function createCustomer(data: CustomerFormData) {
  return apiFetch("/customers", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Uppdatera kund
export async function updateCustomer(id: string, data: Partial<CustomerFormData>) {
  return apiFetch(`/customers/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// Ta bort kund
export async function deleteCustomer(id: string) {
  return apiFetch<void>(`/customers/${id}`, {
    method: "DELETE",
  });
}
