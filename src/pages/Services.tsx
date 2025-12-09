import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  getServices,
  createService,
  updateService,
  deleteService,
} from "@/api/services";

import type { Service, ServiceFormData } from "@/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function ServicesPage() {
  // -------------------------------------------
  // PAGINATION
  // -------------------------------------------
  const [page, setPage] = useState(1);
  const pageSize = 5; // antal tjänster per sida

  // -------------------------------------------
  // QUERY (HÄMTA TJÄNSTER)
  // -------------------------------------------
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery<Service[]>({
    queryKey: ["services"],
    queryFn: () => getServices(),
  });

  const allServices: Service[] = data ?? [];

  const totalPages = Math.max(1, Math.ceil(allServices.length / pageSize));

  const services = allServices.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // -------------------------------------------
  // EDIT STATE
  // -------------------------------------------
  const [editingId, setEditingId] = useState<string | null>(null);

  const [editForm, setEditForm] = useState<ServiceFormData>({
    name: "",
    description: "",
    durationMinutes: 0,
    price: 0,
  });

  function startEdit(service: Service) {
    setEditingId(service.id);
    setEditForm({
      name: service.name,
      description: service.description,
      durationMinutes: service.durationMinutes,
      price: service.price,
    });
  }

  // -------------------------------------------
  // UPDATE SERVICE
  // -------------------------------------------
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<ServiceFormData>;
    }) => updateService(id, data),
    onSuccess: () => {
      setEditingId(null);
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });

  // -------------------------------------------
  // DELETE SERVICE
  // -------------------------------------------
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });

  // -------------------------------------------
  // UI / RENDERING
  // -------------------------------------------
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold mb-2">Tjänster</h1>

      {/* LOADING */}
      {isLoading && <p>Laddar tjänster…</p>}

      {/* ERROR */}
      {isError && <p className="text-red-500">Kunde inte hämta tjänster.</p>}

      {/* TOMT */}
      {!isLoading && !isError && allServices.length === 0 && (
        <p>Du har inte lagt till några tjänster ännu.</p>
      )}

      {/* LISTA */}
      {!isLoading && !isError && services.length > 0 && (
        <div className="space-y-3">
          {services.map((service) => (
            <Card key={service.id}>
              <CardContent className="py-4 space-y-3">
                {/* VISA-LÄGE */}
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{service.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {service.description}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-medium">{service.price} kr</p>
                    <p className="text-xs text-muted-foreground">
                      {service.durationMinutes} min
                    </p>
                  </div>
                </div>

                {/* KNAPPAR */}
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startEdit(service)}
                  >
                    Redigera
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteMutation.mutate(service.id)}
                    disabled={deleteMutation.isPending}
                  >
                    Ta bort
                  </Button>
                </div>

                {/* EDIT FORM */}
                {editingId === service.id && (
                  <form
                    className="grid grid-cols-1 md:grid-cols-4 gap-3"
                    onSubmit={(e) => {
                      e.preventDefault();
                      updateMutation.mutate({
                        id: service.id,
                        data: editForm,
                      });
                    }}
                  >
                    <Input
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, name: e.target.value }))
                      }
                      placeholder="Namn"
                    />

                    <Input
                      value={editForm.description}
                      onChange={(e) =>
                        setEditForm((f) => ({
                          ...f,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Beskrivning"
                    />

                    <Input
                      type="number"
                      value={editForm.durationMinutes}
                      onChange={(e) =>
                        setEditForm((f) => ({
                          ...f,
                          durationMinutes: Number(e.target.value),
                        }))
                      }
                      placeholder="Minuter"
                    />

                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={editForm.price}
                        onChange={(e) =>
                          setEditForm((f) => ({
                            ...f,
                            price: Number(e.target.value),
                          }))
                        }
                        placeholder="Pris"
                      />

                      <Button type="submit" size="sm">
                        Spara
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingId(null)}
                      >
                        Avbryt
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          ))}

          {/* PAGINATION */}
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs text-muted-foreground">
              Sida {page} av {totalPages}
            </span>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Föregående
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Nästa
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
