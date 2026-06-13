import React, { useState, useEffect } from 'react';
import { api, getAuthToken, setAuthToken, getSavedUser, setSavedUser } from './lib/api';
import { SlideOver } from './components/SlideOver';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

NProgress.configure({
  showSpinner: false,
  minimum: 0.15,
  speed: 300,
});
import { CustomerForm } from './components/CustomerForm';
import { ServiceForm } from './components/ServiceForm';
import { TransactionForm } from './components/TransactionForm';
import { ApplyVoucherForm } from './components/ApplyVoucherForm';
import { PaymentProofForm } from './components/PaymentProofForm';
import { DashboardView } from './components/DashboardView';
import { POSView } from './components/POSView';
import { CustomersView } from './components/CustomersView';
import { ServicesView } from './components/ServicesView';
import { VouchersView } from './components/VouchersView';
import { VoucherForm } from './components/VoucherForm';
import { RedeemVoucherForm } from './components/RedeemVoucherForm';
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Layers,
  LogOut,
  Sun,
  Moon,
  Loader2,
  Lock,
  Mail,
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
  Ticket,
} from 'lucide-react';

type SlideOverType =
  | 'create-order'
  | 'create-customer'
  | 'edit-customer'
  | 'create-service'
  | 'edit-service'
  | 'apply-voucher'
  | 'payment-proof'
  | 'create-voucher'
  | 'edit-voucher'
  | 'redeem-voucher'
  | 'shortcuts-info'
  | null;

export default function App() {
  const [token, setToken] = useState<string | null>(getAuthToken());
  const [user, setUser] = useState<any>(getSavedUser());
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pos' | 'customers' | 'services' | 'vouchers'>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleTabChange = async (tab: 'dashboard' | 'pos' | 'customers' | 'services' | 'vouchers') => {
    if (tab === activeTab || isTransitioning) return;
    
    setIsTransitioning(true);
    NProgress.start();
    
    try {
      switch (tab) {
        case 'dashboard':
          await api.getDashboard('all');
          break;
        case 'pos':
          await api.getTransactions();
          break;
        case 'customers':
          await api.getCustomers();
          break;
        case 'services':
          await api.getServices();
          break;
        case 'vouchers':
          await api.getVoucherTemplates();
          break;
      }
      setActiveTab(tab);
    } catch (err) {
      console.error('Prefetch failed:', err);
      // Fallback: switch tab anyway on error
      setActiveTab(tab);
    } finally {
      setIsTransitioning(false);
      NProgress.done();
    }
  };

  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Login Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // SlideOver drawer states
  const [slideOverType, setSlideOverType] = useState<SlideOverType>(null);
  const [activeItem, setActiveItem] = useState<any>(null); // To pass into Edit forms

  // Apply Dark Mode Class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Listen for API 401 token expired event
  useEffect(() => {
    const handleAuthExpired = () => {
      setToken(null);
      setUser(null);
    };
    window.addEventListener('auth-expired', handleAuthExpired);
    return () => window.removeEventListener('auth-expired', handleAuthExpired);
  }, []);

  // Global keyboard shortcuts for cashiers
  useEffect(() => {
    if (!token) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isTyping = activeEl && (
        activeEl.tagName === 'INPUT' || 
        activeEl.tagName === 'TEXTAREA' || 
        activeEl.getAttribute('contenteditable') === 'true'
      );

      // Escape -> Close open slideover drawer
      if (e.key === 'Escape') {
        if (slideOverType !== null) {
          e.preventDefault();
          setSlideOverType(null);
          setActiveItem(null);
        }
      }

      // Ctrl + Enter -> Submit active form
      if (e.ctrlKey && e.key === 'Enter') {
        const activeForm = activeEl?.closest('form');
        if (activeForm) {
          e.preventDefault();
          activeForm.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        }
      }

      // Non-typing shortcuts
      if (!isTyping) {
        // F2 or Alt + N -> Create Transaction
        if (e.key === 'F2' || (e.altKey && e.key.toLowerCase() === 'n')) {
          e.preventDefault();
          setSlideOverType('create-order');
        }

        // F3 or Alt + C -> Register/Add Customer
        if (e.key === 'F3' || (e.altKey && e.key.toLowerCase() === 'c')) {
          e.preventDefault();
          setSlideOverType('create-customer');
        }

        // '/' -> Focus search input
        if (e.key === '/') {
          const searchInput = document.querySelector('[data-shortcut="search"]') as HTMLInputElement;
          if (searchInput) {
            e.preventDefault();
            searchInput.focus();
            searchInput.select();
          }
        }

        // Alt + 1-5 -> Tab navigation
        if (e.altKey && e.key === '1') {
          e.preventDefault();
          handleTabChange('dashboard');
        }
        if (e.altKey && e.key === '2') {
          e.preventDefault();
          handleTabChange('pos');
        }
        if (e.altKey && e.key === '3') {
          e.preventDefault();
          handleTabChange('customers');
        }
        if (e.altKey && e.key === '4') {
          e.preventDefault();
          handleTabChange('services');
        }
        if (e.altKey && e.key === '5') {
          e.preventDefault();
          handleTabChange('vouchers');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [token, slideOverType, activeTab, isTransitioning]);

  // Dynamic Document Title
  useEffect(() => {
    const tabTitles: Record<string, string> = {
      dashboard: 'Dashboard | Loondry Admin',
      pos: 'Transactions | Loondry Admin',
      customers: 'Customer | Loondry Admin',
      services: 'Service | Loondry Admin',
      vouchers: 'Vouchers | Loondry Admin',
    };
    
    if (token) {
      document.title = tabTitles[activeTab] || 'Loondry Admin Portal';
    } else {
      document.title = 'Sign In | Loondry POS Portal';
    }
  }, [activeTab, token]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      const res = await api.login({ email, password });
      if (res.access_token) {
        setAuthToken(res.access_token);
        setSavedUser(res.user);
        setToken(res.access_token);
        setUser(res.user);
      }
    } catch (err: any) {
      setLoginError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.error('Logout API failed', err);
    } finally {
      setAuthToken(null);
      setSavedUser(null);
      setToken(null);
      setUser(null);
    }
  };

  // Drawer Title helper
  const getSlideOverTitle = () => {
    switch (slideOverType) {
      case 'shortcuts-info':
        return 'Keyboard Shortcuts';
      case 'create-order':
        return 'New Laundry Order';
      case 'create-customer':
        return 'Register New Customer';
      case 'edit-customer':
        return 'Edit Customer Profile';
      case 'create-service':
        return 'Add Laundry Service';
      case 'edit-service':
        return 'Edit Service Details';
      case 'apply-voucher':
        return 'Apply Customer Voucher';
      case 'payment-proof':
        return 'Confirm Payment & Points';
      case 'create-voucher':
        return 'Create Voucher Template';
      case 'edit-voucher':
        return 'Edit Voucher Template';
      case 'redeem-voucher':
        return 'Redeem Points for Voucher';
      default:
        return '';
    }
  };

  // Form submit success callback (reloads active tab components)
  const handleFormSubmitSuccess = () => {
    setSlideOverType(null);
    setActiveItem(null);
    // Trigger tab refresh by remounting or firing custom events.
    // For simplicity, we just force reload the page or dispatch a reload trigger.
    window.dispatchEvent(new Event('refresh-data'));
  };

  // Render correct Active Tab Component
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            onOpenCreateOrder={() => setSlideOverType('create-order')}
            onOpenCreateCustomer={() => setSlideOverType('create-customer')}
            onOpenShortcuts={() => setSlideOverType('shortcuts-info')}
          />
        );
      case 'pos':
        return (
          <POSView
            onOpenCreateOrder={() => setSlideOverType('create-order')}
            onOpenApplyVoucher={(tx) => {
              setActiveItem(tx);
              setSlideOverType('apply-voucher');
            }}
            onOpenPaymentProof={(tx) => {
              setActiveItem(tx);
              setSlideOverType('payment-proof');
            }}
            onOpenShortcuts={() => setSlideOverType('shortcuts-info')}
          />
        );
      case 'customers':
        return (
          <CustomersView
            onOpenCreateCustomer={() => setSlideOverType('create-customer')}
            onOpenEditCustomer={(customer) => {
              setActiveItem(customer);
              setSlideOverType('edit-customer');
            }}
            onOpenRedeemVoucher={(customer) => {
              setActiveItem(customer);
              setSlideOverType('redeem-voucher');
            }}
          />
        );
      case 'services':
        return (
          <ServicesView
            onOpenCreateService={() => setSlideOverType('create-service')}
            onOpenEditService={(service) => {
              setActiveItem(service);
              setSlideOverType('edit-service');
            }}
          />
        );
      case 'vouchers':
        return (
          <VouchersView
            onOpenCreateVoucher={() => setSlideOverType('create-voucher')}
            onOpenEditVoucher={(voucher) => {
              setActiveItem(voucher);
              setSlideOverType('edit-voucher');
            }}
          />
        );
    }
  };

  // Listen for refresh triggers inside views
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  useEffect(() => {
    const handleRefresh = () => setRefreshTrigger((prev) => prev + 1);
    window.addEventListener('refresh-data', handleRefresh);
    return () => window.removeEventListener('refresh-data', handleRefresh);
  }, []);

  // Login Page
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden transition-colors duration-300">
        {/* Soft Background blur gradients */}
        <div className="absolute top-50% right-50% h-[500px] w-[500px] blur-[120px] bg-gradient-to-bl from-blue-500/20 via-blue-500/15 to-blue-500/5   pointer-events-none" />

        {/* Floating Dark Mode Toggle */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="absolute top-6 right-6 p-2 rounded-lg border border-border bg-card text-foreground hover:bg-accent transition-all duration-300 cursor-pointer shadow-xs"
        >
          {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        <div className="w-full max-w-md bg-card border border-border text-foreground  rounded-2xl p-8 z-10 transition-colors duration-300">
          <div className="text-center space-y-2 mb-8">
            <img 
              src={isDarkMode ? "/assets/loondry-logo-brand-white.png" : "/assets/loondry-logo-brand-colored.png"} 
              alt="Loondry Logo" 
              className="h-14 mx-auto mb-4 object-contain"
            />
            <p className="text-sm text-muted-foreground">Admin & Operator Portal</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-lg p-3 text-sm font-medium">
                {loginError}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@loondry.com"
                  className="w-full bg-background border border-border rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-ring text-foreground"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-background border border-border rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-ring text-foreground"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/95 py-2.5 rounded-lg font-semibold transition-colors cursor-pointer flex items-center justify-center text-sm disabled:opacity-50 mt-6"
            >
              {loginLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Dashboard Layout
  return (
    <div className="relative h-screen overflow-hidden bg-background text-foreground flex transition-colors duration-300">

      {/* Ambient Gradient Blur Circle */}
      <div className="absolute top-5 -right-5 h-[400px] w-[400px] md:top-[-200px] md:right-[-600px] rotate-45 blur-[120px] md:w-[1000px] md:h-[1000px]  bg-gradient-to-bl from-blue-500/20 via-blue-500/15 to-blue-500/5   pointer-events-none" />

      {/* Left Sidebar Navigation */}
      <aside className={`relative bg-card border-r border-border flex flex-col z-10 justify-between hidden md:flex shrink-0 ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
        {/* Floating Toggle Button on Right Border */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full bg-card border border-border shadow-md text-muted-foreground hover:text-foreground cursor-pointer z-40 transition-colors"
          title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>

        {/* Brand */}
        <div className="p-4 border-b border-border flex items-center justify-center shrink-0">
          <img 
            src={isSidebarCollapsed 
              ? (isDarkMode ? "/assets/loondry-logo-white.png" : "/assets/loondry-logo-colored.png")
              : (isDarkMode ? "/assets/loondry-logo-brand-white.png" : "/assets/loondry-logo-brand-colored.png")
            } 
            alt="Loondry Logo" 
            className={isSidebarCollapsed ? "h-8 w-8 object-contain" : "h-10 object-contain"}
          />
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          <button
            onClick={() => handleTabChange('dashboard')}
            className={`w-full flex items-center rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
              isSidebarCollapsed ? 'justify-center p-2.5' : 'space-x-3 px-3 py-2.5'
            } ${
              activeTab === 'dashboard'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-accent hover:text-accent-foreground text-muted-foreground'
            }`}
            title={isSidebarCollapsed ? "Dashboard" : undefined}
          >
            <LayoutDashboard className="h-4.5 w-4.5 shrink-0" />
            {!isSidebarCollapsed && <span>Dashboard</span>}
          </button>

          <button
            onClick={() => handleTabChange('pos')}
            className={`w-full flex items-center rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
              isSidebarCollapsed ? 'justify-center p-2.5' : 'space-x-3 px-3 py-2.5'
            } ${
              activeTab === 'pos'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-accent hover:text-accent-foreground text-muted-foreground'
            }`}
            title={isSidebarCollapsed ? "Transactions" : undefined}
          >
            <ShoppingBag className="h-4.5 w-4.5 shrink-0" />
            {!isSidebarCollapsed && <span>Transactions</span>}
          </button>

          <button
            onClick={() => handleTabChange('customers')}
            className={`w-full flex items-center rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
              isSidebarCollapsed ? 'justify-center p-2.5' : 'space-x-3 px-3 py-2.5'
            } ${
              activeTab === 'customers'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-accent hover:text-accent-foreground text-muted-foreground'
            }`}
            title={isSidebarCollapsed ? "Customers" : undefined}
          >
            <Users className="h-4.5 w-4.5 shrink-0" />
            {!isSidebarCollapsed && <span>Customers</span>}
          </button>

          <button
            onClick={() => handleTabChange('services')}
            className={`w-full flex items-center rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
              isSidebarCollapsed ? 'justify-center p-2.5' : 'space-x-3 px-3 py-2.5'
            } ${
              activeTab === 'services'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-accent hover:text-accent-foreground text-muted-foreground'
            }`}
            title={isSidebarCollapsed ? "Services" : undefined}
          >
            <Layers className="h-4.5 w-4.5 shrink-0" />
            {!isSidebarCollapsed && <span>Services</span>}
          </button>

          <button
            onClick={() => handleTabChange('vouchers')}
            className={`w-full flex items-center rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
              isSidebarCollapsed ? 'justify-center p-2.5' : 'space-x-3 px-3 py-2.5'
            } ${
              activeTab === 'vouchers'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-accent hover:text-accent-foreground text-muted-foreground'
            }`}
            title={isSidebarCollapsed ? "Vouchers" : undefined}
          >
            <Ticket className="h-4.5 w-4.5 shrink-0" />
            {!isSidebarCollapsed && <span>Vouchers</span>}
          </button>
        </nav>

        {/* Footer Area with profile & theme switch */}
        <div className="p-4 border-t border-border bg-muted/20">
          {isSidebarCollapsed ? (
            <div className="flex flex-col items-center space-y-4">
              {/* Profile Icon with tooltip info */}
              <div 
                className="bg-primary/10 rounded-full p-2 text-primary border border-primary/20 cursor-help"
                title={`${user?.name} (${user?.role})`}
              >
                <UserIcon className="h-4.5 w-4.5" />
              </div>
              
              {/* Theme Toggle Button */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-1.5 rounded-md border border-border bg-card text-foreground hover:bg-accent hover:text-accent-foreground transition-all cursor-pointer"
                title="Toggle Theme"
              >
                {isDarkMode ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
              </button>

              {/* Log Out Button */}
              <button
                onClick={handleLogout}
                className="p-1.5 border border-border bg-card text-destructive hover:bg-destructive/5 rounded-lg transition-colors cursor-pointer"
                title="Log Out"
              >
                <LogOut className="h-4.5 w-4.5" />
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="bg-primary/10 rounded-full p-1.5 text-primary border border-primary/20">
                    <UserIcon className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <span className="font-semibold text-xs text-foreground block max-w-36 truncate">{user?.name}</span>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block tracking-wider">{user?.role}</span>
                  </div>
                </div>
                
                {/* Theme Toggle Button */}
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="p-1.5 rounded-md border border-border bg-card text-foreground hover:bg-accent hover:text-accent-foreground transition-all cursor-pointer"
                  title="Toggle Theme"
                >
                  {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>
              </div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 px-3 py-2 border border-border bg-card text-destructive hover:bg-destructive/5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Panel */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto z-10">
        {/* Mobile Header */}
        <header className="md:hidden bg-card border-b border-border p-4 flex justify-between items-center shrink-0">
          <div className="flex items-center">
            <img 
              src={isDarkMode ? "/assets/loondry-logo-brand-white.png" : "/assets/loondry-logo-brand-colored.png"} 
              alt="Loondry Logo" 
              className="h-8 object-contain"
            />
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-1.5 rounded-md border border-border text-foreground hover:bg-accent cursor-pointer"
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-md border border-border text-destructive hover:bg-destructive/5 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Mobile Nav Tabs */}
        <nav className="md:hidden bg-card border-b border-border px-1 py-1 flex space-x-0.5 justify-around text-[10px] shrink-0 overflow-x-auto">
          <button
            onClick={() => handleTabChange('dashboard')}
            className={`flex flex-col items-center py-1.5 px-2.5 rounded-lg font-medium cursor-pointer shrink-0 ${
              activeTab === 'dashboard' ? 'text-primary bg-primary/5 font-bold' : 'text-muted-foreground'
            }`}
          >
            <LayoutDashboard className="h-4 w-4 mb-0.5" />
            Dashboard
          </button>
          <button
            onClick={() => handleTabChange('pos')}
            className={`flex flex-col items-center py-1.5 px-2.5 rounded-lg font-medium cursor-pointer shrink-0 ${
              activeTab === 'pos' ? 'text-primary bg-primary/5 font-bold' : 'text-muted-foreground'
            }`}
          >
            <ShoppingBag className="h-4 w-4 mb-0.5" />
            Orders
          </button>
          <button
            onClick={() => handleTabChange('customers')}
            className={`flex flex-col items-center py-1.5 px-2.5 rounded-lg font-medium cursor-pointer shrink-0 ${
              activeTab === 'customers' ? 'text-primary bg-primary/5 font-bold' : 'text-muted-foreground'
            }`}
          >
            <Users className="h-4 w-4 mb-0.5" />
            Customers
          </button>
          <button
            onClick={() => handleTabChange('services')}
            className={`flex flex-col items-center py-1.5 px-2.5 rounded-lg font-medium cursor-pointer shrink-0 ${
              activeTab === 'services' ? 'text-primary bg-primary/5 font-bold' : 'text-muted-foreground'
            }`}
          >
            <Layers className="h-4 w-4 mb-0.5" />
            Services
          </button>
          <button
            onClick={() => handleTabChange('vouchers')}
            className={`flex flex-col items-center py-1.5 px-2.5 rounded-lg font-medium cursor-pointer shrink-0 ${
              activeTab === 'vouchers' ? 'text-primary bg-primary/5 font-bold' : 'text-muted-foreground'
            }`}
          >
            <Ticket className="h-4 w-4 mb-0.5" />
            Vouchers
          </button>
        </nav>

        {/* Content Area */}
        <main className="flex-1 p-6 md:p-8" key={refreshTrigger}>
          {renderTabContent()}
        </main>
      </div>

      {/* Secondary Dynamic Slide-over Sidebar (Drawer from Right) */}
      <SlideOver
        isOpen={slideOverType !== null}
        onClose={() => {
          setSlideOverType(null);
          setActiveItem(null);
        }}
        title={getSlideOverTitle()}
      >
        {slideOverType === 'create-order' && (
          <TransactionForm
            onSubmitSuccess={handleFormSubmitSuccess}
            onCancel={() => setSlideOverType(null)}
            onOpenCreateCustomer={() => setSlideOverType('create-customer')}
          />
        )}

        {slideOverType === 'create-customer' && (
          <CustomerForm
            onSubmitSuccess={handleFormSubmitSuccess}
            onCancel={() => setSlideOverType(null)}
          />
        )}

        {slideOverType === 'edit-customer' && (
          <CustomerForm
            customer={activeItem}
            onSubmitSuccess={handleFormSubmitSuccess}
            onCancel={() => {
              setSlideOverType(null);
              setActiveItem(null);
            }}
          />
        )}

        {slideOverType === 'create-service' && (
          <ServiceForm
            onSubmitSuccess={handleFormSubmitSuccess}
            onCancel={() => setSlideOverType(null)}
          />
        )}

        {slideOverType === 'edit-service' && (
          <ServiceForm
            service={activeItem}
            onSubmitSuccess={handleFormSubmitSuccess}
            onCancel={() => {
              setSlideOverType(null);
              setActiveItem(null);
            }}
          />
        )}

        {slideOverType === 'create-voucher' && (
          <VoucherForm
            onSubmitSuccess={handleFormSubmitSuccess}
            onCancel={() => setSlideOverType(null)}
          />
        )}

        {slideOverType === 'edit-voucher' && (
          <VoucherForm
            voucher={activeItem}
            onSubmitSuccess={handleFormSubmitSuccess}
            onCancel={() => {
              setSlideOverType(null);
              setActiveItem(null);
            }}
          />
        )}

        {slideOverType === 'redeem-voucher' && (
          <RedeemVoucherForm
            customer={activeItem}
            onSubmitSuccess={handleFormSubmitSuccess}
            onCancel={() => {
              setSlideOverType(null);
              setActiveItem(null);
            }}
          />
        )}

        {slideOverType === 'apply-voucher' && (
          <ApplyVoucherForm
            transaction={activeItem}
            onSubmitSuccess={handleFormSubmitSuccess}
            onCancel={() => {
              setSlideOverType(null);
              setActiveItem(null);
            }}
          />
        )}

        {slideOverType === 'payment-proof' && (
          <PaymentProofForm
            transaction={activeItem}
            onSubmitSuccess={handleFormSubmitSuccess}
            onCancel={() => {
              setSlideOverType(null);
              setActiveItem(null);
            }}
          />
        )}

        {slideOverType === 'shortcuts-info' && (
          <div className="space-y-5 text-sm text-foreground">
            <p className="text-muted-foreground leading-relaxed">
              Use these global keyboard shortcuts to navigate and manage tasks faster.
            </p>
            <div className="divide-y divide-border border border-border rounded-xl overflow-hidden bg-muted/30">
              <div className="flex justify-between p-3.5 items-center">
                <span className="font-semibold text-xs tracking-wide uppercase text-muted-foreground">Action</span>
                <span className="font-semibold text-xs tracking-wide uppercase text-muted-foreground">Shortcut</span>
              </div>
              <div className="flex justify-between p-3.5">
                <span className="font-medium text-foreground/90">New Laundry Order</span>
                <kbd className="px-2 py-1 bg-background border border-border rounded-lg text-xs font-mono font-bold shadow-xs">F2 / Alt + N</kbd>
              </div>
              <div className="flex justify-between p-3.5">
                <span className="font-medium text-foreground/90">Register New Customer</span>
                <kbd className="px-2 py-1 bg-background border border-border rounded-lg text-xs font-mono font-bold shadow-xs">F3 / Alt + C</kbd>
              </div>
              <div className="flex justify-between p-3.5">
                <span className="font-medium text-foreground/90">Focus Search Input</span>
                <kbd className="px-2 py-1 bg-background border border-border rounded-lg text-xs font-mono font-bold shadow-xs">/</kbd>
              </div>
              <div className="flex justify-between p-3.5">
                <span className="font-medium text-foreground/90">Switch to Dashboard</span>
                <kbd className="px-2 py-1 bg-background border border-border rounded-lg text-xs font-mono font-bold shadow-xs">Alt + 1</kbd>
              </div>
              <div className="flex justify-between p-3.5">
                <span className="font-medium text-foreground/90">Switch to Transactions</span>
                <kbd className="px-2 py-1 bg-background border border-border rounded-lg text-xs font-mono font-bold shadow-xs">Alt + 2</kbd>
              </div>
              <div className="flex justify-between p-3.5">
                <span className="font-medium text-foreground/90">Switch to Customers</span>
                <kbd className="px-2 py-1 bg-background border border-border rounded-lg text-xs font-mono font-bold shadow-xs">Alt + 3</kbd>
              </div>
              <div className="flex justify-between p-3.5">
                <span className="font-medium text-foreground/90">Switch to Services</span>
                <kbd className="px-2 py-1 bg-background border border-border rounded-lg text-xs font-mono font-bold shadow-xs">Alt + 4</kbd>
              </div>
              <div className="flex justify-between p-3.5">
                <span className="font-medium text-foreground/90">Switch to Vouchers</span>
                <kbd className="px-2 py-1 bg-background border border-border rounded-lg text-xs font-mono font-bold shadow-xs">Alt + 5</kbd>
              </div>
              <div className="flex justify-between p-3.5">
                <span className="font-medium text-foreground/90">Submit Active Form</span>
                <kbd className="px-2 py-1 bg-background border border-border rounded-lg text-xs font-mono font-bold shadow-xs">Ctrl + Enter</kbd>
              </div>
              <div className="flex justify-between p-3.5">
                <span className="font-medium text-foreground/90">Close Active Drawer</span>
                <kbd className="px-2 py-1 bg-background border border-border rounded-lg text-xs font-mono font-bold shadow-xs">Esc</kbd>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSlideOverType(null)}
              className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 py-2 px-4 rounded-lg font-semibold text-sm transition-colors mt-6 cursor-pointer text-center"
            >
              Close
            </button>
          </div>
        )}
      </SlideOver>
    </div>
  );
}
