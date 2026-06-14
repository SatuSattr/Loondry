import React, { useState } from 'react';
import { API_BASE, getAuthToken } from '../lib/api';
import { Loader2, Camera, Trash2, Check } from 'lucide-react';

interface OrderPhotoFormProps {
  transaction: any;
  onSubmitSuccess: () => void;
  onCancel: () => void;
}

export function OrderPhotoForm({ transaction, onSubmitSuccess, onCancel }: OrderPhotoFormProps) {
  // Pre-populate existing images from transaction
  const existingBefore = transaction.images?.find((img: any) => img.type === 'before');
  const existingAfter = transaction.images?.find((img: any) => img.type === 'after');

  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [beforePreview, setBeforePreview] = useState<string | null>(
    existingBefore ? `${API_BASE}/storage/${existingBefore.image_path}` : null
  );

  const [afterFile, setAfterFile] = useState<File | null>(null);
  const [afterPreview, setAfterPreview] = useState<string | null>(
    existingAfter ? `${API_BASE}/storage/${existingAfter.image_path}` : null
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 5MB
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'before') {
        setBeforeFile(file);
        setBeforePreview(reader.result as string);
      } else {
        setAfterFile(file);
        setAfterPreview(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
    setError('');
  };

  const handleRemoveImage = (type: 'before' | 'after') => {
    if (type === 'before') {
      setBeforeFile(null);
      setBeforePreview(null);
      // Reset file input
      const input = document.getElementById('before-photo-input') as HTMLInputElement;
      if (input) input.value = '';
    } else {
      setAfterFile(null);
      setAfterPreview(null);
      // Reset file input
      const input = document.getElementById('after-photo-input') as HTMLInputElement;
      if (input) input.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const token = getAuthToken();
    const formData = new FormData();

    // Only append if a new file has been chosen
    if (beforeFile) {
      formData.append('image_before', beforeFile);
    }
    if (afterFile) {
      formData.append('image_after', afterFile);
    }

    try {
      const response = await fetch(`${API_BASE}/api/transactions/${transaction.id}/condition-images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: formData,
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || 'Failed to upload order photos');
      }

      setSuccess('Order photos uploaded successfully!');
      setTimeout(() => {
        onSubmitSuccess();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-lg p-3 text-sm font-medium">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg p-3 text-sm font-medium flex items-center">
          <Check className="h-4 w-4 mr-2" />
          {success}
        </div>
      )}

      <div className="text-sm font-mono bg-muted/40 p-3 rounded-lg border border-border">
        <p className="font-semibold text-foreground">Order: {transaction.invoice_code}</p>
        <p className="text-muted-foreground text-xs">Customer: {transaction.customer?.user?.name || 'Walk-in'}</p>
      </div>

      {/* BEFORE PHOTO INPUT */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground block">Foto Before (Sebelum Dicuci)</label>
        {beforePreview ? (
          <div className="relative border border-border rounded-xl overflow-hidden aspect-video bg-muted group">
            <img src={beforePreview} alt="Before Preview" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
              <button
                type="button"
                onClick={() => handleRemoveImage('before')}
                className="p-2 bg-destructive text-white rounded-full hover:bg-destructive/90 transition-colors cursor-pointer"
                title="Remove photo"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => document.getElementById('before-photo-input')?.click()}
            className="border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-card hover:bg-accent/20 aspect-video"
          >
            <Camera className="h-8 w-8 text-muted-foreground mb-2" />
            <span className="text-xs font-semibold text-foreground">Click to upload Before Photo</span>
            <span className="text-[10px] text-muted-foreground mt-1">PNG, JPG or JPEG up to 5MB</span>
          </div>
        )}
        <input
          type="file"
          id="before-photo-input"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileChange(e, 'before')}
        />
      </div>

      {/* AFTER PHOTO INPUT */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground block">Foto After (Setelah Dicuci)</label>
        {afterPreview ? (
          <div className="relative border border-border rounded-xl overflow-hidden aspect-video bg-muted group">
            <img src={afterPreview} alt="After Preview" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
              <button
                type="button"
                onClick={() => handleRemoveImage('after')}
                className="p-2 bg-destructive text-white rounded-full hover:bg-destructive/90 transition-colors cursor-pointer"
                title="Remove photo"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => document.getElementById('after-photo-input')?.click()}
            className="border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-card hover:bg-accent/20 aspect-video"
          >
            <Camera className="h-8 w-8 text-muted-foreground mb-2" />
            <span className="text-xs font-semibold text-foreground">Click to upload After Photo</span>
            <span className="text-[10px] text-muted-foreground mt-1">PNG, JPG or JPEG up to 5MB</span>
          </div>
        )}
        <input
          type="file"
          id="after-photo-input"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileChange(e, 'after')}
        />
      </div>

      {/* Buttons */}
      <div className="flex space-x-3 pt-4 border-t border-border">
        <button
          type="submit"
          disabled={loading || (!beforeFile && !afterFile && beforePreview === (existingBefore ? `${API_BASE}/storage/${existingBefore.image_path}` : null) && afterPreview === (existingAfter ? `${API_BASE}/storage/${existingAfter.image_path}` : null))}
          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 py-2 rounded-lg font-semibold transition-colors cursor-pointer flex items-center justify-center text-sm disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Save Photos
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-border bg-background text-foreground hover:bg-accent rounded-lg text-sm font-semibold transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
