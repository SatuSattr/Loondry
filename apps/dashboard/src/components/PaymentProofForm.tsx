import React, { useState } from 'react';
import { api } from '../lib/api';
import { Loader2, UploadCloud, Ticket, Check } from 'lucide-react';

interface PaymentProofFormProps {
  transaction: any;
  onSubmitSuccess: () => void;
  onCancel: () => void;
}

export function PaymentProofForm({ transaction, onSubmitSuccess, onCancel }: PaymentProofFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  // Payment Method state (only used if transaction.payment_method is null)
  const [paymentMethod, setPaymentMethod] = useState(transaction?.payment_method || 'cash');

  // Voucher states
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; discount: number; name: string } | null>(null);
  const [checkingVoucher, setCheckingVoucher] = useState(false);
  const [voucherError, setVoucherError] = useState('');
  const [voucherSuccessMsg, setVoucherSuccessMsg] = useState('');

  const currentPaymentMethod = transaction?.payment_method || paymentMethod;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError('');
      // Create local preview
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      setVoucherError('Masukkan kode voucher.');
      return;
    }
    setCheckingVoucher(true);
    setVoucherError('');
    setVoucherSuccessMsg('');
    setAppliedVoucher(null);
    try {
      const res = await api.checkVoucherCode(
        voucherCode.trim(),
        Number(transaction?.total_price || 0),
        transaction?.customer_id
      );
      if (res.valid) {
        setAppliedVoucher({
          code: voucherCode.trim(),
          discount: Number(res.discount),
          name: res.name
        });
        setVoucherSuccessMsg(`Voucher berhasil digunakan! Diskon: Rp ${Number(res.discount).toLocaleString()}`);
      } else {
        setVoucherError(res.message || 'Voucher tidak valid.');
      }
    } catch (err: any) {
      setVoucherError(err.message || 'Voucher tidak valid atau sudah kedaluwarsa.');
    } finally {
      setCheckingVoucher(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPaymentMethod !== 'cash' && !selectedFile) {
      setError('Please select an image file');
      return;
    }

    setUploading(true);
    setError('');

    try {
      await api.uploadPaymentProof(
        transaction.id,
        selectedFile,
        appliedVoucher?.code,
        !transaction?.payment_method ? paymentMethod : undefined
      );
      onSubmitSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to upload payment proof');
    } finally {
      setUploading(false);
    }
  };

  const currentDiscount = Number(transaction?.discount || 0) + (appliedVoucher ? appliedVoucher.discount : 0);
  const amountDue = Math.max(0, Number(transaction?.total_price || 0) - currentDiscount);

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-lg p-3 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Transaction Details */}
      <div className="bg-muted p-4 rounded-lg space-y-2 text-sm border border-border">
        <h4 className="font-semibold text-foreground tracking-tight">Invoice Details</h4>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Invoice Code</span>
          <span className="font-mono font-medium">{transaction?.invoice_code}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Customer</span>
          <span className="font-medium">{transaction?.customer?.user?.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Service</span>
          <span className="font-medium">{transaction?.service?.service_name}</span>
        </div>
        {currentDiscount > 0 && (
          <div className="flex justify-between text-emerald-500 font-semibold">
            <span>Diskon Voucher</span>
            <span>-Rp {currentDiscount.toLocaleString()}</span>
          </div>
        )}
        <div className="flex justify-between border-t border-border pt-2 text-base font-bold text-foreground">
          <span>Amount Due</span>
          <span>Rp {amountDue.toLocaleString()}</span>
        </div>
      </div>

      {/* Payment Method Selector (Only if not set on transaction yet) */}
      {!transaction?.payment_method && (
        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">Payment Method *</label>
          <div className="grid grid-cols-3 gap-3">
            <label className={`flex items-center justify-center border rounded-lg p-2.5 cursor-pointer text-xs font-medium transition-all focus-within:ring-2 focus-within:ring-ring focus-within:border-primary ${
              paymentMethod === 'cash'
                ? 'border-primary bg-primary/5 text-primary font-semibold'
                : 'border-border bg-background hover:bg-accent text-foreground'
            }`}>
              <input
                type="radio"
                name="paymentMethod"
                value="cash"
                checked={paymentMethod === 'cash'}
                onChange={() => {
                  setPaymentMethod('cash');
                  setSelectedFile(null);
                  setPreviewUrl(null);
                }}
                className="sr-only"
              />
              Cash
            </label>
            <label className={`flex items-center justify-center border rounded-lg p-2.5 cursor-pointer text-xs font-medium transition-all focus-within:ring-2 focus-within:ring-ring focus-within:border-primary ${
              paymentMethod === 'transfer'
                ? 'border-primary bg-primary/5 text-primary font-semibold'
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
                ? 'border-primary bg-primary/5 text-primary font-semibold'
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
        </div>
      )}

      {/* Voucher Code Input (Only if the transaction doesn't have a voucher applied already) */}
      {!transaction?.voucher_code && (
        <div className="space-y-2 p-3 bg-muted/40 border border-border rounded-lg">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-foreground">
            <Ticket className="h-3.5 w-3.5 text-primary" />
            <span>Gunakan Voucher Belanja (Opsional)</span>
          </div>
          <div className="flex gap-2 pt-1">
            <input
              type="text"
              placeholder="Masukkan kode voucher customer..."
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value)}
              className="flex-1 bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs focus:outline-hidden focus:ring-2 focus:ring-ring text-foreground uppercase"
            />
            <button
              type="button"
              onClick={handleApplyVoucher}
              disabled={checkingVoucher || !voucherCode.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/95 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center min-w-8"
              title="Terapkan Voucher"
            >
              {checkingVoucher ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Check className="h-3 w-3" />
              )}
            </button>
          </div>
          {voucherError && (
            <p className="text-[11px] text-destructive pt-0.5 pl-0.5 font-medium">{voucherError}</p>
          )}
          {voucherSuccessMsg && (
            <p className="text-[11px] text-emerald-500 pt-0.5 pl-0.5 font-medium">{voucherSuccessMsg}</p>
          )}
        </div>
      )}

      {/* Upload Box */}
      {currentPaymentMethod === 'cash' ? (
        <div className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg p-4 text-xs space-y-2">
          <p className="font-semibold text-sm">Pembayaran Cash</p>
          <p className="text-muted-foreground text-[11px] leading-relaxed">
            Metode pembayaran transaksi ini adalah <strong>Cash</strong>. Anda tidak perlu mengunggah foto bukti pembayaran.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Payment Proof Image *</label>
          
          {previewUrl ? (
            <div className="border border-border rounded-lg p-2 bg-background flex flex-col items-center">
              <img
                src={previewUrl}
                alt="Payment Proof Preview"
                className="max-h-60 rounded-md object-contain border border-border bg-muted w-full"
              />
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl(null);
                }}
                className="mt-2 text-xs font-semibold text-destructive hover:underline cursor-pointer"
              >
                Remove and Choose Another
              </button>
            </div>
          ) : (
            <label className="border-2 border-dashed border-border hover:border-primary/50 hover:bg-accent/10 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-all">
              <UploadCloud className="h-10 w-10 text-muted-foreground mb-3" />
              <span className="text-sm font-semibold text-foreground">Click to upload image</span>
              <span className="text-xs text-muted-foreground mt-1">JPEG, JPG, or PNG (Max. 2MB)</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-3 pt-4 border-t border-border mt-6">
        <button
          type="button"
          onClick={onCancel}
          disabled={uploading}
          className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/80 py-2 px-4 rounded-lg font-medium transition-colors cursor-pointer text-sm text-center disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={uploading || (currentPaymentMethod !== 'cash' && !selectedFile)}
          className="flex-2 bg-primary text-primary-foreground hover:bg-primary/95 py-2 px-4 rounded-lg font-medium transition-colors cursor-pointer text-sm flex items-center justify-center disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : null}
          Confirm & Pay
        </button>
      </div>
    </form>
  );
}
