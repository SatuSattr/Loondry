import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Loader2, Ticket, Award, Copy, Check } from 'lucide-react';

interface RedeemVoucherFormProps {
  customer: any;
  onSubmitSuccess: () => void;
  onCancel: () => void;
}

export function RedeemVoucherForm({ customer, onSubmitSuccess, onCancel }: RedeemVoucherFormProps) {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [redeemingId, setRedeemingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [redeemedCode, setRedeemedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const customerPoints = customer?.user?.points || 0;

  useEffect(() => {
    async function loadTemplates() {
      setLoadingTemplates(true);
      setError('');
      try {
        const res = await api.getVoucherTemplates();
        // Filter only active templates
        const activeTemplates = (res.data || []).filter((v: any) => v.status === 'active');
        setVouchers(activeTemplates);
      } catch (err: any) {
        setError(err.message || 'Failed to load voucher catalog');
      } finally {
        setLoadingTemplates(false);
      }
    }
    loadTemplates();
  }, []);

  const handleRedeem = async (voucherId: number, pointsCost: number) => {
    if (customerPoints < pointsCost) {
      setError('Customer has insufficient points to redeem this voucher.');
      return;
    }

    setRedeemingId(voucherId);
    setError('');
    try {
      const res = await api.redeemVoucher(voucherId, customer.id);
      if (res.data && res.data.voucher_code) {
        setRedeemedCode(res.data.voucher_code);
      } else {
        onSubmitSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Redemption failed');
      setRedeemingId(null);
    }
  };

  const handleCopy = () => {
    if (redeemedCode) {
      navigator.clipboard.writeText(redeemedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (redeemedCode) {
    return (
      <div className="space-y-6 text-center py-8">
        <div className="mx-auto bg-emerald-500/10 text-emerald-500 rounded-full p-4 w-16 h-16 flex items-center justify-center">
          <Ticket className="h-8 w-8" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-foreground">Voucher Redeemed!</h3>
          <p className="text-sm text-muted-foreground">
            Successfully redeemed for customer <span className="font-semibold text-foreground">{customer.user?.name}</span>.
          </p>
        </div>

        <div className="bg-muted p-4 rounded-xl border border-border space-y-2 max-w-sm mx-auto">
          <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider block">Redemption Code</span>
          <div className="flex items-center justify-center space-x-2">
            <span className="text-xl font-mono font-bold text-primary tracking-wider">{redeemedCode}</span>
            <button
              onClick={handleCopy}
              className="p-1.5 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground transition-all cursor-pointer"
              title="Copy code"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button
          onClick={onSubmitSuccess}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/95 py-2.5 rounded-lg font-semibold transition-colors cursor-pointer text-sm"
        >
          Done & Close
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {error && (
        <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-lg p-3 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Customer summary */}
      <div className="bg-accent/40 border border-border p-4 rounded-xl flex items-center justify-between">
        <div>
          <span className="text-xs text-muted-foreground block">Redeeming for</span>
          <span className="font-bold text-sm text-foreground">{customer.user?.name}</span>
        </div>
        <div className="flex items-center space-x-1.5 bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-lg text-xs font-bold border border-emerald-500/10">
          <Award className="h-4 w-4" />
          <span>{customerPoints} Points Available</span>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-semibold text-sm text-foreground tracking-tight">Available Vouchers</h4>
        
        {loadingTemplates ? (
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading voucher catalog...
          </div>
        ) : vouchers.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {vouchers.map((v) => {
              const hasEnoughPoints = customerPoints >= v.points_cost;
              const formattedMinTx = v.min_transaction ? `Min. spend Rp ${Number(v.min_transaction).toLocaleString()}` : 'No min. spend';
              const formattedMax = v.max_discount ? `Max. cap Rp ${Number(v.max_discount).toLocaleString()}` : 'Unlimited cap';
              const discountStr = v.discount_type === 'percentage' 
                ? `${Number(v.discount_value)}% Discount (${formattedMax})` 
                : `Rp ${Number(v.discount_value).toLocaleString()} Flat Discount`;

              return (
                <div 
                  key={v.id} 
                  className={`border rounded-xl p-4 flex flex-col justify-between transition-all space-y-3 ${
                    hasEnoughPoints 
                      ? 'border-border bg-card hover:border-primary/40' 
                      : 'border-border/50 bg-card/40 opacity-75'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1 text-left">
                      <span className="font-bold text-foreground text-sm block tracking-tight leading-tight">{v.name}</span>
                      <span className="text-xs text-primary font-bold block">{discountStr}</span>
                      <span className="text-[10px] text-muted-foreground block">{formattedMinTx}</span>
                      {v.description && (
                        <p className="text-[11px] text-muted-foreground/80 mt-1 line-clamp-2">{v.description}</p>
                      )}
                    </div>
                    <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full shrink-0">
                      {v.points_cost} pts
                    </span>
                  </div>

                  <button
                    disabled={!hasEnoughPoints || redeemingId !== null}
                    onClick={() => handleRedeem(v.id, v.points_cost)}
                    className={`w-full py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                      hasEnoughPoints
                        ? 'bg-primary text-primary-foreground hover:bg-primary/95'
                        : 'bg-muted text-muted-foreground cursor-not-allowed'
                    }`}
                  >
                    {redeemingId === v.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                    ) : (
                      <Ticket className="h-3.5 w-3.5" />
                    )}
                    <span>{hasEnoughPoints ? 'Redeem Voucher' : 'Insufficient Points'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-muted-foreground bg-muted/40 rounded-xl border border-dashed border-border">
            No active vouchers templates found in the database.
          </div>
        )}
      </div>

      <div className="flex space-x-3 pt-4 border-t border-border mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 py-2 px-4 rounded-lg font-medium transition-colors cursor-pointer text-sm text-center"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
