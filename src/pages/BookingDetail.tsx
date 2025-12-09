import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {useQuery,useMutation,useQueryClient,} from "@tanstack/react-query";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import {getBooking,createBooking,updateBooking,deleteBooking,} from "@/api/bookings";
import { getCustomers } from "@/api/customers";
import { getActiveEmployees } from "@/api/employees";
import { getServices } from "@/api/services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue,} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { PageLoader } from "@/components/ui/LoadingSpinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { toast } from "@/hooks/use-toast";
import type {BookingFormData,BookingStatus,Customer,Service,Employee,} from "@/types";

interface FormErrors {
  customerId?: string;
  employeeId?: string;
  serviceIds?: string;
  startTime?: string;
}

export default function BookingDetail() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === "new";
  const bookingId = !isNew && id ? Number(id) : undefined;

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<BookingFormData>({
    customerId: "",
    employeeId: "",
    serviceIds: [],
    startTime: "",
    notes: "",
  });

  const [status, setStatus] = useState<BookingStatus>("Booked");
  const [errors, setErrors] = useState<FormErrors>({});

  // =====================
  // FETCH BOOKING (EDIT)
  // =====================
  const {
    data: booking,
    isLoading: bookingLoading,
    error: bookingError,
  } = useQuery({
    queryKey: ["booking", id],
    queryFn: () => getBooking(Number(id)),
    enabled: !isNew && !!id,
  });

  // =====================
  // FETCH DROPDOWNS
  // =====================

const { data: customersData } = useQuery({
  queryKey: ["customers-dropdown"],
  queryFn: () => getCustomers(1, 100),
});

const {
  data: employees = [],
  isLoading: employeesLoading,
  error: employeesError,
} = useQuery({
  queryKey: ["active-employees"],
  queryFn: getActiveEmployees,
});

const { data: servicesData } = useQuery({
  queryKey: ["services-dropdown"],
  queryFn: () => getServices(1, 100),
});

// säkerställ alltid arrays (oavsett om API:t skickar [] eller { data: [] })
const customers: Customer[] = Array.isArray(customersData)
  ? customersData
  : (customersData as any)?.data ?? [];

console.log("employees i BookingDetail:", employees, employeesError);

const services: Service[] = Array.isArray(servicesData)
  ? servicesData
  : (servicesData as any)?.data ?? [];

console.log("employees:", employees);

  // =====================
  // MUTATIONS
  // =====================
  const createMutation = useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast({
        title: "Bokning skapad",
        description: "Bokningen har skapats.",
      });
      navigate("/bookings");
    },
    onError: (err: any) => {
      toast({
        title: "Fel vid skapande",
        description: err?.message ?? "Något gick fel.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<BookingFormData>) =>
      updateBooking(bookingId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["booking", id] });
      toast({
        title: "Bokning uppdaterad",
        description: "Ändringarna har sparats.",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Fel vid uppdatering",
        description: err?.message ?? "Något gick fel.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteBooking(bookingId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast({
        title: "Bokning raderad",
        description: "Bokningen har tagits bort.",
      });
      navigate("/bookings");
    },
    onError: (err: any) => {
      toast({
        title: "Fel vid radering",
        description: err?.message ?? "Något gick fel.",
        variant: "destructive",
      });
    },
  });

  // =====================
  // POPULATE FORM VID EDIT
  // =====================
  useEffect(() => {
    if (!booking) return;

    const b: any = booking;

    const serviceIdsFromBooking: string[] =
      b.serviceIds?.map((id: number | string) => String(id)) ??
      b.services?.map((s: any) => String(s.serviceId)) ??
      [];

    setFormData({
      customerId: b.customerId ? String(b.customerId) : "",
      employeeId: b.employeeId ? String(b.employeeId) : "",
      serviceIds: serviceIdsFromBooking,
      startTime: b.startTime ? b.startTime.slice(0, 16) : "",
      notes: b.notes ?? "",
    });

    setStatus((b.status as BookingStatus) ?? "Booked");
  }, [booking]);

  // =====================
  // VALIDERING
  // =====================

const validate = (): boolean => {
  const newErrors: FormErrors = {};

  if (!formData.customerId) newErrors.customerId = "Välj en kund";
  if (!formData.employeeId) newErrors.employeeId = "Välj personal";
  if (formData.serviceIds.length === 0)
    newErrors.serviceIds = "Välj minst en tjänst";

  if (!formData.startTime) {
    newErrors.startTime = "Ange datum och tid";
  } else {
    const start = new Date(formData.startTime);
    const now = new Date();

    if (start < now) {
      newErrors.startTime =
        "Du kan inte boka ett datum/tid som redan har passerat";
    }
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

  // =====================
  // HANDLERS
  // =====================
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (isNew) createMutation.mutate(formData);
    else updateMutation.mutate(formData);
  };

  const handleServiceToggle = (serviceId: string) => {
    setFormData((prev) => ({
      ...prev,
      serviceIds: prev.serviceIds.includes(serviceId)
        ? prev.serviceIds.filter((id) => id !== serviceId)
        : [...prev.serviceIds, serviceId],
    }));
  };

  const handleDelete = () => {
    if (
      window.confirm(
        "Är du säker på att du vill radera denna bokning?"
      )
    ) {
      deleteMutation.mutate();
    }
  };

  // =====================
  // LOADING / ERROR
  // =====================
  if (!isNew && bookingLoading) {
    return <PageLoader />;
  }

  if (bookingError) {
    return (
      <ErrorMessage
        message="Kunde inte ladda bokningen"
        onRetry={() => navigate("/bookings")}
      />
    );
  }

  const isSaving =
    createMutation.isPending || updateMutation.isPending;

  // =====================
  // RENDER
  // =====================
  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <button
          onClick={() => navigate("/bookings")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Tillbaka till bokningar
        </button>
        <h1 className="page-title">
          {isNew ? "Ny bokning" : "Redigera bokning"}
        </h1>
        <p className="page-description">
          {isNew
            ? "Fyll i formuläret för att skapa en ny bokning"
            : "Uppdatera bokningens uppgifter"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="bg-card rounded-xl border border-border shadow-card p-6 space-y-6">
          {/* Customer */}
          <div className="form-group">
            <Label htmlFor="customer">Kund *</Label>
            <Select
              value={formData.customerId}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  customerId: value,
                }))
              }
            >
              <SelectTrigger
                className={
                  errors.customerId ? "border-destructive" : ""
                }
              >
                <SelectValue placeholder="Välj kund" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem
                    key={customer.id}
                    value={customer.id.toString()}
                  >
                    {customer.firstName} {customer.lastName} (
                    {customer.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.customerId && (
              <p className="form-error">{errors.customerId}</p>
            )}
          </div>

          {/* Employee */}
<div className="form-group">
  <Label htmlFor="employee">Personal *</Label>
  <Select
    value={formData.employeeId}
    onValueChange={(value) =>
      setFormData((prev) => ({
        ...prev,
        employeeId: value,
      }))
    }
  >
    <SelectTrigger
      className={errors.employeeId ? "border-destructive" : ""}
    >
      <SelectValue placeholder="Välj personal" />
    </SelectTrigger>
  <SelectContent>
  {employees.map((emp) => (
    <SelectItem key={emp.id} value={emp.id.toString()}>
      {emp.firstName} {emp.lastName}
    </SelectItem>
  ))}
</SelectContent>
  </Select>
  {errors.employeeId && (
    <p className="form-error">{errors.employeeId}</p>
  )}
</div>


          {/* Services */}
          <div className="form-group">
            <Label>Tjänster *</Label>
            <div
              className={`mt-2 space-y-2 p-4 rounded-lg border ${
                errors.serviceIds
                  ? "border-destructive"
                  : "border-border"
              } bg-muted/30`}
            >
              {services.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Inga tjänster tillgängliga
                </p>
              ) : (
                services.map((service) => (
                  <div
                    key={service.id}
                    className="flex items-center gap-3"
                  >
                    <Checkbox
                      id={`service-${service.id}`}
                      checked={formData.serviceIds.includes(
                        service.id.toString()
                      )}
                      onCheckedChange={() =>
                        handleServiceToggle(service.id.toString())
                      }
                    />
                    <label
                      htmlFor={`service-${service.id}`}
                      className="text-sm cursor-pointer flex-1"
                    >
                      <span className="font-medium">
                        {service.name}
                      </span>
                      <span className="text-muted-foreground ml-2">
                        ({service.durationMinutes} min,{" "}
                        {service.price} kr)
                      </span>
                    </label>
                  </div>
                ))
              )}
            </div>
            {errors.serviceIds && (
              <p className="form-error">{errors.serviceIds}</p>
            )}
          </div>

          {/* Date & Time */}
          <div className="form-group">
            <Label htmlFor="startTime">Datum och tid *</Label>
            <Input
              id="startTime"
              type="datetime-local"
              value={formData.startTime}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  startTime: e.target.value,
                }))
              }
              className={
                errors.startTime ? "border-destructive" : ""
              }
            />
            {errors.startTime && (
              <p className="form-error">{errors.startTime}</p>
            )}
          </div>

          {/* Notes */}
          <div className="form-group">
            <Label htmlFor="notes">Anteckningar</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  notes: e.target.value,
                }))
              }
              placeholder="Valfria anteckningar om bokningen..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            {!isNew && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Radera
              </Button>
            )}
            <div className={`flex gap-3 ${isNew ? "ml-auto" : ""}`}>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/bookings")}
              >
                Avbryt
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                {isSaving
                  ? "Sparar..."
                  : isNew
                  ? "Skapa bokning"
                  : "Spara ändringar"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
