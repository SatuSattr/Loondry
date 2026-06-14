import React, { useState, useRef } from 'react';
import { api } from '../lib/api';
import toast from 'react-hot-toast';
import { User, Mail, Lock, Upload, Loader2, Save } from 'lucide-react';

interface ProfileViewProps {
  user: any;
  onProfileUpdated: (updatedUser: any) => void;
}

export function ProfileView({ user, onProfileUpdated }: ProfileViewProps) {
  // Profile info state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileLoading, setProfileLoading] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Avatar state
  const [avatarLoading, setAvatarLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle profile info submit
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error('Name and Email are required');
      return;
    }

    setProfileLoading(true);
    try {
      const res = await api.updateProfile({ name, email });
      toast.success(res.message || 'Profile updated successfully');
      if (res.user) {
        onProfileUpdated(res.user);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  // Handle password submit
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error('Current password is required');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await api.updatePassword({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      });
      toast.success(res.message || 'Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Handle avatar upload
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type and size
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB');
      return;
    }

    setAvatarLoading(true);
    try {
      const res = await api.updateAvatar(file);
      toast.success(res.message || 'Avatar uploaded successfully');
      if (res.user) {
        onProfileUpdated(res.user);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload avatar');
    } finally {
      setAvatarLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const isSaving = profileLoading || passwordLoading || avatarLoading;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground font-sans">Account Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your admin profile details, upload a profile photo, and secure your password.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Card: Avatar Upload & Card */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-xs flex flex-col items-center justify-center space-y-4">
          <div className="relative group">
            <div className="h-32 w-32 rounded-full overflow-hidden border-2 border-primary/20 bg-muted flex items-center justify-center relative shadow-sm">
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-16 w-16 text-muted-foreground" />
              )}
              {avatarLoading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-full">
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                </div>
              )}
            </div>

            <button
              type="button"
              disabled={isSaving}
              onClick={triggerFileInput}
              className="absolute bottom-1 right-1 bg-primary text-primary-foreground p-2 rounded-full hover:bg-primary/95 transition-all shadow-md cursor-pointer disabled:opacity-50"
              title="Upload profile picture"
            >
              <Upload className="h-4 w-4" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              className="hidden"
              disabled={isSaving}
            />
          </div>

          <div className="text-center">
            <h3 className="font-bold text-foreground text-lg">{user?.name}</h3>
            <span className="text-xs text-muted-foreground block">{user?.email}</span>
            <span className="inline-block mt-2 text-[10px] bg-primary/10 text-primary border border-primary/20 font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full">
              {user?.role}
            </span>
          </div>
        </div>

        {/* Right Section: Forms */}
        <div className="md:col-span-2 space-y-6">
          {/* Profile Details Form */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-xs">
            <h3 className="text-base font-bold text-foreground mb-4">Profile Information</h3>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={isSaving}
                      placeholder="Admin Name"
                      className="w-full bg-background border border-border rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-ring text-foreground disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isSaving}
                      placeholder="admin@loondry.com"
                      className="w-full bg-background border border-border rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-ring text-foreground disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-primary text-primary-foreground hover:bg-primary/95 py-2 px-4 rounded-lg font-semibold text-sm transition-colors cursor-pointer flex items-center space-x-1.5 disabled:opacity-50 shadow-xs"
                >
                  {profileLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span>{profileLoading ? 'Saving...' : 'Save Profile'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-xs">
            <h3 className="text-base font-bold text-foreground mb-4">Security & Password</h3>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Current Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    disabled={isSaving}
                    placeholder="••••••••"
                    className="w-full bg-background border border-border rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-ring text-foreground disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={isSaving}
                      placeholder="Minimum 8 characters"
                      className="w-full bg-background border border-border rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-ring text-foreground disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isSaving}
                      placeholder="Repeat new password"
                      className="w-full bg-background border border-border rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-ring text-foreground disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-primary text-primary-foreground hover:bg-primary/95 py-2 px-4 rounded-lg font-semibold text-sm transition-colors cursor-pointer flex items-center space-x-1.5 disabled:opacity-50 shadow-xs"
                >
                  {passwordLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span>{passwordLoading ? 'Updating...' : 'Update Password'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
