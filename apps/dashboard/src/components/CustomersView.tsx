import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Search, Loader2, Edit, Trash2, PlusCircle, RefreshCw, Phone, MapPin, Award, Ticket, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ErrorDialog from '@/components/shadcn-studio/blocks/dashboard-dialog-22/dialog-error';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CustomersViewProps {
  onOpenCreateCustomer: () => void;
  onOpenEditCustomer: (customer: any) => void;
  onOpenRedeemVoucher: (customer: any) => void;
}

export function CustomersView({ onOpenCreateCustomer, onOpenEditCustomer, onOpenRedeemVoucher }: CustomersViewProps) {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search query
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Display mode (cards vs table)
  const [displayMode, setDisplayMode] = useState<'cards' | 'table'>(() => {
    return (localStorage.getItem('customer_display_mode') as 'cards' | 'table') || 'cards';
  });

  const handleViewModeChange = (mode: 'cards' | 'table') => {
    setDisplayMode(mode);
    localStorage.setItem('customer_display_mode', mode);
  };

  // Filters state
  const [genderFilter, setGenderFilter] = useState<'all' | 'L' | 'P'>('all');
  const [pointsFilter, setPointsFilter] = useState<'all' | '0-100' | '101-500' | '501-1000' | '1000+'>('all');

  // Filter customers client-side
  const filteredCustomers = customers.filter((c) => {
    // Gender Filter
    if (genderFilter !== 'all') {
      if (c.user?.gender !== genderFilter) {
        return false;
      }
    }

    // Points Filter
    if (pointsFilter !== 'all') {
      const pts = c.user?.points || 0;
      if (pointsFilter === '0-100' && (pts < 0 || pts > 100)) return false;
      if (pointsFilter === '101-500' && (pts < 101 || pts > 500)) return false;
      if (pointsFilter === '501-1000' && (pts < 501 || pts > 1000)) return false;
      if (pointsFilter === '1000+' && pts <= 1000) return false;
    }

    return true;
  });

  // Handle debounce search
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const loadCustomers = async (searchVal?: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getCustomers(searchVal);
      setCustomers(res.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers(debouncedSearch);
  }, [debouncedSearch]);

  const handleDelete = async (customer: any) => {
    try {
      await api.deleteCustomer(customer.id);
      setCustomers((prev) => prev.filter((c) => c.id !== customer.id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete customer');
    }
  };

  // Selection states for bulk actions
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Clear selection on filter or display mode changes
  useEffect(() => {
    setSelectedIds([]);
  }, [displayMode, searchQuery, genderFilter, pointsFilter]);

  const handleBulkDelete = async () => {
    setBulkDeleting(true);
    setError('');
    try {
      await Promise.all(selectedIds.map((id) => api.deleteCustomer(id)));
      setCustomers((prev) => prev.filter((c) => !selectedIds.includes(c.id)));
      setSelectedIds([]);
    } catch (err: any) {
      setError(err.message || 'Failed to delete selected customers');
    } finally {
      setBulkDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-sans">Customer Database</h1>
          <p className="text-sm text-muted-foreground">Manage registered customers, view their loyalty points, and update credentials.</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => loadCustomers(debouncedSearch)}
            className="p-2 border border-border bg-background hover:bg-accent rounded-lg text-foreground transition-all cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={onOpenCreateCustomer}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium text-sm flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* Search & Layout Toggle Bar */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-xs flex flex-col lg:flex-row gap-4 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full lg:flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            data-shortcut="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type to search customers by name, phone or email... (Press '/' to focus)"
            className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-ring text-foreground"
          />
        </div>

        {/* Filters and Toggle Group */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-start lg:justify-end">
          {/* Gender Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" size="lg" className="gap-1.5 cursor-pointer text-xs font-semibold text-foreground">
                  <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Gender: {genderFilter === 'all' ? 'All' : genderFilter === 'L' ? 'Male' : 'Female'}</span>
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-40 bg-card border border-border text-foreground">
              <DropdownMenuItem onClick={() => setGenderFilter('all')} className="cursor-pointer hover:bg-accent hover:text-accent-foreground text-xs">All Genders</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setGenderFilter('L')} className="cursor-pointer hover:bg-accent hover:text-accent-foreground text-xs">Male</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setGenderFilter('P')} className="cursor-pointer hover:bg-accent hover:text-accent-foreground text-xs">Female</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Points Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" size="lg" className="gap-1.5 cursor-pointer text-xs font-semibold text-foreground">
                  <Award className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Points: {
                    pointsFilter === 'all' ? 'All' :
                    pointsFilter === '0-100' ? '0 - 100' :
                    pointsFilter === '101-500' ? '101 - 500' :
                    pointsFilter === '501-1000' ? '501 - 1000' : '1000+'
                  }</span>
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-48 bg-card border border-border text-foreground">
              <DropdownMenuItem onClick={() => setPointsFilter('all')} className="cursor-pointer hover:bg-accent hover:text-accent-foreground text-xs">All Points</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPointsFilter('0-100')} className="cursor-pointer hover:bg-accent hover:text-accent-foreground text-xs">0 - 100 pts</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPointsFilter('101-500')} className="cursor-pointer hover:bg-accent hover:text-accent-foreground text-xs">101 - 500 pts</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPointsFilter('501-1000')} className="cursor-pointer hover:bg-accent hover:text-accent-foreground text-xs">501 - 1000 pts</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPointsFilter('1000+')} className="cursor-pointer hover:bg-accent hover:text-accent-foreground text-xs">1000+ pts</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Clear Filters */}
          {(genderFilter !== 'all' || pointsFilter !== 'all') && (
            <Button
              variant="ghost"
              size="lg"
              onClick={() => {
                setGenderFilter('all');
                setPointsFilter('all');
              }}
              className="px-2.5 text-muted-foreground hover:text-foreground hover:bg-accent/50 cursor-pointer text-xs"
              title="Clear all filters"
            >
              <X className="h-4 w-4 mr-1 text-muted-foreground" />
              Clear
            </Button>
          )}

          <div className="h-6 w-px bg-border hidden sm:block mx-1" />

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

      {/* Main Customers List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-60">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      ) : error ? (
        <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-lg p-4 font-medium flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => loadCustomers(debouncedSearch)}
            className="bg-destructive/20 hover:bg-destructive/35 px-3 py-1 rounded text-xs transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : displayMode === 'cards' ? (
        /* Card Layout */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCustomers.length > 0 ? (
            filteredCustomers.map((c) => (
              <div
                key={c.id}
                className="bg-card border border-border rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-primary/40 hover:shadow-md transition-all space-y-4"
              >
                {/* Upper Section */}
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-foreground text-base tracking-tight leading-tight">{c.user?.name}</h3>
                      <span className="text-xs text-muted-foreground block mt-0.5">{c.user?.email}</span>
                    </div>
                    <span className="text-xs bg-emerald-500/10 text-emerald-500 font-semibold px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                      <Award className="h-3.5 w-3.5" />
                      <span>{c.user?.points || 0} pts</span>
                    </span>
                  </div>

                  {/* Info details */}
                  <div className="space-y-1.5 text-xs text-muted-foreground pt-1 border-t border-border/60">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span>{c.phone}</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{c.address}</span>
                    </div>
                    {c.user?.gender ? (
                      <div className="flex items-center space-x-2 pl-5.5">
                        <span className="text-muted-foreground font-medium">Gender:</span>
                        <span className="text-foreground font-semibold uppercase">{c.user?.gender === 'L' ? 'Male' : 'Female'}</span>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Lower Action Section */}
                <div className="flex space-x-2 pt-3 border-t border-border">
                  <button
                    onClick={() => onOpenEditCustomer(c)}
                    className="bg-secondary text-secondary-foreground hover:bg-secondary/85 py-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 transition-colors cursor-pointer flex-1"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => onOpenRedeemVoucher(c)}
                    className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 py-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 transition-all cursor-pointer flex-1.5"
                  >
                    <Ticket className="h-3.5 w-3.5" />
                    <span>Redeem Vouch</span>
                  </button>
                  <ErrorDialog
                    title="Delete Customer"
                    description={`Are you sure you want to delete customer "${c.user?.name}"? All their points will be deleted too.`}
                    onConfirm={() => handleDelete(c)}
                    showCheckbox={false}
                    trigger={
                      <button
                        className="bg-destructive/10 text-destructive hover:bg-destructive/20 p-2 rounded-lg transition-colors cursor-pointer"
                        title="Delete customer"
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
              {customers.length === 0 
                ? "No customers found. Try typing a different search query or create a new customer."
                : "No customers match the selected filters."}
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
                  <th className="p-4 w-12 text-center">
                    <input
                      type="checkbox"
                      checked={filteredCustomers.length > 0 && selectedIds.length === filteredCustomers.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds(filteredCustomers.map((c) => c.id));
                        } else {
                          setSelectedIds([]);
                        }
                      }}
                      className="rounded border-border text-primary cursor-pointer h-4 w-4 focus:ring-ring bg-background"
                    />
                  </th>
                  <th className="p-4">Customer Name</th>
                  <th className="p-4">Contact Info</th>
                  <th className="p-4">Address</th>
                  <th className="p-4">Gender</th>
                  <th className="p-4">Points</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((c) => (
                    <tr
                      key={c.id}
                      className={`hover:bg-accent/25 text-foreground transition-all ${
                        selectedIds.includes(c.id) ? 'bg-primary/5 hover:bg-primary/10' : ''
                      }`}
                    >
                      <td className="p-4 w-12 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(c.id)}
                          onChange={() => {
                            setSelectedIds((prev) =>
                              prev.includes(c.id)
                                ? prev.filter((id) => id !== c.id)
                                : [...prev, c.id]
                            );
                          }}
                          className="rounded border-border text-primary cursor-pointer h-4 w-4 focus:ring-ring bg-background"
                        />
                      </td>
                      <td className="p-4 font-semibold text-sm">
                        {c.user?.name}
                      </td>
                      <td className="p-4 text-xs">
                        <p className="font-medium text-foreground">{c.phone}</p>
                        <p className="text-muted-foreground mt-0.5">{c.user?.email}</p>
                      </td>
                      <td className="p-4 text-xs max-w-xs truncate text-muted-foreground" title={c.address}>
                        {c.address}
                      </td>
                      <td className="p-4 text-xs capitalize text-muted-foreground">
                        {c.user?.gender ? (c.user?.gender === 'L' ? 'Male' : 'Female') : '-'}
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center space-x-1 bg-emerald-500/10 text-emerald-500 font-semibold px-2 py-0.5 rounded-full text-xs">
                          <Award className="h-3 w-3" />
                          <span>{c.user?.points || 0} pts</span>
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            onClick={() => onOpenEditCustomer(c)}
                            className="p-1.5 rounded-md border border-border bg-background hover:bg-accent text-foreground transition-all cursor-pointer"
                            title="Edit customer details"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => onOpenRedeemVoucher(c)}
                            className="p-1.5 rounded-md border border-border bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 transition-all cursor-pointer"
                            title="Redeem points for voucher"
                          >
                            <Ticket className="h-3.5 w-3.5" />
                          </button>
                           <ErrorDialog
                            title="Delete Customer"
                            description={`Are you sure you want to delete customer "${c.user?.name}"? All their points will be deleted too.`}
                            onConfirm={() => handleDelete(c)}
                            showCheckbox={false}
                            trigger={
                              <button
                                className="p-1.5 rounded-md border border-destructive/20 bg-destructive/10 hover:bg-destructive/20 text-destructive transition-all cursor-pointer"
                                title="Delete customer"
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
                    <td colSpan={7} className="p-8 text-center text-sm text-muted-foreground">
                      {customers.length === 0 
                        ? "No customers found. Try typing a different search query or create a new customer."
                        : "No customers match the selected filters."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Floating Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-card/90 backdrop-blur-md border border-border px-6 py-3.5 rounded-2xl shadow-xl z-50 flex items-center space-x-6 animate-in slide-in-from-bottom-4 duration-300">
          <span className="text-xs font-semibold text-foreground">
            {selectedIds.length} customer{selectedIds.length > 1 ? 's' : ''} selected
          </span>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center space-x-2">
            <ErrorDialog
              title="Delete Selected Customers"
              description={`Are you sure you want to delete ${selectedIds.length} selected customer(s)? All their loyalty points will be permanently deleted too.`}
              onConfirm={handleBulkDelete}
              showCheckbox={false}
              trigger={
                <button
                  disabled={bulkDeleting}
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {bulkDeleting ? (
                    <Loader2 className="animate-spin h-3.5 w-3.5" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                  <span>{bulkDeleting ? 'Deleting...' : 'Delete Selected'}</span>
                </button>
              }
            />
            <button
              onClick={() => setSelectedIds([])}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/85 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
