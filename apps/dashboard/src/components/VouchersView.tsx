import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import {
  Search,
  Loader2,
  Edit,
  Trash2,
  PlusCircle,
  RefreshCw,
  Percent,
  Calendar,
  Layers,
  Activity,
} from 'lucide-react';
import ErrorDialog from '@/components/shadcn-studio/blocks/dashboard-dialog-22/dialog-error';

interface VouchersViewProps {
  onOpenCreateVoucher: () => void;
  onOpenEditVoucher: (voucher: any) => void;
}

export function VouchersView({ onOpenCreateVoucher, onOpenEditVoucher }: VouchersViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'templates' | 'history'>('templates');
  const [templates, setTemplates] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Display mode (cards vs table) for templates
  const [displayMode, setDisplayMode] = useState<'cards' | 'table'>(() => {
    return (localStorage.getItem('voucher_display_mode') as 'cards' | 'table') || 'cards';
  });

  const handleViewModeChange = (mode: 'cards' | 'table') => {
    setDisplayMode(mode);
    localStorage.setItem('voucher_display_mode', mode);
  };

  const loadTemplates = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getVoucherTemplates();
      setTemplates(res.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load voucher templates');
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getAllRedeemedVouchers();
      setHistory(res.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load redeemed vouchers history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'templates') {
      loadTemplates();
    } else {
      loadHistory();
    }
  }, [activeSubTab]);

  const handleDeleteTemplate = async (voucher: any) => {
    try {
      await api.deleteVoucherTemplate(voucher.id);
      setTemplates((prev) => prev.filter((t) => t.id !== voucher.id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete template');
    }
  };

  // Filter lists based on search
  const filteredTemplates = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredHistory = history.filter(
    (h) =>
      h.voucher_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (h.user?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-sans">Loyalty & Vouchers</h1>
          <p className="text-sm text-muted-foreground">Define point-exchange discount vouchers and track redemptions.</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => (activeSubTab === 'templates' ? loadTemplates() : loadHistory())}
            className="p-2 border border-border bg-background hover:bg-accent rounded-lg text-foreground transition-all cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          {activeSubTab === 'templates' && (
            <button
              onClick={onOpenCreateVoucher}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium text-sm flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <PlusCircle className="h-4 w-4" />
              <span>New Voucher Template</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border flex space-x-6 text-sm shrink-0">
        <button
          onClick={() => {
            setActiveSubTab('templates');
            setSearchQuery('');
          }}
          className={`pb-2.5 font-semibold transition-all cursor-pointer ${
            activeSubTab === 'templates'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Voucher Templates (CRUD)
        </button>
        <button
          onClick={() => {
            setActiveSubTab('history');
            setSearchQuery('');
          }}
          className={`pb-2.5 font-semibold transition-all cursor-pointer ${
            activeSubTab === 'history'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Customer Redemptions Log
        </button>
      </div>

      {/* Search Bar & Optional View Toggle */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-xs flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 justify-between items-stretch md:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeSubTab === 'templates'
                ? 'Search templates by code or name...'
                : 'Search redemptions by customer name or code...'
            }
            className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-ring text-foreground"
          />
        </div>

        {activeSubTab === 'templates' && (
          <div className="flex items-center space-x-3 shrink-0">
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
        )}
      </div>

      {/* Tab Contents */}
      {loading ? (
        <div className="flex items-center justify-center min-h-60">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      ) : error ? (
        <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-lg p-4 font-medium flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => (activeSubTab === 'templates' ? loadTemplates() : loadHistory())}
            className="bg-destructive/20 hover:bg-destructive/35 px-3 py-1 rounded text-xs transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : activeSubTab === 'templates' ? (
        displayMode === 'cards' ? (
          /* Voucher Templates grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTemplates.length > 0 ? (
              filteredTemplates.map((v) => {
                const formattedMinTx = v.min_transaction ? `Min. Spend: Rp ${Number(v.min_transaction).toLocaleString()}` : 'No Min. Spend';
                const formattedMax = v.max_discount ? `Max. Cap: Rp ${Number(v.max_discount).toLocaleString()}` : 'Unlimited Cap';
                const discountValueStr = v.discount_type === 'percentage' 
                  ? `${Number(v.discount_value)}% Off` 
                  : `Rp ${Number(v.discount_value).toLocaleString()} Off`;
                
                const dateRangeStr = (v.start_date || v.end_date) 
                  ? `Valid: ${v.start_date ? v.start_date.substring(0, 10) : 'Anytime'} to ${v.end_date ? v.end_date.substring(0, 10) : 'Forever'}`
                  : 'No Expiry Dates';

                return (
                  <div
                    key={v.id}
                    className="bg-card border border-border rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-primary/40 hover:shadow-md transition-all space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-foreground text-base tracking-tight leading-tight">{v.name}</h3>
                          <span className="text-[10px] font-mono bg-primary/10 text-primary font-bold px-2 py-0.5 rounded mt-1.5 inline-block uppercase tracking-wider">{v.code}</span>
                        </div>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          v.status === 'active' 
                            ? 'bg-emerald-500/10 text-emerald-500' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {v.status}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs text-muted-foreground pt-1.5 border-t border-border/60">
                        <div className="flex items-center space-x-2">
                          <Percent className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-semibold text-foreground">{discountValueStr} ({formattedMax})</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{formattedMinTx}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="text-[11px]">{dateRangeStr}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-semibold text-emerald-500">Exchange Cost: {v.points_cost} pts</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2 pt-3 border-t border-border">
                      <button
                        onClick={() => onOpenEditVoucher(v)}
                        className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/85 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        <span>Edit Template</span>
                      </button>
                      <ErrorDialog
                        title="Delete Voucher Template"
                        description={`Are you sure you want to delete voucher template "${v.name}"? This won't affect already redeemed customer codes.`}
                        onConfirm={() => handleDeleteTemplate(v)}
                        showCheckbox={false}
                        trigger={
                          <button
                            className="bg-destructive/10 text-destructive hover:bg-destructive/20 p-2 rounded-lg transition-colors cursor-pointer"
                            title="Delete template"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        }
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full text-center py-12 text-sm text-muted-foreground bg-muted/40 rounded-xl border border-dashed border-border">
                {templates.length === 0 
                  ? "No voucher templates found. Create a new template to start offering point exchanges."
                  : "No voucher templates match your search query."}
              </div>
            )}
          </div>
        ) : (
          /* Voucher Templates Table Layout */
          <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-muted-foreground text-xs uppercase tracking-wider">
                    <th className="p-4">Voucher Name</th>
                    <th className="p-4">Code</th>
                    <th className="p-4">Discount</th>
                    <th className="p-4">Min. Spend / Cap</th>
                    <th className="p-4">Points Cost</th>
                    <th className="p-4">Validity</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredTemplates.length > 0 ? (
                    filteredTemplates.map((v) => {
                      const formattedMinTx = v.min_transaction ? `Min: Rp ${Number(v.min_transaction).toLocaleString()}` : 'No Min';
                      const formattedMax = v.max_discount ? `Cap: Rp ${Number(v.max_discount).toLocaleString()}` : 'No Cap';
                      const discountValueStr = v.discount_type === 'percentage' 
                        ? `${Number(v.discount_value)}% Off` 
                        : `Rp ${Number(v.discount_value).toLocaleString()} Off`;
                      
                      const dateRangeStr = (v.start_date || v.end_date) 
                        ? `${v.start_date ? v.start_date.substring(0, 10) : 'Anytime'} - ${v.end_date ? v.end_date.substring(0, 10) : 'Forever'}`
                        : 'Lifetime';

                      return (
                        <tr key={v.id} className="hover:bg-accent/25 text-foreground transition-all">
                          <td className="p-4 font-semibold text-sm">
                            {v.name}
                          </td>
                          <td className="p-4">
                            <span className="text-[10px] font-mono bg-primary/10 text-primary font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                              {v.code}
                            </span>
                          </td>
                          <td className="p-4 font-medium text-foreground">
                            {discountValueStr}
                          </td>
                          <td className="p-4 text-xs text-muted-foreground">
                            <p>{formattedMinTx}</p>
                            <p>{formattedMax}</p>
                          </td>
                          <td className="p-4 font-semibold text-emerald-500 text-xs">
                            {v.points_cost} pts
                          </td>
                          <td className="p-4 text-xs text-muted-foreground">
                            {dateRangeStr}
                          </td>
                          <td className="p-4">
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                              v.status === 'active' 
                                ? 'bg-emerald-500/10 text-emerald-500' 
                                : 'bg-muted text-muted-foreground'
                            }`}>
                              {v.status}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-center space-x-1.5">
                              <button
                                onClick={() => onOpenEditVoucher(v)}
                                className="p-1.5 rounded-md border border-border bg-background hover:bg-accent text-foreground transition-all cursor-pointer"
                                title="Edit voucher template"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                              <ErrorDialog
                                title="Delete Voucher Template"
                                description={`Are you sure you want to delete voucher template "${v.name}"? This won't affect already redeemed customer codes.`}
                                onConfirm={() => handleDeleteTemplate(v)}
                                showCheckbox={false}
                                trigger={
                                  <button
                                    className="p-1.5 rounded-md border border-destructive/20 bg-destructive/10 hover:bg-destructive/20 text-destructive transition-all cursor-pointer"
                                    title="Delete template"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                }
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-sm text-muted-foreground">
                        {templates.length === 0 
                          ? "No voucher templates found. Create a new template to start offering point exchanges."
                          : "No voucher templates match your search query."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        /* Redemptions Log List */
        <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-muted-foreground text-xs uppercase tracking-wider">
                  <th className="p-4">Redeemed Code</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Voucher Type</th>
                  <th className="p-4">Points Spent</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Redemption Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredHistory.length > 0 ? (
                  filteredHistory.map((h) => (
                    <tr key={h.id} className="hover:bg-accent/25 text-foreground transition-all">
                      <td className="p-4 font-mono font-bold text-primary tracking-wide">
                        {h.voucher_code}
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-sm">{h.user?.name || 'Customer'}</p>
                        <p className="text-xs text-muted-foreground">{h.user?.email}</p>
                      </td>
                      <td className="p-4">
                        {h.voucher ? (
                          <div className="text-xs">
                            <span className="font-semibold text-foreground block">{h.voucher.name}</span>
                            <span className="text-muted-foreground">
                              {h.voucher.discount_type === 'percentage' 
                                ? `${Number(h.voucher.discount_value)}% Discount` 
                                : `Rp ${Number(h.voucher.discount_value).toLocaleString()} Flat Discount`}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Legacy flat Rp {Number(h.discount_value).toLocaleString()} discount</span>
                        )}
                      </td>
                      <td className="p-4 font-semibold text-foreground">
                        {h.points_spent} pts
                      </td>
                      <td className="p-4">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          h.is_used 
                            ? 'bg-muted text-muted-foreground' 
                            : 'bg-emerald-500/10 text-emerald-500'
                        }`}>
                          {h.is_used ? 'Used' : 'Active'}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-muted-foreground">
                        {h.created_at ? h.created_at.replace('T', ' ').substring(0, 16) : '-'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-sm text-muted-foreground">
                      {history.length === 0 
                        ? "No redemption history logs found."
                        : "No redemptions match your search query."}
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
