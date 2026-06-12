import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Loader2, Edit, Trash2, PlusCircle, RefreshCw, Layers } from 'lucide-react';
import ErrorDialog from '@/components/shadcn-studio/blocks/dashboard-dialog-22/dialog-error';

interface ServicesViewProps {
  onOpenCreateService: () => void;
  onOpenEditService: (service: any) => void;
}

export function ServicesView({ onOpenCreateService, onOpenEditService }: ServicesViewProps) {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadServices = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getServices();
      setServices(res.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const handleDelete = async (service: any) => {
    try {
      await api.deleteService(service.id);
      setServices((prev) => prev.filter((s) => s.id !== service.id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete service');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-sans">Service Catalog</h1>
          <p className="text-sm text-muted-foreground">Manage laundry master items, weight/piece pricing tiers, and active status.</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={loadServices}
            className="p-2 border border-border bg-background hover:bg-accent rounded-lg text-foreground transition-all cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={onOpenCreateService}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium text-sm flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add Service</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-60">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      ) : error ? (
        <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-lg p-4 font-medium flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={loadServices}
            className="bg-destructive/20 hover:bg-destructive/35 px-3 py-1 rounded text-xs transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.length > 0 ? (
            services.map((s) => (
              <div
                key={s.id}
                className="bg-card border border-border rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-primary/40 hover:shadow-md transition-all space-y-4"
              >
                {/* Upper Details */}
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <div className="bg-primary/10 text-primary rounded-lg p-2.5">
                        <Layers className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground text-sm tracking-tight leading-snug">{s.service_name}</h3>
                        <p className="text-xs text-muted-foreground">Unit: {s.unit}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      s.status === 'active'
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : 'bg-destructive/10 text-destructive'
                    }`}>
                      {s.status}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-border/60">
                    <span className="text-xs text-muted-foreground block">Pricing Rate</span>
                    <span className="text-lg font-bold text-foreground">
                      Rp {Number(s.price).toLocaleString()} <span className="text-xs font-medium text-muted-foreground">/ {s.unit}</span>
                    </span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex space-x-2 pt-3 border-t border-border">
                  <button
                    onClick={() => onOpenEditService(s)}
                    className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/85 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    <span>Edit Service</span>
                  </button>
                  <ErrorDialog
                    title="Delete Service"
                    description={`Are you sure you want to delete service "${s.service_name}"?`}
                    onConfirm={() => handleDelete(s)}
                    showCheckbox={false}
                    trigger={
                      <button
                        className="bg-destructive/10 text-destructive hover:bg-destructive/20 p-2 rounded-lg transition-colors cursor-pointer"
                        title="Delete service"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    }
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-sm text-muted-foreground bg-muted/40 rounded-xl border border-dashed border-border">
              No laundry services found in catalog. Create a new service above.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
