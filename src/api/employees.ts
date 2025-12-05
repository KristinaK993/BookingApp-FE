import { apiFetch, buildQueryString, DEFAULT_COMPANY_ID } from './config';
import type { Employee, PaginatedResponse } from '@/types';

// Mock data for demo purposes
const mockEmployees: Employee[] = [
  { id: '1', companyId: '1', firstName: 'Erik', lastName: 'Eriksson', email: 'erik@example.com', phone: '070-111 22 33', isActive: true },
  { id: '2', companyId: '1', firstName: 'Lisa', lastName: 'Lindgren', email: 'lisa@example.com', phone: '070-222 33 44', isActive: true },
  { id: '3', companyId: '1', firstName: 'Anders', lastName: 'Andersson', email: 'anders@example.com', isActive: false },
];

export async function getEmployees(page = 1, pageSize = 50): Promise<PaginatedResponse<Employee>> {
  const queryString = buildQueryString({
    companyId: DEFAULT_COMPANY_ID,
    page,
    pageSize,
  });

  try {
    return await apiFetch<PaginatedResponse<Employee>>(`/employees${queryString}`);
  } catch {
    // Return mock data if API is not available
    return {
      data: mockEmployees,
      total: mockEmployees.length,
      page,
      pageSize,
      totalPages: 1,
    };
  }
}

export async function getEmployee(id: string): Promise<Employee> {
  try {
    return await apiFetch<Employee>(`/employees/${id}`);
  } catch {
    const emp = mockEmployees.find(e => e.id === id);
    if (emp) return emp;
    throw new Error('Employee not found');
  }
}

export async function getActiveEmployees(): Promise<Employee[]> {
  const response = await getEmployees(1, 100);
  return response.data.filter(emp => emp.isActive);
}
