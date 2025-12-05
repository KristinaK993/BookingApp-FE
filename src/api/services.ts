import { apiFetch, buildQueryString, DEFAULT_COMPANY_ID } from './config';
import type { Service, ServiceFormData, PaginatedResponse } from '@/types';

// Mock data for demo purposes
const mockServices: Service[] = [
  { id: '1', companyId: '1', name: 'Konsultation', description: 'Inledande konsultation för att diskutera behov och önskemål.', durationMinutes: 30, price: 500 },
  { id: '2', companyId: '1', name: 'Standard behandling', description: 'Vår mest populära behandling som passar de flesta behov.', durationMinutes: 60, price: 950 },
  { id: '3', companyId: '1', name: 'Premium paket', description: 'Komplett behandling med extra tid och uppföljning.', durationMinutes: 90, price: 1500 },
  { id: '4', companyId: '1', name: 'Express service', description: 'Snabb service för dig som har ont om tid.', durationMinutes: 20, price: 350 },
];

export async function getServices(page = 1, pageSize = 20): Promise<PaginatedResponse<Service>> {
  const queryString = buildQueryString({
    companyId: DEFAULT_COMPANY_ID,
    page,
    pageSize,
  });

  try {
    return await apiFetch<PaginatedResponse<Service>>(`/services${queryString}`);
  } catch {
    // Return mock data if API is not available
    return {
      data: mockServices,
      total: mockServices.length,
      page,
      pageSize,
      totalPages: 1,
    };
  }
}

export async function getService(id: string): Promise<Service> {
  return apiFetch<Service>(`/services/${id}`);
}

export async function createService(data: ServiceFormData): Promise<Service> {
  return apiFetch<Service>('/services', {
    method: 'POST',
    body: JSON.stringify({
      ...data,
      companyId: DEFAULT_COMPANY_ID,
    }),
  });
}

export async function updateService(id: string, data: Partial<ServiceFormData>): Promise<Service> {
  return apiFetch<Service>(`/services/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteService(id: string): Promise<void> {
  return apiFetch<void>(`/services/${id}`, {
    method: 'DELETE',
  });
}
