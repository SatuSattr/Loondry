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

interface VoucherFormProps {
  voucher?: any; // If present, it's Edit mode
  onSubmitSuccess: () => void;
  onCancel: () => void;
}

export function VoucherForm({ voucher, onSubmitSuccess, onCancel }: VoucherFormProps) {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState('percentage'); // percentage or flat
  const [discountValue, setDiscountValue] = useState('');
  const [maxDiscount, setMaxDiscount] = useState('');
  const [minTransaction, setMinTransaction] = useState('');
  const [pointsCost, setPointsCost] = useState('');
  const [maxUsesPerUser, setMaxUsesPerUser] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('active');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (voucher) {
      setCode(voucher.code || '');
      setName(voucher.name || '');
      setDescription(voucher.description || '');
      setDiscountType(voucher.discount_type || 'percentage');
      setDiscountValue(voucher.discount_value ? String(voucher.discount_value) : '');
      setMaxDiscount(voucher.max_discount ? String(voucher.max_discount) : '');
      setMinTransaction(voucher.min_transaction ? String(voucher.min_transaction) : '');
      setPointsCost(voucher.points_cost ? String(voucher.points_cost) : '');
      setMaxUsesPerUser(voucher.max_uses_per_user ? String(voucher.max_uses_per_user) : '');
      setStartDate(voucher.start_date ? voucher.start_date.substring(0, 10) : '');
      setEndDate(voucher.end_date ? voucher.end_date.substring(0, 10) : '');
      setStatus(voucher.status || 'active');
      setError('');
    } else {
      setCode('');
      setName('');
      setDescription('');
      setDiscountType('percentage');
      setDiscountValue('');
      setMaxDiscount('');
      setMinTransaction('');
      setPointsCost('');
      setMaxUsesPerUser('');
      setStartDate('');
      setEndDate('');
      setStatus('active');
      setError('');
    }
  }, [voucher]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name || !discountValue || !pointsCost) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError('');

    const payload = {
      code: code.toUpperCase().trim(),
      name: name.trim(),
      description: description.trim() || null,
      discount_type: discountType,
      discount_value: Number(discountValue),
      max_discount: maxDiscount ? Number(maxDiscount) : null,
      min_transaction: minTransaction ? Number(minTransaction) : null,
      points_cost: Number(pointsCost),
      max_uses_per_user: maxUsesPerUser ? Number(maxUsesPerUser) : null,
      start_date: startDate || null,
      end_date: endDate || null,
      status: status,
    };

    try {
      if (voucher) {
        await api.updateVoucherTemplate(voucher.id, payload);
      } else {
        await api.createVoucherTemplate(payload);
      }
      onSubmitSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to save voucher template');
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

      {/* Voucher Code */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground">Voucher Code *</label>
        <input
          type="text"
          required
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="e.g. FLASHDEAL90"
          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-ring text-foreground uppercase"
        />
      </div>

      {/* Voucher Name */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground">Voucher Name *</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Diskon 90% s.d Rp 30k"
          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-ring text-foreground"
        />
      </div>

      {/* Description */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Voucher details..."
          rows={2}
          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-ring text-foreground resize-none"
        />
      </div>

      {/* Discount Configuration */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">Discount Type *</label>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full justify-between text-sm font-normal border-border bg-background hover:bg-accent text-foreground cursor-pointer"
                >
                  <span>{discountType === 'percentage' ? 'Percentage (%)' : 'Flat Amount (Rp)'}</span>
                  <ChevronDown className="h-4 w-4 opacity-50 ml-2" />
                </Button>
              }
            />
            <DropdownMenuContent className="w-[150px] bg-card border border-border rounded-lg shadow-lg z-50 py-1" align="start">
              <DropdownMenuItem
                onClick={() => setDiscountType('percentage')}
                className={`w-full text-left px-3 py-1.5 text-xs transition-colors hover:bg-accent/80 cursor-pointer ${
                  discountType === 'percentage' ? 'bg-primary/10 text-primary font-semibold' : 'text-foreground'
                }`}
              >
                Percentage (%)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDiscountType('flat')}
                className={`w-full text-left px-3 py-1.5 text-xs transition-colors hover:bg-accent/80 cursor-pointer ${
                  discountType === 'flat' ? 'bg-primary/10 text-primary font-semibold' : 'text-foreground'
                }`}
              >
                Flat Amount (Rp)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">
            {discountType === 'percentage' ? 'Discount Value (%) *' : 'Discount Value (Rp) *'}
          </label>
          <input
            type="number"
            required
            min="1"
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
            placeholder={discountType === 'percentage' ? 'e.g. 90' : 'e.g. 15000'}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-ring text-foreground"
          />
        </div>
      </div>

      {/* Max Discount & Min Transaction */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">Max Discount (Rp)</label>
          <input
            type="number"
            disabled={discountType === 'flat'}
            value={discountType === 'flat' ? '' : maxDiscount}
            onChange={(e) => setMaxDiscount(e.target.value)}
            placeholder={discountType === 'flat' ? 'Unlimited' : 'e.g. 30000'}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-ring text-foreground disabled:opacity-50"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">Min Transaction (Rp)</label>
          <input
            type="number"
            value={minTransaction}
            onChange={(e) => setMinTransaction(e.target.value)}
            placeholder="e.g. 300000"
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-ring text-foreground"
          />
        </div>
      </div>

      {/* Points Cost & Status */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">Points Cost *</label>
          <input
            type="number"
            required
            min="0"
            value={pointsCost}
            onChange={(e) => setPointsCost(e.target.value)}
            placeholder="e.g. 100"
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-ring text-foreground"
          />
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

      {/* Max Redemptions per Customer */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground">Max Redemptions per Customer</label>
        <input
          type="number"
          min="1"
          value={maxUsesPerUser}
          onChange={(e) => setMaxUsesPerUser(e.target.value)}
          placeholder="Unlimited (e.g. 5)"
          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-ring text-foreground"
        />
        <p className="text-xs text-muted-foreground mt-0.5">
          Limit how many times a single customer can redeem this voucher. Leave empty for unlimited.
        </p>
      </div>

      {/* Validity Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-ring text-foreground"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-ring text-foreground"
          />
        </div>
      </div>

      {/* Action Buttons */}
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
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          {voucher ? 'Update Voucher' : 'Create Voucher'}
        </button>
      </div>
    </form>
  );
}
