import { apiFetch, buildQueryString, DEFAULT_COMPANY_ID } from "./config";
import type { Employee, PaginatedResponse } from "@/types";

// ===========================
// HÄMTA ANSTÄLLDA (PAGINERAT ELLER ARRAY)
// ===========================
export async function getEmployees(
  page = 1,
  pageSize = 50
): Promise<PaginatedResponse<Employee> | Employee[]> {
  const queryString = buildQueryString({
    companyId: DEFAULT_COMPANY_ID,
    page,
    pageSize,
  });

  // Vi antar att API:t kan returnera antingen:
  // - PaginatedResponse<Employee>  (vanligast)
  // - Employee[]                   (om det är förenklad endpoint)
  return await apiFetch(`/employees${queryString}`);
}

// ===========================
// HÄMTA EN ANSTÄLLD
// ===========================
export async function getEmployee(id: string): Promise<Employee> {
  return await apiFetch<Employee>(`/employees/${id}`);
}

// ===========================
// HÄMTA ENDAST AKTIVA ANSTÄLLDA
// ===========================
export async function getActiveEmployees(): Promise<Employee[]> {
  const response = await getEmployees(1, 100);

  // Normalisera svaret till en ren lista oavsett format
  let employees: Employee[];

  if (Array.isArray(response)) {
    // API returnerar Employee[]
    employees = response;
  } else if (Array.isArray((response as PaginatedResponse<Employee>).data)) {
    // API returnerar PaginatedResponse<Employee>
    employees = (response as PaginatedResponse<Employee>).data;
  } else {
    employees = [];
  }

  // Filtrera fram endast aktiva
  return employees.filter((emp) => emp.isActive);
}
