// Domain types for BookingBase

export interface Company {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface Service {
  id: string;
  companyId: string;
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
}

export interface Employee {
  id: string;
  companyId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  isActive: boolean;
}

export interface Customer {
  id: string;
  companyId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export type BookingStatus = 'Booked' | 'Completed' | 'Cancelled';

export interface Booking {
  id: string;
  companyId: string;
  customerId: string;
  employeeId: string;
  serviceIds: string[];
  startTime: string;
  endTime: string;
  status: BookingStatus;
  notes?: string;
  // Populated fields from API
  customer?: Customer;
  employee?: Employee;
  services?: Service[];

   customerName?: string;
  employeeName?: string;
}

export interface DashboardSummary {
  bookingsToday: number;
  bookingsThisWeek: number;
  totalCustomers: number;
  totalRevenue: number;
  upcomingBookings: Booking[];
}

// API Response types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface BookingFilters {
  startDate?: string;
  endDate?: string;
  status?: BookingStatus;
  employeeId?: string;
  page?: number;
  pageSize?: number;
}

// Form types
export interface BookingFormData {
  customerId: string;
  employeeId: string;
  serviceIds: string[];
  startTime: string;
  notes?: string;
}

export interface CustomerFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export interface ServiceFormData {
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
}
