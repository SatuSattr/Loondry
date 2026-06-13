import React, { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api';
import { Search, Loader2, User, PlusCircle, ChevronDown, Ticket, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TransactionFormProps {
  onSubmitSuccess: () => void;
  onCancel: () => void;
  onOpenCreateCustomer: () => void;
}

export function TransactionForm({ onSubmitSuccess, onCancel, onOpenCreateCustomer }: TransactionFormProps) {
  // Customer search
  const [customerSearch, setCustomerSearch] = useState('');
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [searchingCustomers, setSearchingCustomers] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Services
  const [services, setServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [loadingServices, setLoadingServices] = useState(false);

  // Form inputs
  const [weight, setWeight] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState<string | null>(null);

  const [paymentTiming, setPaymentTimingState] = useState<'upfront' | 'pickup'>(() => {
    const saved = localStorage.getItem('lnd_payment_timing_pref');
    return (saved === 'upfront' || saved === 'pickup') ? saved : 'upfront';
  });

  const setPaymentTiming = (val: 'upfront' | 'pickup') => {
    setPaymentTimingState(val);
    localStorage.setItem('lnd_payment_timing_pref', val);
  };

  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; discount: number; name: string } | null>(null);
  const [checkingVoucher, setCheckingVoucher] = useState(false);
  const [voucherError, setVoucherError] = useState('');
  const [voucherSuccessMsg, setVoucherSuccessMsg] = useState('');
  
  // Submit state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch initial services
  useEffect(() => {
    async function loadServices() {
      setLoadingServices(true);
      try {
        const res = await api.getServices();
        const activeServices = (res.data || []).filter((s: any) => s.status === 'active');
        setServices(activeServices);
        if (activeServices.length > 0) {
          setSelectedService(activeServices[0]);
        }
      } catch (err) {
        console.error('Failed to load services', err);
      } finally {
        setLoadingServices(false);
      }
    }
    loadServices();
  }, []);

  // Clear voucher application if customer, service, or weight changes
  useEffect(() => {
    setAppliedVoucher(null);
    setVoucherSuccessMsg('');
    setVoucherError('');
  }, [selectedCustomer, selectedService, weight]);

  // Handle customer search query
  useEffect(() => {
    if (!customerSearch.trim()) {
      setCustomers([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setSearchingCustomers(true);
      try {
        const res = await api.getCustomers(customerSearch);
        setCustomers(res.data || []);
      } catch (err) {
        console.error('Failed to search customers', err);
      } finally {
        setSearchingCustomers(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [customerSearch]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate pricing & points
  const price = selectedService ? Number(selectedService.price) : 0;
  const unit = selectedService ? selectedService.unit : 'Kg';
  const numericWeight = Number(weight) || 0;
  const subtotal = price * numericWeight;

  // Calculate discount from appliedVoucher
  const discount = appliedVoucher ? appliedVoucher.discount : 0;
  const finalTotal = Math.max(0, subtotal - discount);

  // Points configuration: 1 point per 1000 IDR of paid amount
  const pointsEarned = Math.floor(finalTotal / 1000);

  const handleApplyVoucher = async () => {
    if (!selectedCustomer) {
      setVoucherError('Please select a customer first.');
      return;
    }
    if (!voucherCode.trim()) {
      setVoucherError('Please enter a voucher code.');
      return;
    }
    setCheckingVoucher(true);
    setVoucherError('');
    setVoucherSuccessMsg('');
    setAppliedVoucher(null);
    try {
      const res = await api.checkVoucherCode(voucherCode.trim(), subtotal, selectedCustomer.id);
      if (res.valid) {
        setAppliedVoucher({
          code: voucherCode.trim(),
          discount: Number(res.discount),
          name: res.name
        });
        setVoucherSuccessMsg(`Voucher applied successfully! Discount: Rp ${Number(res.discount).toLocaleString()}`);
      } else {
        setVoucherError(res.message || 'Invalid voucher.');
      }
    } catch (err: any) {
      setVoucherError(err.message || 'Invalid or expired voucher.');
    } finally {
      setCheckingVoucher(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) {
      setError('Please select a customer');
      return;
    }
    if (!selectedService) {
      setError('Please select a service');
      return;
    }
    if (numericWeight <= 0) {
      setError('Weight/Quantity must be greater than 0');
      return;
    }
    if (paymentTiming === 'upfront' && ['transfer', 'qris'].includes(paymentMethod) && !paymentProofFile) {
      setError('Please upload the payment proof for transfer/qris payments');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('customer_id', String(selectedCustomer.id));
    formData.append('service_id', String(selectedService.id));
    formData.append('weight', String(numericWeight));
    formData.append('payment_status', paymentTiming === 'upfront' ? 'paid' : 'pending');
    if (paymentTiming === 'upfront') {
      formData.append('payment_method', paymentMethod);
      if (['transfer', 'qris'].includes(paymentMethod) && paymentProofFile) {
        formData.append('payment_proof', paymentProofFile);
      }
      if (appliedVoucher) {
        formData.append('voucher_code', appliedVoucher.code);
      }
    }

    try {
      await api.createTransaction(formData);
      onSubmitSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to create transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-lg p-3 text-sm font-medium">
          {error}
        </div>
      )}

      {/* 1. Customer Selection */}
      <div className="space-y-1 relative" ref={dropdownRef}>
        <label className="text-sm font-medium text-foreground">Select Customer *</label>
        
        {selectedCustomer ? (
          <div className="flex items-center justify-between bg-accent text-accent-foreground rounded-lg p-3 border border-border">
            <div className="flex items-center space-x-3">
              <div className="bg-primary/10 text-primary rounded-full p-1.5">
                <User className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold text-sm">{selectedCustomer.user?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {selectedCustomer.phone} • Points: <span className="font-semibold text-emerald-500">{selectedCustomer.user?.points || 0}</span>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedCustomer(null);
                setCustomerSearch('');
              }}
              className="text-xs font-medium text-destructive hover:underline cursor-pointer"
            >
              Change
            </button>
          </div>
        ) : (
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={customerSearch}
              onChange={(e) => {
                setCustomerSearch(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              placeholder="Search by name, email or phone..."
              className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-ring"
            />
            
            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-card border border-border rounded-lg shadow-lg z-50 divide-y divide-border">
                {searchingCustomers ? (
                  <div className="p-3 text-center text-xs text-muted-foreground flex items-center justify-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> Searching...
                  </div>
                ) : customers.length > 0 ? (
                  customers.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setSelectedCustomer(c);
                        setShowDropdown(false);
                      }}
                      className="w-full text-left p-3 hover:bg-accent hover:text-accent-foreground cursor-pointer flex justify-between items-center text-sm transition-colors focus:bg-accent focus:text-accent-foreground outline-hidden border-none"
                    >
                      <div className="text-left">
                        <p className="font-medium text-foreground">{c.user?.name}</p>
                        <p className="text-xs text-muted-foreground">{c.phone} • {c.user?.email}</p>
                      </div>
                      <span className="text-xs bg-emerald-500/10 text-emerald-500 font-semibold px-2 py-0.5 rounded-full shrink-0">
                        {c.user?.points || 0} pts
                      </span>
                    </button>
                  ))
                ) : customerSearch.trim() ? (
                  <div className="p-3 text-center text-xs text-muted-foreground">
                    No customers found.
                  </div>
                ) : (
                  <div className="p-3 text-center text-xs text-muted-foreground">
                    Type to search customers...
                  </div>
                )}
                
                <button
                  type="button"
                  onClick={() => {
                    setShowDropdown(false);
                    onOpenCreateCustomer();
                  }}
                  className="w-full p-3 text-center text-sm text-primary hover:bg-accent cursor-pointer font-medium flex items-center justify-center space-x-1.5 focus:bg-accent outline-hidden border-none"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Register New Customer</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Service Selection */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground">Service *</label>
        {loadingServices ? (
          <div className="flex items-center text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading services...
          </div>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full justify-between text-sm font-normal border-border bg-background hover:bg-accent text-foreground cursor-pointer"
                >
                  <span>
                    {selectedService
                      ? `${selectedService.service_name} (Rp ${selectedService.price.toLocaleString()}/${selectedService.unit})`
                      : 'Select a service...'}
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-50 ml-2" />
                </Button>
              }
            />
            <DropdownMenuContent className="w-80 max-h-60 overflow-y-auto bg-card border border-border rounded-lg shadow-lg z-50 py-1" align="start">
              {services.map((s) => (
                <DropdownMenuItem
                  key={s.id}
                  onClick={() => setSelectedService(s)}
                  className={`w-full text-left px-3 py-1.5 text-xs transition-colors hover:bg-accent/80 cursor-pointer ${
                    selectedService?.id === s.id ? 'bg-primary/10 text-primary font-semibold' : 'text-foreground'
                  }`}
                >
                  {s.service_name} (Rp {s.price.toLocaleString()}/{s.unit})
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* 3. Weight / Quantity */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground">
          Weight / Quantity ({unit}) *
        </label>
        <input
          type="number"
          step="0.01"
          required
          min="0.1"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder={`Enter quantity in ${unit}...`}
          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* 4. Payment Period (Waktu Pembayaran) */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Payment Timing *</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setPaymentTiming('upfront')}
            className={`py-2 px-3 border rounded-lg text-xs font-medium cursor-pointer transition-all ${
              paymentTiming === 'upfront'
                ? 'border-primary bg-primary/5 text-primary font-semibold'
                : 'border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
          >
            Pay Now (Upfront)
          </button>
          <button
            type="button"
            onClick={() => {
              setPaymentTiming('pickup');
              setPaymentProofFile(null);
              setPaymentProofPreview(null);
            }}
            className={`py-2 px-3 border rounded-lg text-xs font-medium cursor-pointer transition-all ${
              paymentTiming === 'pickup'
                ? 'border-primary bg-primary/5 text-primary font-semibold'
                : 'border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
          >
            Pay Later (Upon Pickup)
          </button>
        </div>
      </div>

      {/* 5. Payment Method (Hanya muncul jika Bayar Sekarang / upfront) */}
      {paymentTiming === 'upfront' && (
        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">Payment Method *</label>
          <div className="grid grid-cols-3 gap-3">
            <label className={`flex items-center justify-center border rounded-lg p-2.5 cursor-pointer text-xs font-medium transition-all focus-within:ring-2 focus-within:ring-ring focus-within:border-primary ${
              paymentMethod === 'cash'
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-border bg-background hover:bg-accent text-foreground'
            }`}>
              <input
                type="radio"
                name="paymentMethod"
                value="cash"
                checked={paymentMethod === 'cash'}
                onChange={() => {
                  setPaymentMethod('cash');
                  setPaymentProofFile(null);
                  setPaymentProofPreview(null);
                }}
                className="sr-only"
              />
              Cash
            </label>
            <label className={`flex items-center justify-center border rounded-lg p-2.5 cursor-pointer text-xs font-medium transition-all focus-within:ring-2 focus-within:ring-ring focus-within:border-primary ${
              paymentMethod === 'transfer'
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-border bg-background hover:bg-accent text-foreground'
            }`}>
              <input
                type="radio"
                name="paymentMethod"
                value="transfer"
                checked={paymentMethod === 'transfer'}
                onChange={() => setPaymentMethod('transfer')}
                className="sr-only"
              />
              Transfer
            </label>
            <label className={`flex items-center justify-center border rounded-lg p-2.5 cursor-pointer text-xs font-medium transition-all focus-within:ring-2 focus-within:ring-ring focus-within:border-primary ${
              paymentMethod === 'qris'
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-border bg-background hover:bg-accent text-foreground'
            }`}>
              <input
                type="radio"
                name="paymentMethod"
                value="qris"
                checked={paymentMethod === 'qris'}
                onChange={() => setPaymentMethod('qris')}
                className="sr-only"
              />
              QRIS
            </label>
          </div>

          {['transfer', 'qris'].includes(paymentMethod) && (
            <div className="space-y-1.5 pt-2 animate-in fade-in-50 duration-200">
              <label className="text-sm font-semibold text-foreground">Payment Proof Image *</label>
              {paymentProofPreview ? (
                <div className="border border-border rounded-lg p-2 bg-muted/40 flex flex-col items-center">
                  <img
                    src={paymentProofPreview}
                    alt="Payment Proof Preview"
                    className="max-h-32 rounded-md object-contain border border-border bg-background"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentProofFile(null);
                      setPaymentProofPreview(null);
                    }}
                    className="mt-1 text-xs font-semibold text-destructive hover:underline cursor-pointer"
                  >
                    Remove and Choose Another
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center w-full">
                  <label className="border-2 border-dashed border-border hover:border-primary/50 hover:bg-accent/10 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-all w-full text-center focus-within:ring-2 focus-within:ring-ring focus-within:border-primary">
                    <span className="text-xs font-semibold text-foreground">Click to upload payment proof</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">JPEG, JPG, or PNG (Max. 2MB)</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/jpg"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setPaymentProofFile(file);
                          setPaymentProofPreview(URL.createObjectURL(file));
                        }
                      }}
                      className="sr-only"
                    />
                  </label>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 6. Voucher Selection (Hanya muncul jika customer terpilih dan Bayar Sekarang / upfront) */}
      {selectedCustomer && paymentTiming === 'upfront' && (
        <div className="space-y-2 p-3.5 bg-muted/30 border border-border rounded-xl">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-foreground">
            <Ticket className="h-4 w-4 text-primary" />
            <span>Enter Voucher Code (Optional)</span>
          </div>
          <div className="flex gap-2 pt-1.5">
            <input
              type="text"
              placeholder="Enter customer's voucher code..."
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value)}
              className="flex-1 bg-background border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-hidden focus:ring-2 focus:ring-ring text-foreground uppercase"
            />
            <button
              type="button"
              onClick={handleApplyVoucher}
              disabled={checkingVoucher || !voucherCode.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center min-w-10"
              title="Apply Voucher"
            >
              {checkingVoucher ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
            </button>
          </div>
          {voucherError && (
            <p className="text-xs text-destructive pt-1 pl-1 font-medium">{voucherError}</p>
          )}
          {voucherSuccessMsg && (
            <p className="text-xs text-emerald-500 pt-1 pl-1 font-medium">{voucherSuccessMsg}</p>
          )}
        </div>
      )}

      {/* 7. Summary Box */}
      <div className="bg-muted p-4 rounded-lg space-y-3 text-sm border border-border">
        <h4 className="font-semibold text-foreground tracking-tight">Order Summary</h4>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Price Rate</span>
          <span className="font-medium">Rp {price.toLocaleString()}/{unit}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Quantity</span>
          <span className="font-medium">{numericWeight} {unit}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">Rp {subtotal.toLocaleString()}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-emerald-500 font-semibold">
            <span>Discount (Voucher)</span>
            <span>-Rp {discount.toLocaleString()}</span>
          </div>
        )}
        <div className="flex justify-between border-t border-border pt-2">
          <span className="text-muted-foreground">Points to Earn</span>
          <span className="font-semibold text-emerald-500">+{pointsEarned} pts</span>
        </div>
        <div className="flex justify-between border-t border-border pt-2 text-base font-bold text-foreground">
          <span>Total Price</span>
          <span>Rp {finalTotal.toLocaleString()}</span>
        </div>
      </div>

      {/* 8. Action Buttons */}
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
          Create Order
        </button>
      </div>
    </form>
  );
}
