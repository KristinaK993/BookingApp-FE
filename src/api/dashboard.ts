import { apiFetch, DEFAULT_COMPANY_ID } from './config';
import type { DashboardSummary } from '@/types';

export async function getDashboardSummary(): Promise<DashboardSummary> {
  try {
    return await apiFetch<DashboardSummary>(`/dashboard/summary?companyId=${DEFAULT_COMPANY_ID}`);
  } catch {
    // Return mock data if endpoint doesn't exist yet
    return {
      bookingsToday: 5,
      bookingsThisWeek: 23,
      totalCustomers: 48,
      totalRevenue: 12500,
      upcomingBookings: [],
    };
  }
}
