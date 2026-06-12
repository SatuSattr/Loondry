import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Loader2, Ticket } from 'lucide-react';

interface ApplyVoucherFormProps {
  transaction: any;
  onSubmitSuccess: () => void;
  onCancel: () => void;
}

export function ApplyVoucherForm({ transaction, onSubmitSuccess, onCancel }: ApplyVoucherFormProps) {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loadingVouchers, setLoadingVouchers] = useState(false);
  
  const [customVoucherCode, setCustomVoucherCode] = useState('');
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState('');

  const customerUserId = transaction?.customer?.user_id;

  useEffect(() => {
    async function loadCustomerVouchers() {
      if (!customerUserId) return;
      setLoadingVouchers(true);
      try {
        const res = await api.getCustomerVouchers(customerUserId);
        // Filter for this specific customer and unused vouchers
        const customerActiveVouchers = (res.data || []).filter(
          (v: any) => v.user_id === customerUserId && !v.is_used
        );
        setVouchers(customerActiveVouchers);
      } catch (err) {
        console.error('Failed to load customer vouchers', err);
      } finally {
        setLoadingVouchers(false);
      }
    }
    loadCustomerVouchers();
  }, [customerUserId]);

  const handleApply = async (code: string) => {
    setApplying(true);
    setError('');
    try {
      await api.applyVoucher(transaction.id, code);
      onSubmitSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to apply voucher');
    } finally {
      setApplying(false);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customVoucherCode.trim()) return;
    handleApply(customVoucherCode.trim());
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-lg p-3 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Available Vouchers List */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Available Vouchers for {transaction?.customer?.user?.name}</label>
        
        {loadingVouchers ? (
          <div className="flex items-center text-sm text-muted-foreground p-4 bg-muted rounded-lg border border-border">
            <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading customer vouchers...
          </div>
        ) : vouchers.length > 0 ? (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {vouchers.map((v) => (
              <div
                key={v.id}
                onClick={() => !applying && handleApply(v.voucher_code)}
                className={`flex items-center justify-between border border-border rounded-lg p-3 hover:bg-primary/5 hover:border-primary cursor-pointer transition-all ${
                  applying ? 'opacity-50 pointer-events-none' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-primary/10 text-primary rounded-full p-2">
                    <Ticket className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm font-mono text-foreground">{v.voucher_code}</p>
                    <p className="text-xs text-muted-foreground">
                      Discount Value: <span className="font-semibold text-foreground">Rp {Number(v.discount_value).toLocaleString()}</span>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="text-xs bg-primary text-primary-foreground font-semibold px-2.5 py-1 rounded-md"
                >
                  Apply
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-6 bg-muted rounded-lg border border-border text-xs text-muted-foreground">
            No active vouchers found for this customer.
            <div className="mt-1">
              Customer needs to redeem their points ({transaction?.customer?.user?.points || 0} pts) to create a voucher first.
            </div>
          </div>
        )}
      </div>

      {/* Manual Input */}
      <form onSubmit={handleCustomSubmit} className="space-y-3 pt-4 border-t border-border">
        <label className="text-sm font-medium text-foreground">Or Enter Code Manually</label>
        <div className="flex space-x-2">
          <input
            type="text"
            required
            value={customVoucherCode}
            onChange={(e) => setCustomVoucherCode(e.target.value)}
            placeholder="e.g. VCHXXXXXX"
            className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-ring font-mono uppercase"
          />
          <button
            type="submit"
            disabled={applying || !customVoucherCode.trim()}
            className="bg-primary text-primary-foreground hover:bg-primary/95 px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center disabled:opacity-50 cursor-pointer"
          >
            {applying ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
          </button>
        </div>
      </form>

      <div className="flex pt-4 border-t border-border mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 py-2.5 px-4 rounded-lg font-medium transition-colors cursor-pointer text-sm text-center"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
