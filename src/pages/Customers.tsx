import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Users, Edit, Trash2, X, Save } from 'lucide-react';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '@/api/customers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { EmptyState } from '@/components/ui/EmptyState';
import { toast } from '@/hooks/use-toast';
import type { Customer, CustomerFormData } from '@/types';

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export default function Customers() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<CustomerFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['customers', page],
    queryFn: () => getCustomers(page, 10),
  });

  const createMutation = useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({ title: 'Kund skapad', description: 'Kunden har lagts till.' });
      closeDialog();
    },
    onError: (error: Error) => {
      toast({ title: 'Fel', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; formData: Partial<CustomerFormData> }) =>
      updateCustomer(data.id, data.formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({ title: 'Kund uppdaterad', description: 'Ändringarna har sparats.' });
      closeDialog();
    },
    onError: (error: Error) => {
      toast({ title: 'Fel', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({ title: 'Kund raderad', description: 'Kunden har tagits bort.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Fel', description: error.message, variant: 'destructive' });
    },
  });

  const openNewDialog = () => {
    setEditingCustomer(null);
    setFormData({ firstName: '', lastName: '', email: '', phone: '' });
    setErrors({});
    setDialogOpen(true);
  };

  const openEditDialog = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: customer.phone ?? '',
    });
    setErrors({});
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingCustomer(null);
    setFormData({ firstName: '', lastName: '', email: '', phone: '' });
    setErrors({});
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Förnamn krävs';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Efternamn krävs';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'E-post krävs';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ogiltig e-postadress';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (editingCustomer) {
      updateMutation.mutate({ id: editingCustomer.id, formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (customer: Customer) => {
    if (window.confirm(`Är du säker på att du vill radera ${customer.firstName} ${customer.lastName}?`)) {
      deleteMutation.mutate(customer.id);
    }
  };

  if (isLoading) {
    return <PageLoader />;
  }

  if (error) {
    return (
      <ErrorMessage
        message="Kunde inte ladda kunder. Kontrollera att API:et körs."
        onRetry={() => refetch()}
      />
    );
  }

  const customers = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;
  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="animate-fade-in">
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Kunder</h1>
          <p className="page-description">Hantera dina kunder</p>
        </div>
        <Button onClick={openNewDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Ny kund
        </Button>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        {customers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Inga kunder"
            description="Du har inte lagt till några kunder ännu."
            actionLabel="Lägg till kund"
            onAction={openNewDialog}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Namn</th>
                    <th>E-post</th>
                    <th>Telefon</th>
                    <th className="text-right">Åtgärder</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id}>
                      <td className="font-medium text-foreground">
                        {customer.firstName} {customer.lastName}
                      </td>
                      <td className="text-muted-foreground">{customer.email}</td>
                      <td className="text-muted-foreground">{customer.phone || '-'}</td>
                      <td className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(customer)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(customer)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-border flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Sida {page} av {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Föregående
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Nästa
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Customer Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCustomer ? 'Redigera kund' : 'Ny kund'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <Label htmlFor="firstName">Förnamn *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                  className={errors.firstName ? 'border-destructive' : ''}
                />
                {errors.firstName && <p className="form-error">{errors.firstName}</p>}
              </div>
              <div className="form-group">
                <Label htmlFor="lastName">Efternamn *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                  className={errors.lastName ? 'border-destructive' : ''}
                />
                {errors.lastName && <p className="form-error">{errors.lastName}</p>}
              </div>
            </div>
            <div className="form-group">
              <Label htmlFor="email">E-post *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && <p className="form-error">{errors.email}</p>}
            </div>
            <div className="form-group">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>
                Avbryt
              </Button>
              <Button type="submit" disabled={isSaving} className="gap-2">
                <Save className="h-4 w-4" />
                {isSaving ? 'Sparar...' : editingCustomer ? 'Spara' : 'Skapa'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
