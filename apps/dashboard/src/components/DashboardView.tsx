import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Users,
  ShoppingBag,
  Award,
  Tag,
  Ticket,
  ArrowUpRight,
  PlusCircle,
  RefreshCw,
  Loader2,
  ChevronDown,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { type DateRange } from 'react-day-picker';
import StatisticsCard from './shadcn-studio/blocks/statistics-with-status';

interface DashboardViewProps {
  onOpenCreateOrder: () => void;
  onOpenCreateCustomer: () => void;
}

export function DashboardView({ onOpenCreateOrder, onOpenCreateCustomer }: DashboardViewProps) {
  const [revenueRange, setRevenueRange] = useState('all');
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [revenueLoading, setRevenueLoading] = useState(false);
  const [error, setError] = useState('');
  const [isInitialMount, setIsInitialMount] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const rangeLabels: Record<string, string> = {
    all: 'All Time',
    today: 'Today',
    '7days': 'Last 7 Days',
    month: 'This Month',
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return undefined;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const loadDashboardData = async (rangeVal = 'all', isSilent = false, start?: string, end?: string) => {
    if (isSilent) {
      setRevenueLoading(true);
    } else {
      setLoading(true);
    }
    setError('');
    try {
      const res = await api.getDashboard(rangeVal, start, end);
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRevenueLoading(false);
    }
  };

  useEffect(() => {
    const start = dateRange?.from ? formatDate(dateRange.from) : undefined;
    const end = dateRange?.to ? formatDate(dateRange.to) : undefined;
    
    if (isInitialMount) {
      loadDashboardData(revenueRange, false, start, end);
      setIsInitialMount(false);
    } else {
      loadDashboardData(revenueRange, true, start, end);
    }
  }, [revenueRange]);

  useEffect(() => {
    if (isInitialMount) return;
    
    const start = dateRange?.from ? formatDate(dateRange.from) : undefined;
    const end = dateRange?.to ? formatDate(dateRange.to) : undefined;
    
    if (!dateRange || (dateRange.from && dateRange.to) || (!dateRange.from && !dateRange.to)) {
      loadDashboardData(revenueRange, true, start, end);
    }
  }, [dateRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-60">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-lg p-4 font-medium flex items-center justify-between">
        <span>{error}</span>
        <button
          onClick={() => {
            const start = dateRange?.from ? formatDate(dateRange.from) : undefined;
            const end = dateRange?.to ? formatDate(dateRange.to) : undefined;
            loadDashboardData(revenueRange, false, start, end);
          }}
          className="bg-destructive/20 hover:bg-destructive/35 px-3 py-1 rounded text-xs transition-colors cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  const { summary, points_summary, recent_transactions, daily_stats } = data || {};

  // Formatter for Currency
  const formatCurrency = (val: number) => {
    return 'Rp ' + (val || 0).toLocaleString();
  };

  // Prepare chart data (default reverse so it displays left to right chronologically)
  const chartData = daily_stats ? [...daily_stats].reverse() : [];

  return (
    <div className="space-y-6">
      {/* Welcome / Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">POS Dashboard</h1>
          <p className="text-sm text-muted-foreground">Manage laundry operations and customer points in real-time.</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              const start = dateRange?.from ? formatDate(dateRange.from) : undefined;
              const end = dateRange?.to ? formatDate(dateRange.to) : undefined;
              loadDashboardData(revenueRange, false, start, end);
            }}
            className="p-2 border border-border bg-background hover:bg-accent rounded-lg text-foreground transition-all cursor-pointer"
            title="Refresh statistics"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={onOpenCreateOrder}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium text-sm flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" />
            <span>New Order</span>
          </button>
        </div>
      </div>

      {/* Main Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Revenue */}
        <StatisticsCard
          title="Total Revenue"
          value={formatCurrency(summary?.total_revenue)}
          status="within"
          range={rangeLabels[revenueRange]}
          action={
            <div className="relative inline-block">
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={revenueLoading}
                      className="h-7 text-[10px] font-bold text-foreground px-2 cursor-pointer border-border bg-background hover:bg-accent flex items-center"
                    >
                      {revenueLoading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1 text-foreground" />
                      ) : (
                        <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                      )}
                      <span>{rangeLabels[revenueRange]}</span>
                      <ChevronDown className="h-3 w-3 ml-1 text-muted-foreground" />
                    </Button>
                  }
                />
                  <DropdownMenuContent align="end" className="w-36 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden py-1">
                    {Object.entries(rangeLabels).map(([key, val]) => (
                      <DropdownMenuItem
                        key={key}
                        onClick={() => setRevenueRange(key)}
                        className={`w-full text-left px-3 py-1.5 text-xs transition-colors hover:bg-accent/80 cursor-pointer ${
                          revenueRange === key
                            ? 'bg-primary/10 text-primary font-semibold'
                            : 'text-foreground'
                        }`}
                      >
                        {val}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
            </div>
          }
        />

        {/* Active Orders */}
        <StatisticsCard
          title="Active Orders"
          value={`${summary?.active_orders || 0} Orders`}
          status="observe"
          range="In Queue & Washing"
        />

        {/* Total Customers */}
        <StatisticsCard
          title="Total Customers"
          value={`${summary?.total_customers || 0} Customers`}
          status="unknown"
          range="Registered Customers"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Area Chart */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-xs lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="font-semibold text-foreground tracking-tight">Revenue Trend</h3>
              <p className="text-xs text-muted-foreground">
                {dateRange?.from && dateRange?.to
                  ? `Paid revenue from ${dateRange.from.toLocaleDateString()} to ${dateRange.to.toLocaleDateString()}`
                  : 'Paid revenue over the last 7 active days.'}
              </p>
            </div>
            
            {/* Date Range Picker */}
            <div className="flex items-center space-x-2 w-full sm:w-auto shrink-0">
              <div className="relative inline-block w-full sm:w-auto">
                <Popover modal={false}>
                  <PopoverTrigger
                    render={
                      <Button
                        variant="outline"
                        className="text-xs font-normal border-border bg-background hover:bg-accent text-foreground cursor-pointer justify-between w-full sm:w-56"
                      >
                        <div className="flex items-center">
                          <CalendarIcon className="h-3.5 w-3.5 mr-1.5 opacity-70" />
                          <span>
                            {dateRange?.from && dateRange?.to
                              ? `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`
                              : 'Pick custom date range...'}
                          </span>
                        </div>
                        <ChevronDown className="h-3 w-3 opacity-50 ml-1.5" />
                      </Button>
                    }
                  />
                  <PopoverContent className="w-auto p-0 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden" align="end">
                    <Calendar
                      mode="range"
                      selected={dateRange}
                      onSelect={setDateRange}
                      className="bg-card text-foreground"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              {dateRange && (
                <Button
                  variant="ghost"
                  onClick={() => setDateRange(undefined)}
                  className="px-2 text-xs text-muted-foreground hover:text-destructive cursor-pointer"
                  title="Clear date filter"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
          <div className="h-64 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="date" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `Rp${v/1000}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', borderRadius: '8px' }}
                    labelStyle={{ fontWeight: 'bold', color: 'var(--color-foreground)' }}
                    formatter={(value: any) => [formatCurrency(Number(value)), 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                No revenue stats available.
              </div>
            )}
          </div>
        </div>

        {/* Loyalty Points Panel */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-foreground tracking-tight">Loyalty Points System</h3>
              <p className="text-xs text-muted-foreground">Track engagement and voucher redemptions.</p>
            </div>
            
            <div className="space-y-4 pt-2">
              {/* Points Earned */}
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center space-x-2.5">
                  <Award className="h-5 w-5 text-emerald-500" />
                  <div>
                    <span className="text-xs text-muted-foreground block">Points Earned</span>
                    <span className="text-sm font-bold text-foreground">{points_summary?.total_points_earned || 0} pts</span>
                  </div>
                </div>
              </div>
              {/* Points Redeemed */}
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center space-x-2.5">
                  <Tag className="h-5 w-5 text-amber-500" />
                  <div>
                    <span className="text-xs text-muted-foreground block">Points Redeemed</span>
                    <span className="text-sm font-bold text-foreground">{points_summary?.total_points_redeemed || 0} pts</span>
                  </div>
                </div>
              </div>
              {/* Vouchers Issued */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <Ticket className="h-5 w-5 text-purple-500" />
                  <div>
                    <span className="text-xs text-muted-foreground block">Vouchers Created</span>
                    <span className="text-sm font-bold text-foreground">
                      {points_summary?.total_vouchers_issued || 0} ({points_summary?.total_vouchers_used || 0} used)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-muted border border-border p-3.5 rounded-lg text-xs mt-4">
            <span className="font-semibold text-foreground block mb-0.5">Quick Guide:</span>
            Customers earn 1 pt per Rp 1.000 spent. Points can be redeemed for discounts (1 pt = Rp 0.01 / 100 pt = Rp 1).
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Orders & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Table */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-xs lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-foreground tracking-tight">Recent Orders</h3>
              <p className="text-xs text-muted-foreground">The 5 latest laundry transactions.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider">
                  <th className="py-2.5">Invoice</th>
                  <th className="py-2.5">Customer</th>
                  <th className="py-2.5">Service</th>
                  <th className="py-2.5">Status</th>
                  <th className="py-2.5 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recent_transactions && recent_transactions.length > 0 ? (
                  recent_transactions.map((tx: any) => (
                    <tr key={tx.id} className="hover:bg-accent/40 text-foreground transition-all">
                      <td className="py-3 font-mono font-medium">{tx.invoice_code}</td>
                      <td className="py-3 font-medium">{tx.customer?.user?.name || 'N/A'}</td>
                      <td className="py-3">{tx.service?.service_name}</td>
                      <td className="py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                          tx.status === 'siap diambil' || tx.status === 'diambil'
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : tx.status === 'antrian'
                            ? 'bg-amber-500/10 text-amber-500'
                            : 'bg-blue-500/10 text-blue-500'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3 text-right font-semibold">
                        Rp {(Number(tx.total_price) - Number(tx.discount || 0)).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-xs text-muted-foreground">
                      No recent transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Operations panel */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-4">
          <div>
            <h3 className="font-semibold text-foreground tracking-tight">Quick Operations</h3>
            <p className="text-xs text-muted-foreground">High-frequency actions for POS operators.</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={onOpenCreateOrder}
              className="w-full flex items-center justify-between p-4 border border-border hover:border-primary/50 hover:bg-accent/50 rounded-xl transition-all text-left cursor-pointer group"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-primary text-primary-foreground rounded-lg p-2 group-hover:scale-105 transition-transform">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-semibold text-sm text-foreground block">New Laundry Order</span>
                  <span className="text-xs text-muted-foreground">Process incoming clothes</span>
                </div>
              </div>
              <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>

            <button
              onClick={onOpenCreateCustomer}
              className="w-full flex items-center justify-between p-4 border border-border hover:border-primary/50 hover:bg-accent/50 rounded-xl transition-all text-left cursor-pointer group"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-purple-500 text-white rounded-lg p-2 group-hover:scale-105 transition-transform">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-semibold text-sm text-foreground block">Register Customer</span>
                  <span className="text-xs text-muted-foreground">Create account & generate credentials</span>
                </div>
              </div>
              <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
