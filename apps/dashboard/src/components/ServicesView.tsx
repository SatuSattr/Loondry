import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Loader2, Edit, Trash2, PlusCircle, RefreshCw, Layers, Search } from 'lucide-react';
import ErrorDialog from '@/components/shadcn-studio/blocks/dashboard-dialog-22/dialog-error';

interface ServicesViewProps {
  onOpenCreateService: () => void;
  onOpenEditService: (service: any) => void;
}

export function ServicesView({ onOpenCreateService, onOpenEditService }: ServicesViewProps) {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Display mode (cards vs table)
  const [displayMode, setDisplayMode] = useState<'cards' | 'table'>(() => {
    return (localStorage.getItem('service_display_mode') as 'cards' | 'table') || 'cards';
  });

  const handleViewModeChange = (mode: 'cards' | 'table') => {
    setDisplayMode(mode);
    localStorage.setItem('service_display_mode', mode);
  };

  // Handle debounce search
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

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

  // Filter services client-side based on search query
  const filteredServices = services.filter((s) =>
    s.service_name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    s.unit.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

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

      {/* Search & Layout Toggle Bar */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search services by name or unit..."
            className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-ring text-foreground"
          />
        </div>

        {/* Actions & View Toggle */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-start md:justify-end shrink-0">
          {/* View Toggle */}
          <div className="flex items-center space-x-1 bg-muted p-1 border border-border rounded-lg shrink-0 justify-center">
            <button
              onClick={() => handleViewModeChange('cards')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                displayMode === 'cards'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Card View"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-layout-grid"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
              <span>Cards</span>
            </button>
            <button
              onClick={() => handleViewModeChange('table')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                displayMode === 'table'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Table View"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-table-properties"><path d="M12 3v18"/><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/></svg>
              <span>Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
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
      ) : displayMode === 'cards' ? (
        /* Card Layout */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredServices.length > 0 ? (
            filteredServices.map((s) => (
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
              {services.length === 0 
                ? "No services found in catalog. Create a new service above."
                : "No laundry services match your search query."}
            </div>
          )}
        </div>
      ) : (
        /* Table Layout */
        <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-muted-foreground text-xs uppercase tracking-wider">
                  <th className="p-4">Service Name</th>
                  <th className="p-4">Unit</th>
                  <th className="p-4">Price / Rate</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredServices.length > 0 ? (
                  filteredServices.map((s) => (
                    <tr key={s.id} className="hover:bg-accent/25 text-foreground transition-all">
                      <td className="p-4 font-semibold text-sm">
                        {s.service_name}
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {s.unit}
                      </td>
                      <td className="p-4 font-medium text-foreground">
                        Rp {Number(s.price).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full ${
                          s.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : 'bg-destructive/10 text-destructive'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            onClick={() => onOpenEditService(s)}
                            className="p-1.5 rounded-md border border-border bg-background hover:bg-accent text-foreground transition-all cursor-pointer"
                            title="Edit service details"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <ErrorDialog
                            title="Delete Service"
                            description={`Are you sure you want to delete service "${s.service_name}"?`}
                            onConfirm={() => handleDelete(s)}
                            showCheckbox={false}
                            trigger={
                              <button
                                className="p-1.5 rounded-md border border-destructive/20 bg-destructive/10 hover:bg-destructive/20 text-destructive transition-all cursor-pointer"
                                title="Delete service"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            }
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-sm text-muted-foreground">
                      {services.length === 0 
                        ? "No services found in catalog. Create a new service above."
                        : "No laundry services match your search query."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
