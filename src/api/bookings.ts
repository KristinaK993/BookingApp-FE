import { apiFetch, buildQueryString, DEFAULT_COMPANY_ID } from './config';
import type { Booking, BookingFilters, BookingFormData, PaginatedResponse } from '@/types';

// Mock data for demo purposes when API is not available
const mockBookings: Booking[] = [
  {
    id: '1',
    companyId: '1',
    customerId: '1',
    employeeId: '1',
    serviceIds: ['1'],
    startTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    endTime: new Date(Date.now() + 86400000 + 3600000).toISOString(),
    status: 'Booked',
    notes: 'Första bokningen',
    customer: { id: '1', companyId: '1', firstName: 'Anna', lastName: 'Andersson', email: 'anna@example.com', phone: '070-123 45 67' },
    employee: { id: '1', companyId: '1', firstName: 'Erik', lastName: 'Eriksson', email: 'erik@example.com', isActive: true },
  },
  {
    id: '2',
    companyId: '1',
    customerId: '2',
    employeeId: '1',
    serviceIds: ['1', '2'],
    startTime: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
    endTime: new Date(Date.now() + 172800000 + 5400000).toISOString(),
    status: 'Booked',
    customer: { id: '2', companyId: '1', firstName: 'Johan', lastName: 'Johansson', email: 'johan@example.com' },
    employee: { id: '1', companyId: '1', firstName: 'Erik', lastName: 'Eriksson', email: 'erik@example.com', isActive: true },
  },
  {
    id: '3',
    companyId: '1',
    customerId: '3',
    employeeId: '2',
    serviceIds: ['2'],
    startTime: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    endTime: new Date(Date.now() - 86400000 + 3600000).toISOString(),
    status: 'Completed',
    customer: { id: '3', companyId: '1', firstName: 'Maria', lastName: 'Svensson', email: 'maria@example.com' },
    employee: { id: '2', companyId: '1', firstName: 'Lisa', lastName: 'Lindgren', email: 'lisa@example.com', isActive: true },
  },
];

export async function getBookings(filters: BookingFilters = {}): Promise<PaginatedResponse<Booking>> {
  const queryString = buildQueryString({
    companyId: DEFAULT_COMPANY_ID,
    startDate: filters.startDate,
    endDate: filters.endDate,
    status: filters.status,
    employeeId: filters.employeeId,
    page: filters.page,
    pageSize: filters.pageSize,
  });

  try {
    return await apiFetch<PaginatedResponse<Booking>>(`/bookings${queryString}`);
  } catch {
    // Return mock data if API is not available
    let filtered = [...mockBookings];
    
    if (filters.status) {
      filtered = filtered.filter(b => b.status === filters.status);
    }
    if (filters.employeeId) {
      filtered = filtered.filter(b => b.employeeId === filters.employeeId);
    }
    
    return {
      data: filtered,
      total: filtered.length,
      page: filters.page ?? 1,
      pageSize: filters.pageSize ?? 10,
      totalPages: 1,
    };
  }
}

export async function getBooking(id: string): Promise<Booking> {
  return apiFetch<Booking>(`/bookings/${id}`);
}

export async function createBooking(data: BookingFormData): Promise<Booking> {
  return apiFetch<Booking>('/bookings', {
    method: 'POST',
    body: JSON.stringify({
      ...data,
      companyId: DEFAULT_COMPANY_ID,
    }),
  });
}

export async function updateBooking(id: string, data: Partial<BookingFormData>): Promise<Booking> {
  return apiFetch<Booking>(`/bookings/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function updateBookingStatus(id: string, status: string): Promise<Booking> {
  return apiFetch<Booking>(`/bookings/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function deleteBooking(id: string): Promise<void> {
  return apiFetch<void>(`/bookings/${id}`, {
    method: 'DELETE',
  });
}
