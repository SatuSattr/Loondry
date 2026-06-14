import React, { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api';
import toast from 'react-hot-toast';
import { Send, Users, Loader2, Image as ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NotificationsViewProps {
  onSubmitSuccess?: () => void;
  onCancel?: () => void;
}

export function NotificationsView({ onSubmitSuccess, onCancel }: NotificationsViewProps) {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Form States
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]); // 'L', 'P'
  const [selectedReligions, setSelectedReligions] = useState<string[]>([]);
  const [minAge, setMinAge] = useState<string>('');
  const [maxAge, setMaxAge] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isInApp, setIsInApp] = useState(true);
  const [isPush, setIsPush] = useState(true);
  const [showAudienceList, setShowAudienceList] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB');
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const religionsList = [
    'Islam',
    'Kristen Protestan',
    'Kristen Katolik',
    'Hindu',
    'Buddha',
    'Khonghucu'
  ];

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.getCustomers();
      setCustomers(res.data || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const getAge = (birthDateStr: string | null) => {
    if (!birthDateStr) return 0;
    const today = new Date();
    const birthDate = new Date(birthDateStr);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Filter customers locally for the live preview
  const matchedCustomers = customers.filter((c) => {
    const u = c.user;
    if (!u) return false;

    // Filter by Gender
    if (selectedGenders.length > 0) {
      if (!u.gender || !selectedGenders.includes(u.gender)) return false;
    }

    // Filter by Religion
    if (selectedReligions.length > 0) {
      if (!u.religion || !selectedReligions.some(r => r.toLowerCase() === u.religion.toLowerCase())) {
        return false;
      }
    }

    // Filter by Age
    const age = getAge(u.birth_date);
    if (minAge !== '') {
      if (!u.birth_date || age < Number(minAge)) return false;
    }
    if (maxAge !== '') {
      if (!u.birth_date || age > Number(maxAge)) return false;
    }

    return true;
  });

  const handleGenderToggle = (gender: string) => {
    setSelectedGenders((prev) =>
      prev.includes(gender) ? prev.filter((g) => g !== gender) : [...prev, gender]
    );
  };

  const handleReligionToggle = (religion: string) => {
    setSelectedReligions((prev) =>
      prev.includes(religion) ? prev.filter((r) => r !== religion) : [...prev, religion]
    );
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error('Notification title and message are required.');
      return;
    }

    if (!isInApp && !isPush) {
      toast.error('Please select at least one delivery channel.');
      return;
    }

    if (matchedCustomers.length === 0) {
      toast.error('No customers matched your selected criteria.');
      return;
    }

    setSending(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('content', content.trim());

      if (imageFile) {
        formData.append('image', imageFile);
      }

      if (selectedGenders.length > 0) {
        selectedGenders.forEach((g) => formData.append('genders[]', g));
      }

      if (selectedReligions.length > 0) {
        selectedReligions.forEach((r) => formData.append('religions[]', r));
      }

      if (minAge !== '') {
        formData.append('min_age', minAge);
      }

      if (maxAge !== '') {
        formData.append('max_age', maxAge);
      }

      formData.append('is_in_app', String(isInApp));
      formData.append('is_push', String(isPush));

      const res = await api.sendTargetedNotification(formData);
      toast.success(res.message || 'Notification broadcast sent successfully!');
      
      // Reset Form
      setTitle('');
      setContent('');
      setSelectedGenders([]);
      setSelectedReligions([]);
      setMinAge('');
      setMaxAge('');
      setImageFile(null);
      setImagePreview(null);
      setIsInApp(true);
      setIsPush(true);
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
      
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSend} className="space-y-5">
      {/* Title */}
      <div className="space-y-1">
        <label className="text-sm font-semibold text-foreground">Notification Title *</label>
        <input
          type="text"
          required
          disabled={sending}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Special Weekend Discount!"
          className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-sm focus:outline-hidden focus:ring-2 focus:ring-ring text-foreground disabled:opacity-50"
        />
      </div>

      {/* Content / Message */}
      <div className="space-y-1">
        <label className="text-sm font-semibold text-foreground">Message Body *</label>
        <textarea
          required
          disabled={sending}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your notification content details here..."
          rows={4}
          className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-sm focus:outline-hidden focus:ring-2 focus:ring-ring text-foreground resize-none disabled:opacity-50"
        />
      </div>

      {/* Banner Image */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
            Banner Image <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
          </label>
          {imagePreview && (
            <button
              type="button"
              onClick={handleClearImage}
              className="text-xs font-semibold text-destructive hover:underline flex items-center gap-1 cursor-pointer"
            >
              <X className="h-3 w-3" /> Remove Image
            </button>
          )}
        </div>
        
        {!imagePreview ? (
          <div 
            onClick={() => imageInputRef.current?.click()}
            className="border border-dashed border-border hover:border-primary/50 transition-all rounded-lg p-5 flex flex-col items-center justify-center gap-2 cursor-pointer bg-background hover:bg-accent/10"
          >
            <input
              type="file"
              ref={imageInputRef}
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              <ImageIcon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold text-foreground">Click to upload banner image</p>
              <p className="text-[10px] text-muted-foreground mt-1">
                PNG, JPG, or WEBP. Max size 2MB. Horizontal banner shape (21:9) recommended.
              </p>
            </div>
          </div>
        ) : (
          <div className="relative border border-border rounded-lg overflow-hidden bg-background">
            <div className="aspect-[21/9] w-full overflow-hidden flex items-center justify-center bg-muted">
              <img 
                src={imagePreview} 
                alt="Banner Preview" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}
      </div>

      {/* Delivery Channels */}
      <div className="space-y-2.5">
        <label className="text-sm font-semibold text-foreground block">Notification Delivery Methods</label>
        <div className="flex flex-col gap-3">
          {/* Save to In-App History */}
          <div 
            onClick={() => setIsInApp(!isInApp)}
            className={`flex items-start gap-3 p-3.5 border rounded-xl cursor-pointer transition-all ${
              isInApp 
                ? 'bg-primary/5 border-primary text-foreground' 
                : 'bg-background border-border text-muted-foreground hover:bg-accent/40'
            }`}
          >
            <input
              type="checkbox"
              checked={isInApp}
              onChange={() => {}} // handled by parent onClick
              className="mt-0.5 rounded border-border text-primary focus:ring-ring cursor-pointer h-4.5 w-4.5"
            />
            <div>
              <span className="font-bold text-xs block text-foreground">Save to Inbox (In-App History)</span>
              <span className="text-[10px] text-muted-foreground block mt-0.5">
                Notifications are saved and can be read by the customer inside their app inbox at any time.
              </span>
            </div>
          </div>

          {/* Send Push Notification */}
          <div 
            onClick={() => setIsPush(!isPush)}
            className={`flex items-start gap-3 p-3.5 border rounded-xl cursor-pointer transition-all ${
              isPush 
                ? 'bg-primary/5 border-primary text-foreground' 
                : 'bg-background border-border text-muted-foreground hover:bg-accent/40'
            }`}
          >
            <input
              type="checkbox"
              checked={isPush}
              onChange={() => {}} // handled by parent onClick
              className="mt-0.5 rounded border-border text-primary focus:ring-ring cursor-pointer h-4.5 w-4.5"
            />
            <div>
              <span className="font-bold text-xs block text-foreground">Send as Mobile Push Notification</span>
              <span className="text-[10px] text-muted-foreground block mt-0.5">
                Display a pop-up banner directly on the customer's phone status bar/lock screen (even if the app is closed).
              </span>
            </div>
          </div>
        </div>
      </div>

      <hr className="border-border/60 my-2" />

      {/* Demographic Targeting Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
            <Users className="h-4.5 w-4.5 text-primary" />
            Audience Target Filters
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">Leave filters blank to target all registered customers.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setSelectedGenders([]);
            setSelectedReligions([]);
            setMinAge('');
            setMaxAge('');
          }}
          className="text-xs font-medium text-destructive hover:underline cursor-pointer"
        >
          Reset Filters
        </button>
      </div>

      {/* Gender Filters */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Gender Target</label>
        <div className="flex gap-2">
          {[
            { value: 'L', label: 'Male' },
            { value: 'P', label: 'Female' }
          ].map((gender) => {
            const active = selectedGenders.includes(gender.value);
            return (
              <button
                key={gender.value}
                type="button"
                disabled={sending}
                onClick={() => handleGenderToggle(gender.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  active
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'bg-background border-border text-muted-foreground hover:bg-accent/40'
                }`}
              >
                <span>{gender.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Religion Filters */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Religion Target</label>
        <div className="flex flex-wrap gap-2">
          {religionsList.map((religion) => {
            const active = selectedReligions.includes(religion);
            return (
              <button
                key={religion}
                type="button"
                disabled={sending}
                onClick={() => handleReligionToggle(religion)}
                className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  active
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'bg-background border-border text-muted-foreground hover:bg-accent/40'
                }`}
              >
                <span>{religion}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Age Range Filter */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Age Range Target</label>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground block">Min Age</span>
            <input
              type="number"
              min="0"
              disabled={sending}
              value={minAge}
              onChange={(e) => setMinAge(e.target.value)}
              placeholder="e.g. 17"
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-ring text-foreground"
            />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground block">Max Age</span>
            <input
              type="number"
              min="0"
              disabled={sending}
              value={maxAge}
              onChange={(e) => setMaxAge(e.target.value)}
              placeholder="e.g. 26"
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-ring text-foreground"
            />
          </div>
        </div>
      </div>

      {/* Live Demographics Matched Preview */}
      <div className="border border-border rounded-xl p-4 bg-muted/20 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4.5 w-4.5 text-primary" />
            <div>
              <span className="font-bold text-xs block text-foreground">Recipient Estimate</span>
              <span className="text-[10px] text-muted-foreground block">Estimated real-time audience size</span>
            </div>
          </div>
          <span className="text-lg font-extrabold text-primary">{matchedCustomers.length} Customers</span>
        </div>

        {matchedCustomers.length > 0 && (
          <div className="pt-2.5 border-t border-border/60">
            <button
              type="button"
              onClick={() => setShowAudienceList(!showAudienceList)}
              className="text-[10px] font-semibold text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
            >
              {showAudienceList ? 'Hide Recipients List' : 'View Recipients List'}
            </button>
            
            {showAudienceList && (
              <div className="mt-2.5 max-h-32 overflow-y-auto space-y-1.5 pr-1">
                {matchedCustomers.map((c) => {
                  const age = getAge(c.user?.birth_date);
                  return (
                    <div key={c.id} className="flex justify-between items-center py-1.5 px-2 bg-background border border-border/40 rounded-lg text-[10px]">
                      <div className="truncate max-w-[160px]">
                        <span className="font-semibold block truncate">{c.user?.name}</span>
                        <span className="text-[8px] text-muted-foreground block truncate">{c.user?.email}</span>
                      </div>
                      <div className="flex gap-1">
                        {c.user?.gender && (
                          <span className="text-[8px] font-bold px-1 bg-accent/40 border border-accent text-accent-foreground rounded-sm">
                            {c.user.gender === 'L' ? 'Male' : 'Female'}
                          </span>
                        )}
                        {age > 0 && (
                          <span className="text-[8px] font-bold px-1 bg-accent/40 border border-accent text-accent-foreground rounded-sm">
                            {age} y/o
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1 py-2.5 text-sm font-semibold border-border hover:bg-accent text-foreground cursor-pointer"
          >
            Cancel
          </Button>
        )}
        <button
          type="submit"
          disabled={sending || matchedCustomers.length === 0 || (!isInApp && !isPush)}
          className="flex-2 bg-primary text-primary-foreground hover:bg-primary/95 py-2.5 rounded-lg font-bold transition-colors cursor-pointer flex items-center justify-center text-sm disabled:opacity-50 shadow-xs"
        >
          {sending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Sending...
            </>
          ) : !isInApp && !isPush ? (
            <>
              Select Delivery Method
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send Notification ({matchedCustomers.length})
            </>
          )}
        </button>
      </div>
    </form>
  );
}
