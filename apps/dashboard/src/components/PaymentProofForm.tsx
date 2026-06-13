import React, { useState } from 'react';
import { api } from '../lib/api';
import { Loader2, UploadCloud } from 'lucide-react';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (transaction?.payment_method !== 'cash' && !selectedFile) {
      setError('Please select an image file');
      return;
    }

    setUploading(true);
    setError('');

    try {
      await api.uploadPaymentProof(transaction.id, selectedFile);
      onSubmitSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to upload payment proof');
    } finally {
      setUploading(false);
    }
  };

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
        <div className="flex justify-between border-t border-border pt-2 text-base font-bold text-foreground">
          <span>Amount Due</span>
          <span>Rp {(Number(transaction?.total_price) - Number(transaction?.discount || 0)).toLocaleString()}</span>
        </div>
      </div>

      {/* Upload Box */}
      {transaction?.payment_method === 'cash' ? (
        <div className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg p-4 text-xs space-y-2">
          <p className="font-semibold text-sm">Pembayaran Tunai (Cash)</p>
          <p className="text-muted-foreground text-[11px] leading-relaxed">
            Metode pembayaran transaksi ini adalah <strong>Cash</strong>. Anda tidak perlu mengunggah foto bukti pembayaran. Cukup klik tombol <strong>Confirm & Pay</strong> di bawah untuk memproses dan mengaktifkan poin loyalitas pelanggan.
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
          disabled={uploading || (transaction?.payment_method !== 'cash' && !selectedFile)}
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
