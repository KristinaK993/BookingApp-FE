import { apiFetch, buildQueryString, DEFAULT_COMPANY_ID } from "./config";
import type { Customer, CustomerFormData } from "@/types";

// ===========================
// HÄMTA LISTA MED KUNDER
// ===========================
export async function getCustomers(
  page = 1,
  pageSize = 50
): Promise<Customer[]> {
  const query = buildQueryString({
    companyId: DEFAULT_COMPANY_ID,
    page,
    pageSize,
  });

  return apiFetch<Customer[]>(`/customers${query}`);
}

// ===========================
// SKAPA KUND
// ===========================
export async function createCustomer(data: CustomerFormData) {
  const body = {
    ...data,
    companyId: DEFAULT_COMPANY_ID,
  };

  return apiFetch<Customer>("/customers", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// ===========================
// UPPDATERA KUND
// ===========================
// ===========================
// UPPDATERA KUND
// ===========================
export async function updateCustomer(id: number, data: CustomerFormData) {
  const body = {
    id,                        
    ...data,
    companyId: DEFAULT_COMPANY_ID,
  };

  return apiFetch<Customer>(`/customers/${id}?companyId=${DEFAULT_COMPANY_ID}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

// ===========================
// RADERA KUND
// ===========================
export async function deleteCustomer(id: number) {
  return apiFetch<void>(`/customers/${id}?companyId=${DEFAULT_COMPANY_ID}`, {
  method: "DELETE",
}); 
}
