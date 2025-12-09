import { useState } from "react";
import type React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "@/api/customers";
import type { Customer, CustomerFormData } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function CustomersPage() {
  // -------------------------------------------
  // PAGINATION
  // -------------------------------------------
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const queryClient = useQueryClient();

  // -------------------------------------------
  // FETCH CUSTOMERS
  // -------------------------------------------
  const { data, isLoading, isError } = useQuery({
    queryKey: ["customers"],
    queryFn: () => getCustomers(1, 200),
  });

  const raw = data as any;
  const allCustomers: Customer[] = (raw?.data ?? raw ?? []) as Customer[];
  const totalPages = Math.max(1, Math.ceil(allCustomers.length / pageSize));
  const customers = allCustomers.slice((page - 1) * pageSize, page * pageSize);

  // -------------------------------------------
  // CREATE FORM STATE
  // -------------------------------------------
  const [createForm, setCreateForm] = useState<CustomerFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const createMutation = useMutation({
    mutationFn: (data: CustomerFormData) => createCustomer(data),
    onSuccess: () => {
      setCreateForm({ firstName: "", lastName: "", email: "", phone: "" });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });

  // -------------------------------------------
  // EDIT STATE
  // -------------------------------------------
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<CustomerFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  function startEdit(c: Customer) {
    setEditingId(c.id);
    setEditForm({
      firstName: c.firstName,
      lastName: c.lastName,
      email: c.email ?? "",
      phone: c.phone ?? "",
    });
  }

  // -------------------------------------------
  // UPDATE MUTATION  
  // -------------------------------------------
 const updateMutation = useMutation({
  mutationFn: ({ id, data }: { id: number; data: CustomerFormData }) =>
    updateCustomer(id, data),
  onSuccess: () => {
    console.log("Uppdatering lyckades");
    queryClient.invalidateQueries({ queryKey: ["customers"] });
    setEditingId(null);
  },
  onError: (error) => {
    console.error("Fel vid uppdatering:", error);
  },
});


  // -------------------------------------------
  // DELETE MUTATION
  // -------------------------------------------
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });

  // -------------------------------------------
  // HANDLERS
  // -------------------------------------------
  function handleCreateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setCreateForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleEditChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!createForm.firstName || !createForm.lastName) return;
    createMutation.mutate(createForm);
  }

  // -------------------------------------------
  // UI RENDERING
  // -------------------------------------------
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold mb-2">Kunder</h1>

      {/* NY KUND */}
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Lägg till ny kund</CardTitle>
        </CardHeader>

        <CardContent>
          <form className="space-y-4" onSubmit={handleCreateSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Förnamn</Label>
                <Input name="firstName" value={createForm.firstName} onChange={handleCreateChange} required />
              </div>

              <div>
                <Label>Efternamn</Label>
                <Input name="lastName" value={createForm.lastName} onChange={handleCreateChange} required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>E-post</Label>
                <Input name="email" type="email" value={createForm.email} onChange={handleCreateChange} />
              </div>

              <div>
                <Label>Telefon</Label>
                <Input name="phone" value={createForm.phone} onChange={handleCreateChange} />
              </div>
            </div>

            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Sparar…" : "Spara kund"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* LADDARE / FEL */}
      {isLoading && <p>Laddar kunder…</p>}
      {isError && <p className="text-red-500">Kunde inte hämta kunder.</p>}

      {/* KUNDLISTA */}
      {!isLoading && !isError && customers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Befintliga kunder</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            {customers.map((c) => (
              <div key={c.id} className="border rounded-md p-4 space-y-3">
                {/* Visa-läge */}
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">
                      {c.firstName} {c.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {c.email} {c.phone && `· ${c.phone}`}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => startEdit(c)}>
                      Redigera
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteMutation.mutate(c.id)}
                    >
                      Ta bort
                    </Button>
                  </div>
                </div>

                {/* Edit-läge */}
                {editingId === c.id && (
                  <form
                    className="grid grid-cols-1 md:grid-cols-4 gap-3"
                    onSubmit={(e) => {
                      e.preventDefault();
                      updateMutation.mutate({
                        id: c.id,         
                        data: editForm,   
                      });
                    }}
                  >
                    <Input name="firstName" value={editForm.firstName} onChange={handleEditChange} />
                    <Input name="lastName" value={editForm.lastName} onChange={handleEditChange} />
                    <Input name="email" type="email" value={editForm.email} onChange={handleEditChange} />

                    <div className="flex gap-2">
                      <Input name="phone" value={editForm.phone} onChange={handleEditChange} />
                      <Button type="submit" size="sm">Spara</Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => setEditingId(null)}>
                        Avbryt
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            ))}

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
              <span className="text-xs text-muted-foreground">
                Sida {page} av {totalPages}
              </span>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                  Föregående
                </Button>
                <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                  Nästa
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
