import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Plus, Filter, Calendar } from "lucide-react";

import { getBookings } from "@/api/bookings";
import { getActiveEmployees } from "@/api/employees";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageLoader } from "@/components/ui/LoadingSpinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";

import { format } from "date-fns";
import { sv } from "date-fns/locale";

import type {
  Booking,
  BookingFilters,
  Employee,
  BookingStatus,
} from "@/types";

export default function Bookings() {
  const navigate = useNavigate();

  const [filters, setFilters] = useState<BookingFilters>({
    page: 1,
    pageSize: 10,
  });

  // Hämta aktiva anställda till filtret
  const { data: employees } = useQuery<Employee[]>({
    queryKey: ["active-employees"],
    queryFn: getActiveEmployees,
  });

  // Hämta bokningar – BACKEND RETURNERAR Booking[]
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<Booking[]>({
    queryKey: ["bookings", filters],
    queryFn: () => getBookings(1, 20, filters),
  });

  const handleFilterChange = (key: keyof BookingFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
      page: 1,
    }));
  };

  if (isLoading) {
    return <PageLoader />;
  }

  if (error) {
    return (
      <ErrorMessage
        message="Kunde inte ladda bokningar. Kontrollera att API:et körs."
        onRetry={() => refetch()}
      />
    );
  }

  const bookings: Booking[] = data ?? [];

  return (
    <div className="animate-fade-in">
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Bokningar</h1>
          <p className="page-description">Hantera alla bokningar</p>
        </div>
        <Button
          onClick={() => navigate("/bookings/new")}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Ny bokning
        </Button>
      </div>

      {/* Filter */}
      <div className="bg-card rounded-xl border border-border shadow-card mb-6">
        <div className="p-4 border-b border-border flex items-center gap-2 text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span className="text-sm font-medium">Filter</span>
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="form-label mb-1.5 block">Från datum</label>
            <Input
              type="date"
              value={filters.startDate?.split("T")[0] ?? ""}
              onChange={(e) =>
                handleFilterChange(
                  "startDate",
                  e.target.value ? `${e.target.value}T00:00:00` : ""
                )
              }
            />
          </div>
          <div>
            <label className="form-label mb-1.5 block">Till datum</label>
            <Input
              type="date"
              value={filters.endDate?.split("T")[0] ?? ""}
              onChange={(e) =>
                handleFilterChange(
                  "endDate",
                  e.target.value ? `${e.target.value}T23:59:59` : ""
                )
              }
            />
          </div>
          <div>
            <label className="form-label mb-1.5 block">Status</label>
            <Select
              value={filters.status ?? "all"}
              onValueChange={(value) =>
                handleFilterChange("status", value === "all" ? "" : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Alla statusar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alla statusar</SelectItem>
                <SelectItem value="Booked">Bokad</SelectItem>
                <SelectItem value="Completed">Slutförd</SelectItem>
                <SelectItem value="Cancelled">Avbokad</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="form-label mb-1.5 block">Personal</label>
            <Select
              value={filters.employeeId?.toString() ?? "all"}
              onValueChange={(value) =>
                handleFilterChange(
                  "employeeId",
                  value === "all" ? "" : value
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Alla anställda" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alla anställda</SelectItem>
                {employees?.map((emp) => (
                  <SelectItem
                    key={emp.id}
                    value={emp.id.toString()}
                  >
                    {emp.firstName} {emp.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Bokningstabell */}
      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        {bookings.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="Inga bokningar hittades"
            description="Det finns inga bokningar som matchar dina filter, eller så har du inte skapat några bokningar än."
            actionLabel="Skapa bokning"
            onAction={() => navigate("/bookings/new")}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Kund</th>
                  <th>Datum & Tid</th>
                  <th>Personal</th>
                  <th>Status</th>
                  <th className="text-right">Åtgärd</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/bookings/${booking.id}`)}
                  >
                    <td>
                      <div className="font-medium text-foreground">
                        {booking.customerName ?? `Kund #${booking.customerId}`}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {booking.customer?.email ?? ""}
                      </div>
                    </td>
                    <td>
                      <div className="font-medium text-foreground">
                        {format(
                          new Date(booking.startTime),
                          "d MMMM yyyy",
                          { locale: sv }
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(
                          new Date(booking.startTime),
                          "HH:mm",
                          { locale: sv }
                        )}{" "}
                        -{" "}
                        {format(
                          new Date(booking.endTime),
                          "HH:mm",
                          { locale: sv }
                        )}
                      </div>
                    </td>
                    <td>
                      {booking.employeeName ?? `Anställd #${booking.employeeId}`}

                    </td>
                    <td>
                      <StatusBadge
                        status={booking.status as BookingStatus}
                      />
                    </td>
                    <td className="text-right">
                      <Button variant="ghost" size="sm">
                        Visa
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
