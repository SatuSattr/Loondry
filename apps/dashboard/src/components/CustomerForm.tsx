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

interface CustomerFormProps {
  customer?: any; // If present, it's Edit mode
  onSubmitSuccess: () => void;
  onCancel: () => void;
}

export function CustomerForm({ customer, onSubmitSuccess, onCancel }: CustomerFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [religion, setReligion] = useState('');
  const [gender, setGender] = useState('L');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState<any>(null);

  useEffect(() => {
    if (customer) {
      setName(customer.user?.name || '');
      setEmail(customer.user?.email || '');
      setPhone(customer.phone || '');
      setAddress(customer.address || '');
      setBirthDate(customer.user?.birth_date || '');
      setReligion(customer.user?.religion || '');
      setGender(customer.user?.gender || 'L');
      setPassword('');
      setError('');
      setSuccessData(null);
    } else {
      setName('');
      setEmail('');
      setPhone('');
      setAddress('');
      setBirthDate('');
      setReligion('');
      setGender('L');
      setPassword('');
      setError('');
      setSuccessData(null);
    }
  }, [customer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessData(null);

    const payload: any = {
      name,
      email,
      phone,
      address,
      birth_date: birthDate || null,
      religion: religion || null,
      gender,
    };

    if (password) {
      payload.password = password;
    }

    try {
      if (customer) {
        // Edit Customer
        await api.updateCustomer(customer.id, payload);
        onSubmitSuccess();
      } else {
        // Create Customer
        const res = await api.createCustomer(payload);
        setSuccessData(res);
        // Don't call onSubmitSuccess immediately if we want to show credentials
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save customer');
    } finally {
      setLoading(false);
    }
  };

  if (successData) {
    return (
      <div className="space-y-6">
        <div className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg p-4 text-sm">
          <p className="font-semibold">Customer Created Successfully!</p>
          <p className="mt-1">Credentials have been sent to their email.</p>
        </div>

        <div className="bg-muted p-4 rounded-lg space-y-3 text-sm border border-border">
          <h4 className="font-medium text-foreground">Temp Access Details:</h4>
          <div>
            <span className="text-muted-foreground block text-xs">Email</span>
            <span className="font-mono text-foreground">{successData.data?.user?.email}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-xs">Password</span>
            <span className="font-mono text-foreground font-semibold bg-background px-2 py-0.5 rounded border border-border inline-block">
              {successData.debug_password}
            </span>
          </div>
          <p className="text-xs text-amber-500 font-medium">
            Please copy this password for immediate use, as it won't be displayed again!
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onSubmitSuccess}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 py-2.5 px-4 rounded-lg font-medium transition-colors cursor-pointer text-sm text-center"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-lg p-3 text-sm font-medium">
          {error}
        </div>
      )}

      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground">Full Name *</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. John Doe"
          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground">Email Address *</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="e.g. customer@example.com"
          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground">Phone Number *</label>
        <input
          type="text"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="e.g. 0812345678"
          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground">Address *</label>
        <textarea
          required
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Street address..."
          rows={3}
          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-ring resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">Gender</label>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full justify-between text-sm font-normal border-border bg-background hover:bg-accent text-foreground cursor-pointer"
                >
                  <span>{gender === 'L' ? 'Male (L)' : 'Female (P)'}</span>
                  <ChevronDown className="h-4 w-4 opacity-50 ml-2" />
                </Button>
              }
            />
            <DropdownMenuContent className="w-[150px] bg-card border border-border rounded-lg shadow-lg z-50 py-1" align="start">
              <DropdownMenuItem
                onClick={() => setGender('L')}
                className={`w-full text-left px-3 py-1.5 text-xs transition-colors hover:bg-accent/80 cursor-pointer ${
                  gender === 'L' ? 'bg-primary/10 text-primary font-semibold' : 'text-foreground'
                }`}
              >
                Male (L)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setGender('P')}
                className={`w-full text-left px-3 py-1.5 text-xs transition-colors hover:bg-accent/80 cursor-pointer ${
                  gender === 'P' ? 'bg-primary/10 text-primary font-semibold' : 'text-foreground'
                }`}
              >
                Female (P)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">Birth Date</label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground">Religion</label>
        <input
          type="text"
          value={religion}
          onChange={(e) => setReligion(e.target.value)}
          placeholder="e.g. Islam, Kristen, dll."
          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground">
          {customer ? 'New Password (Leave blank to keep current)' : 'Password (Optional)'}
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={customer ? '••••••••' : 'Leave blank to generate automatically'}
          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-ring"
        />
      </div>

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
          {customer ? 'Update Customer' : 'Create Customer'}
        </button>
      </div>
    </form>
  );
}
