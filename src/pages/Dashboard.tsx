import { useQuery } from "@tanstack/react-query";
import { Calendar, Users, TrendingUp, Clock } from "lucide-react";
import { getDashboardSummary } from "@/api/dashboard";
import { getBookings } from "@/api/bookings";
import { PageLoader } from "@/components/ui/LoadingSpinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import { Link } from "react-router-dom";
import { LogoutButton } from "@/components/ui/LogoutButton";


export default function Dashboard() {
  const {
    data: summary,
    isLoading: summaryLoading,
    error: summaryError,
    refetch: refetchSummary,
  } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: getDashboardSummary,
  });

  const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
    queryKey: ["upcoming-bookings"],
    queryFn: () =>
      getBookings({
        startDate: new Date().toISOString(),
        status: "Booked",
        pageSize: 5,
      }),
  });

  if (summaryLoading || bookingsLoading) {
    return <PageLoader />;
  }

  if (summaryError) {
    return (
      <ErrorMessage
        message="Kunde inte ladda dashboard-data"
        onRetry={() => refetchSummary()}
      />
    );
  }

  const stats = [
    {
      name: "Bokningar idag",
      value: summary?.bookingsToday ?? 0,
      icon: Calendar,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      name: "Denna vecka",
      value: summary?.bookingsThisWeek ?? 0,
      icon: TrendingUp,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      name: "Totalt kunder",
      value: summary?.totalCustomers ?? 0,
      icon: Users,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      name: "Intäkter (kr)",
      value: (summary?.totalRevenue ?? 0).toLocaleString("sv-SE"),
      icon: TrendingUp,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ];

  const upcomingBookings =
    bookingsData?.data ?? summary?.upcomingBookings ?? [];

  return (
    <div className="animate-fade-in">
      {/* Header med titel + beskrivning + logout-knapp */}
      <div className="page-header mb-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-description">
              Välkommen tillbaka! Här är en översikt av dina bokningar.
            </p>
          </div>
          <LogoutButton />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.name}
                </p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {stat.value}
                </p>
              </div>
              <div
                className={`h-12 w-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}
              >
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming Bookings */}
      <div className="bg-card rounded-xl border border-border shadow-card">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Kommande bokningar
            </h2>
            <p className="text-sm text-muted-foreground">
              Bokningar som är planerade
            </p>
          </div>
          <Link
            to="/bookings"
            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Visa alla →
          </Link>
        </div>

        {upcomingBookings.length === 0 ? (
          <div className="p-8 text-center">
            <Clock className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground">Inga kommande bokningar</p>
            <Link
              to="/bookings/new"
              className="text-primary text-sm hover:underline mt-1 inline-block"
            >
              Skapa en ny bokning
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {upcomingBookings.map((booking) => (
              <Link
                key={booking.id}
                to={`/bookings/${booking.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {booking.customer
                        ? `${booking.customer.firstName} ${booking.customer.lastName}`
                        : `Kund #${booking.customerId}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(
                        new Date(booking.startTime),
                        "d MMM 'kl.' HH:mm",
                        { locale: sv }
                      )}
                    </p>
                  </div>
                </div>
                <StatusBadge status={booking.status} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
