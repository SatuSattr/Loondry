import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Loader2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ServiceFormProps {
  service?: any; // If present, it's Edit mode
  onSubmitSuccess: () => void;
  onCancel: () => void;
}

export function ServiceForm({ service, onSubmitSuccess, onCancel }: ServiceFormProps) {
  const [serviceName, setServiceName] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('Kg');
  const [status, setStatus] = useState('active');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (service) {
      setServiceName(service.service_name || '');
      setPrice(service.price ? String(service.price) : '');
      setUnit(service.unit || 'Kg');
      setStatus(service.status || 'active');
      setError('');
    } else {
      setServiceName('');
      setPrice('');
      setUnit('Kg');
      setStatus('active');
      setError('');
    }
  }, [service]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      service_name: serviceName,
      price: Number(price),
      unit,
      status,
    };

    try {
      if (service) {
        await api.updateService(service.id, payload);
      } else {
        await api.createService(payload);
      }
      onSubmitSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to save service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-lg p-3 text-sm font-medium">
          {error}
        </div>
      )}

      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground">Service Name *</label>
        <input
          type="text"
          required
          value={serviceName}
          onChange={(e) => setServiceName(e.target.value)}
          placeholder="e.g. Wash & Iron Express"
          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground">Price per Unit (Rp) *</label>
        <input
          type="number"
          required
          min="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="e.g. 10000"
          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">Unit *</label>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full justify-between text-sm font-normal border-border bg-background hover:bg-accent text-foreground cursor-pointer"
                >
                  <span>{unit}</span>
                  <ChevronDown className="h-4 w-4 opacity-50 ml-2" />
                </Button>
              }
            />
            <DropdownMenuContent className="w-[150px] bg-card border border-border rounded-lg shadow-lg z-50 py-1" align="start">
              <DropdownMenuItem
                onClick={() => setUnit('Kg')}
                className={`w-full text-left px-3 py-1.5 text-xs transition-colors hover:bg-accent/80 cursor-pointer ${
                  unit === 'Kg' ? 'bg-primary/10 text-primary font-semibold' : 'text-foreground'
                }`}
              >
                Kg
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setUnit('Pcs')}
                className={`w-full text-left px-3 py-1.5 text-xs transition-colors hover:bg-accent/80 cursor-pointer ${
                  unit === 'Pcs' ? 'bg-primary/10 text-primary font-semibold' : 'text-foreground'
                }`}
              >
                Pcs
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">Status *</label>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full justify-between text-sm font-normal border-border bg-background hover:bg-accent text-foreground cursor-pointer"
                >
                  <span className="capitalize">{status}</span>
                  <ChevronDown className="h-4 w-4 opacity-50 ml-2" />
                </Button>
              }
            />
            <DropdownMenuContent className="w-[150px] bg-card border border-border rounded-lg shadow-lg z-50 py-1" align="start">
              <DropdownMenuItem
                onClick={() => setStatus('active')}
                className={`w-full text-left px-3 py-1.5 text-xs transition-colors hover:bg-accent/80 cursor-pointer ${
                  status === 'active' ? 'bg-primary/10 text-primary font-semibold' : 'text-foreground'
                }`}
              >
                Active
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setStatus('inactive')}
                className={`w-full text-left px-3 py-1.5 text-xs transition-colors hover:bg-accent/80 cursor-pointer ${
                  status === 'inactive' ? 'bg-primary/10 text-primary font-semibold' : 'text-foreground'
                }`}
              >
                Inactive
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex space-x-3 pt-4 border-t border-border mt-6">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/80 py-2 px-4 rounded-lg font-medium transition-colors cursor-pointer text-sm text-center disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-2 bg-primary text-primary-foreground hover:bg-primary/95 py-2 px-4 rounded-lg font-medium transition-colors cursor-pointer text-sm flex items-center justify-center disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : null}
          {service ? 'Update Service' : 'Create Service'}
        </button>
      </div>
    </form>
  );
}
