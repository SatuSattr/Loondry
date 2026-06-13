import { useEffect, useState } from 'react';
import { api, getAuthToken, API_BASE } from '../lib/api';
import { Search, Loader2, CreditCard, Ticket, Printer, RefreshCw, SlidersHorizontal, X, ChevronDown, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ErrorDialog from './shadcn-studio/blocks/dashboard-dialog-22/dialog-error';

interface POSViewProps {
  onOpenCreateOrder: () => void;
  onOpenApplyVoucher: (tx: any) => void;
  onOpenPaymentProof: (tx: any) => void;
}

export function POSView({ onOpenCreateOrder, onOpenApplyVoucher, onOpenPaymentProof }: POSViewProps) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeConditionImage, setActiveConditionImage] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  const statusLabels: Record<string, string> = {
    all: 'All Order Statuses',
    antrian: 'Queue (Antrian)',
    dicuci: 'Washing (Dicuci)',
    disetrika: 'Ironing (Disetrika)',
    'siap diambil': 'Ready (Siap Diambil)',
    diambil: 'Completed (Diambil)',
  };

  const paymentLabels: Record<string, string> = {
    all: 'All Payments',
    pending: 'Pending',
    paid: 'Paid',
  };

  // Action loading states
  const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);
  const [printingId, setPrintingId] = useState<number | null>(null);

  const loadTransactions = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getTransactions();
      setTransactions(res.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const [confirmingTxId, setConfirmingTxId] = useState<number | null>(null);

  const handleStatusChange = async (id: number, newStatus: string) => {
    if (newStatus === 'diambil') {
      setConfirmingTxId(id);
      return;
    }
    await executeStatusChange(id, newStatus);
  };

  const executeStatusChange = async (id: number, newStatus: string) => {
    setUpdatingStatusId(id);
    try {
      await api.updateTransactionStatus(id, newStatus);
      // Update local state
      setTransactions((prev) =>
        prev.map((tx) => (tx.id === id ? { ...tx, status: newStatus } : tx))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handlePrintReceipt = async (tx: any) => {
    setPrintingId(tx.id);
    const token = getAuthToken();
    try {
      const response = await fetch(`${API_BASE}/api/transactions/${tx.id}/receipt`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/pdf',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch receipt PDF');
      }

      const blob = await response.blob();
      const fileUrl = window.URL.createObjectURL(blob);
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = fileUrl;
      document.body.appendChild(iframe);
      
      iframe.onload = () => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        // clean up
        setTimeout(() => {
          document.body.removeChild(iframe);
          window.URL.revokeObjectURL(fileUrl);
        }, 1000);
      };
    } catch (err: any) {
      alert(err.message || 'Failed to print receipt. Opening alternative web view...');
      window.open(`${API_BASE}/api/transactions/${tx.id}/receipt?token=${token}`, '_blank');
    } finally {
      setPrintingId(null);
    }
  };

  // Filter logic
  const filteredTransactions = transactions.filter((tx) => {
    const invoiceMatch = tx.invoice_code?.toLowerCase().includes(searchQuery.toLowerCase());
    const customerNameMatch = tx.customer?.user?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const customerPhoneMatch = tx.customer?.phone?.includes(searchQuery);
    const matchesSearch = invoiceMatch || customerNameMatch || customerPhoneMatch;

    const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || tx.payment_status === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-sans">Transactions</h1>
          <p className="text-sm text-muted-foreground">Process laundry transactions, apply loyalty vouchers, and print receipts.</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={loadTransactions}
            className="p-2 border border-border bg-background hover:bg-accent rounded-lg text-foreground transition-all cursor-pointer"
            title="Refresh transactions list"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={onOpenCreateOrder}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium text-sm flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            Create Transaction
          </button>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-xs flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full sm:flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            data-shortcut="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by invoice code, customer name or phone... (Press '/' to focus)"
            className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-ring text-foreground"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-start sm:justify-end shrink-0">
          {/* Status Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" size="lg" className="gap-1.5 cursor-pointer text-xs font-semibold text-foreground">
                  <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Status: {statusFilter === 'all' ? 'All' : statusLabels[statusFilter]}</span>
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-48 bg-card border border-border text-foreground">
              {Object.entries(statusLabels).map(([key, val]) => (
                <DropdownMenuItem
                  key={key}
                  onClick={() => setStatusFilter(key)}
                  className="cursor-pointer hover:bg-accent hover:text-accent-foreground text-xs"
                >
                  {val}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Payment Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" size="lg" className="gap-1.5 cursor-pointer text-xs font-semibold text-foreground">
                  <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Payment: {paymentFilter === 'all' ? 'All' : paymentLabels[paymentFilter]}</span>
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-40 bg-card border border-border text-foreground">
              {Object.entries(paymentLabels).map(([key, val]) => (
                <DropdownMenuItem
                  key={key}
                  onClick={() => setPaymentFilter(key)}
                  className="cursor-pointer hover:bg-accent hover:text-accent-foreground text-xs"
                >
                  {val}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Clear Filters */}
          {(statusFilter !== 'all' || paymentFilter !== 'all') && (
            <Button
              variant="ghost"
              size="lg"
              onClick={() => {
                setStatusFilter('all');
                setPaymentFilter('all');
              }}
              className="px-2.5 text-muted-foreground hover:text-foreground hover:bg-accent/50 cursor-pointer text-xs"
              title="Clear all filters"
            >
              <X className="h-4 w-4 mr-1 text-muted-foreground" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <div className="flex items-center justify-center min-h-60">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      ) : error ? (
        <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-lg p-4 font-medium flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={loadTransactions}
            className="bg-destructive/20 hover:bg-destructive/35 px-3 py-1 rounded text-xs transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-muted-foreground text-xs uppercase tracking-wider">
                  <th className="p-4">Invoice</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Service Details</th>
                  <th className="p-4">Billing</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((tx) => {
                    const priceRate = Number(tx.service?.price || 0);
                    const weight = Number(tx.weight || 0);
                    const rawTotal = Number(tx.total_price || 0);
                    const discount = Number(tx.discount || 0);
                    const finalTotal = rawTotal - discount;

                    return (
                      <tr key={tx.id} className="hover:bg-accent/25 text-foreground transition-all">
                        {/* Invoice */}
                        <td className="p-4 font-mono font-medium">
                          {tx.invoice_code}
                          <span className="block text-xs text-muted-foreground mt-0.5">
                            {new Date(tx.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </td>

                        {/* Customer */}
                        <td className="p-4">
                          <p className="font-semibold text-sm">{tx.customer?.user?.name || 'Walk-in'}</p>
                          <p className="text-xs text-muted-foreground">{tx.customer?.phone}</p>
                        </td>

                        {/* Service details */}
                        <td className="p-4">
                          <p className="font-medium text-sm">{tx.service?.service_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {weight} {tx.service?.unit} @ Rp {priceRate.toLocaleString()}/{tx.service?.unit}
                          </p>
                          {tx.images && tx.images.length > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                const imgPath = tx.images[0].image_path;
                                setActiveConditionImage(`${API_BASE}/storage/${imgPath}`);
                              }}
                              className="mt-1.5 inline-flex items-center space-x-1 text-xs text-primary hover:text-primary/80 hover:underline cursor-pointer bg-primary/5 dark:bg-primary/10 px-2 py-0.5 rounded-md transition-colors border-none"
                            >
                              <Camera className="h-3.5 w-3.5 mr-1" />
                              <span>Lihat Kondisi Baju</span>
                            </button>
                          )}
                        </td>

                        {/* Billing */}
                        <td className="p-4">
                          <p className="font-semibold">Rp {finalTotal.toLocaleString()}</p>
                          {discount > 0 ? (
                            <span className="text-xs text-emerald-500 font-medium block">
                              Voucher: -Rp {discount.toLocaleString()}
                            </span>
                          ) : null}
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5 inline-block px-1.5 py-0.2 bg-muted border border-border rounded font-semibold">
                            {tx.payment_method}
                          </span>
                        </td>

                        {/* Order Status */}
                        <td className="p-4">
                          {tx.status === 'diambil' ? (
                            <span className="inline-flex items-center h-7 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-500 capitalize select-none cursor-default">
                              {tx.status}
                            </span>
                          ) : (
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                render={
                                  <Button
                                    disabled={updatingStatusId === tx.id}
                                    variant="outline"
                                    size="sm"
                                    className={`h-7 px-2 text-xs font-semibold border-none shadow-none focus-visible:ring-0 focus:ring-0 cursor-pointer bg-transparent capitalize select-none ${
                                      tx.status === 'siap diambil'
                                        ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
                                        : tx.status === 'antrian'
                                        ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20'
                                        : 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20'
                                    }`}
                                  >
                                    <span>{tx.status}</span>
                                    <ChevronDown className="h-3 w-3 ml-1 opacity-70" />
                                  </Button>
                                }
                              />
                              <DropdownMenuContent className="w-48 bg-card border border-border rounded-lg shadow-lg z-50 py-1" align="start">
                                {Object.entries(statusLabels)
                                  .filter(([key]) => key !== 'all')
                                  .filter(([key]) => !(key === 'diambil' && tx.payment_status === 'pending'))
                                  .map(([key, val]) => (
                                    <DropdownMenuItem
                                      key={key}
                                      onClick={() => handleStatusChange(tx.id, key)}
                                      className={`w-full text-left px-3 py-1.5 text-xs transition-colors hover:bg-accent/80 cursor-pointer ${
                                        tx.status === key ? 'bg-primary/10 text-primary font-semibold' : 'text-foreground'
                                      }`}
                                    >
                                      {val}
                                    </DropdownMenuItem>
                                  ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </td>

                        {/* Payment status */}
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
                            tx.payment_status === 'paid'
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : 'bg-destructive/10 text-destructive'
                          }`}>
                            {tx.payment_status}
                          </span>
                        </td>

                        {/* Action buttons */}
                        <td className="p-4">
                          <div className="flex items-center justify-center space-x-1.5">
                            {/* Pay (Upload Proof) */}
                            {tx.payment_status !== 'paid' ? (
                              <button
                                onClick={() => onOpenPaymentProof(tx)}
                                className="p-1.5 rounded-md border border-border bg-background hover:bg-accent text-foreground transition-all cursor-pointer"
                                title="Process Payment"
                              >
                                <CreditCard className="h-4 w-4" />
                              </button>
                            ) : null}

                            {/* Apply Voucher */}
                            {tx.payment_status !== 'paid' && !tx.voucher_code && tx.status !== 'diambil' ? (
                              <button
                                onClick={() => onOpenApplyVoucher(tx)}
                                className="p-1.5 rounded-md border border-border bg-background hover:bg-accent text-foreground transition-all cursor-pointer"
                                title="Apply Loyalty Voucher"
                              >
                                <Ticket className="h-4 w-4" />
                              </button>
                            ) : null}

                            {/* Print Receipt */}
                            <button
                              disabled={printingId === tx.id}
                              onClick={() => handlePrintReceipt(tx)}
                              className="p-1.5 rounded-md border border-border bg-background hover:bg-accent text-foreground transition-all cursor-pointer disabled:opacity-50"
                              title="Print Invoice / Receipt"
                            >
                              {printingId === tx.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Printer className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-sm text-muted-foreground">
                      No transactions found matching the filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Lightbox Modal for Clothes Condition Image */}
      {activeConditionImage && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
          onClick={() => setActiveConditionImage(null)}
        >
          <div className="relative max-w-3xl w-full max-h-[80vh] flex flex-col items-center">
            <button 
              onClick={() => setActiveConditionImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 bg-black/45 hover:bg-black/60 rounded-full p-1.5 cursor-pointer transition-colors border-none"
            >
              <X className="h-6 w-6" />
            </button>
            <img 
              src={activeConditionImage} 
              alt="Kondisi Baju" 
              className="max-w-full max-h-[75vh] object-contain rounded-lg border border-white/10 shadow-2xl bg-black"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {confirmingTxId !== null && (
        <ErrorDialog
          open={confirmingTxId !== null}
          onOpenChange={(open) => {
            if (!open) setConfirmingTxId(null);
          }}
          title="Selesaikan Transaksi?"
          description="Apakah Anda yakin ingin menyelesaikan transaksi ini? Setelah status diubah menjadi 'diambil' (Completed), status transaksi tidak dapat diubah lagi."
          confirmText="Ya, Selesaikan"
          cancelText="Batal"
          showCheckbox={false}
          onConfirm={() => {
            executeStatusChange(confirmingTxId, 'diambil');
            setConfirmingTxId(null);
          }}
        />
      )}
    </div>
  );
}
