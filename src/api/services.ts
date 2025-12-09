import { apiFetch, buildQueryString, DEFAULT_COMPANY_ID } from "./config";
import type { Service, ServiceFormData } from "@/types";

export async function getServices(
  page = 1,
  pageSize = 20
): Promise<Service[]> {
  const queryString = buildQueryString({
    companyId: DEFAULT_COMPANY_ID,
    page,
    pageSize,
  });

  return apiFetch<Service[]>(`/services${queryString}`);
}

export async function getService(id: string): Promise<Service> {
  return apiFetch<Service>(`/services/${id}`);
}

export async function createService(data: ServiceFormData): Promise<Service> {
  return apiFetch<Service>("/services", {
    method: "POST",
    body: JSON.stringify({
      ...data,
      companyId: DEFAULT_COMPANY_ID,
    }),
  });
}

export async function updateService(
  id: string,
  data: Partial<ServiceFormData>
): Promise<Service> {
  return apiFetch<Service>(`/services/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteService(id: string): Promise<void> {
  return apiFetch<void>(`/services/${id}`, {
    method: "DELETE",
  });
}
