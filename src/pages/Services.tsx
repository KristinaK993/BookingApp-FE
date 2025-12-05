import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Briefcase, Edit, Trash2, Save, Clock, Banknote } from 'lucide-react';
import { getServices, createService, updateService, deleteService } from '@/api/services';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { EmptyState } from '@/components/ui/EmptyState';
import { toast } from '@/hooks/use-toast';
import type { Service, ServiceFormData } from '@/types';

interface FormErrors {
  name?: string;
  description?: string;
  durationMinutes?: string;
  price?: string;
}

export default function Services() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<ServiceFormData>({
    name: '',
    description: '',
    durationMinutes: 60,
    price: 0,
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['services', page],
    queryFn: () => getServices(page, 10),
  });

  const createMutation = useMutation({
    mutationFn: createService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast({ title: 'Tjänst skapad', description: 'Tjänsten har lagts till.' });
      closeDialog();
    },
    onError: (error: Error) => {
      toast({ title: 'Fel', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; formData: Partial<ServiceFormData> }) =>
      updateService(data.id, data.formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast({ title: 'Tjänst uppdaterad', description: 'Ändringarna har sparats.' });
      closeDialog();
    },
    onError: (error: Error) => {
      toast({ title: 'Fel', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast({ title: 'Tjänst raderad', description: 'Tjänsten har tagits bort.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Fel', description: error.message, variant: 'destructive' });
    },
  });

  const openNewDialog = () => {
    setEditingService(null);
    setFormData({ name: '', description: '', durationMinutes: 60, price: 0 });
    setErrors({});
    setDialogOpen(true);
  };

  const openEditDialog = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description,
      durationMinutes: service.durationMinutes,
      price: service.price,
    });
    setErrors({});
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingService(null);
    setFormData({ name: '', description: '', durationMinutes: 60, price: 0 });
    setErrors({});
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Namn krävs';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Beskrivning krävs';
    }
    if (formData.durationMinutes <= 0) {
      newErrors.durationMinutes = 'Varaktighet måste vara större än 0';
    }
    if (formData.price < 0) {
      newErrors.price = 'Pris kan inte vara negativt';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (editingService) {
      updateMutation.mutate({ id: editingService.id, formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (service: Service) => {
    if (window.confirm(`Är du säker på att du vill radera "${service.name}"?`)) {
      deleteMutation.mutate(service.id);
    }
  };

  if (isLoading) {
    return <PageLoader />;
  }

  if (error) {
    return (
      <ErrorMessage
        message="Kunde inte ladda tjänster. Kontrollera att API:et körs."
        onRetry={() => refetch()}
      />
    );
  }

  const services = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;
  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="animate-fade-in">
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Tjänster</h1>
          <p className="page-description">Hantera dina tjänster och priser</p>
        </div>
        <Button onClick={openNewDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Ny tjänst
        </Button>
      </div>

      {/* Services Grid */}
      {services.length === 0 ? (
        <div className="bg-card rounded-xl border border-border shadow-card">
          <EmptyState
            icon={Briefcase}
            title="Inga tjänster"
            description="Du har inte lagt till några tjänster ännu."
            actionLabel="Lägg till tjänst"
            onAction={openNewDialog}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-card rounded-xl border border-border shadow-card p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-primary" />
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(service)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(service)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
              <h3 className="font-semibold text-foreground mb-2">{service.name}</h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {service.description}
              </p>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{service.durationMinutes} min</span>
                </div>
                <div className="flex items-center gap-1 text-foreground font-semibold">
                  <Banknote className="h-4 w-4" />
                  <span>{service.price} kr</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Föregående
          </Button>
          <span className="text-sm text-muted-foreground px-4">
            Sida {page} av {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Nästa
          </Button>
        </div>
      )}

      {/* Service Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingService ? 'Redigera tjänst' : 'Ny tjänst'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
              <Label htmlFor="name">Namn *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className={errors.name ? 'border-destructive' : ''}
                placeholder="T.ex. Hårklippning"
              />
              {errors.name && <p className="form-error">{errors.name}</p>}
            </div>
            <div className="form-group">
              <Label htmlFor="description">Beskrivning *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                className={errors.description ? 'border-destructive' : ''}
                placeholder="Beskriv tjänsten..."
                rows={3}
              />
              {errors.description && <p className="form-error">{errors.description}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <Label htmlFor="duration">Varaktighet (minuter) *</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={formData.durationMinutes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, durationMinutes: parseInt(e.target.value) || 0 }))
                  }
                  className={errors.durationMinutes ? 'border-destructive' : ''}
                />
                {errors.durationMinutes && <p className="form-error">{errors.durationMinutes}</p>}
              </div>
              <div className="form-group">
                <Label htmlFor="price">Pris (kr) *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, price: parseFloat(e.target.value) || 0 }))
                  }
                  className={errors.price ? 'border-destructive' : ''}
                />
                {errors.price && <p className="form-error">{errors.price}</p>}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>
                Avbryt
              </Button>
              <Button type="submit" disabled={isSaving} className="gap-2">
                <Save className="h-4 w-4" />
                {isSaving ? 'Sparar...' : editingService ? 'Spara' : 'Skapa'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
