import { apiFetch, buildQueryString, DEFAULT_COMPANY_ID } from './config';
import type { Customer, CustomerFormData, PaginatedResponse } from '@/types';

// Mock data for demo purposes
const mockCustomers: Customer[] = [
  { id: '1', companyId: '1', firstName: 'Anna', lastName: 'Andersson', email: 'anna@example.com', phone: '070-123 45 67' },
  { id: '2', companyId: '1', firstName: 'Johan', lastName: 'Johansson', email: 'johan@example.com', phone: '070-234 56 78' },
  { id: '3', companyId: '1', firstName: 'Maria', lastName: 'Svensson', email: 'maria@example.com', phone: '070-345 67 89' },
  { id: '4', companyId: '1', firstName: 'Erik', lastName: 'Karlsson', email: 'erik.k@example.com' },
  { id: '5', companyId: '1', firstName: 'Sara', lastName: 'Nilsson', email: 'sara@example.com', phone: '070-456 78 90' },
];

export async function getCustomers(page = 1, pageSize = 20): Promise<PaginatedResponse<Customer>> {
  const queryString = buildQueryString({
    companyId: DEFAULT_COMPANY_ID,
    page,
    pageSize,
  });

  try {
    return await apiFetch<PaginatedResponse<Customer>>(`/customers${queryString}`);
  } catch {
    // Return mock data if API is not available
    return {
      data: mockCustomers,
      total: mockCustomers.length,
      page,
      pageSize,
      totalPages: 1,
    };
  }
}

export async function getCustomer(id: string): Promise<Customer> {
  return apiFetch<Customer>(`/customers/${id}`);
}

export async function createCustomer(data: CustomerFormData): Promise<Customer> {
  return apiFetch<Customer>('/customers', {
    method: 'POST',
    body: JSON.stringify({
      ...data,
      companyId: DEFAULT_COMPANY_ID,
    }),
  });
}

export async function updateCustomer(id: string, data: Partial<CustomerFormData>): Promise<Customer> {
  return apiFetch<Customer>(`/customers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteCustomer(id: string): Promise<void> {
  return apiFetch<void>(`/customers/${id}`, {
    method: 'DELETE',
  });
}
