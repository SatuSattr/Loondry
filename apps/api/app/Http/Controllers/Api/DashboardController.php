<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\PointsRedemption;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Get dashboard analytics summary.
     */
    public function index(Request $request)
    {
        $revenueQuery = Transaction::where('payment_status', 'paid');
        
        $range = $request->query('revenue_range', 'all');
        if ($range === 'today') {
            $revenueQuery->whereDate('created_at', now()->toDateString());
        } elseif ($range === '7days') {
            $revenueQuery->where('created_at', '>=', now()->subDays(7));
        } elseif ($range === 'month') {
            $revenueQuery->whereMonth('created_at', now()->month)
                         ->whereYear('created_at', now()->year);
        }

        $totalRevenue = $revenueQuery->sum('total_price');
        $activeOrders = Transaction::whereNotIn('status', ['diambil'])->count();
        $totalCustomers = Customer::count();
        
        $transactionsQuery = Transaction::query();
        $txRange = $request->query('transactions_range', 'all');
        if ($txRange === 'today') {
            $transactionsQuery->whereDate('created_at', now()->toDateString());
        } elseif ($txRange === '7days') {
            $transactionsQuery->where('created_at', '>=', now()->subDays(7));
        } elseif ($txRange === 'month') {
            $transactionsQuery->whereMonth('created_at', now()->month)
                              ->whereYear('created_at', now()->year);
        }
        $totalLaundryMasuk = $transactionsQuery->count();
        
        $recentTransactions = Transaction::with(['customer.user', 'service'])
            ->latest()
            ->limit(5)
            ->get();

        $chartQuery = Transaction::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('count(*) as count'),
            DB::raw('sum(total_price) as revenue')
        )
            ->where('payment_status', 'paid')
            ->groupBy('date')
            ->orderBy('date', 'desc');

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $chartQuery->whereDate('created_at', '>=', $request->query('start_date'))
                       ->whereDate('created_at', '<=', $request->query('end_date'));
            $dailyStats = $chartQuery->get();
        } else {
            $dailyStats = $chartQuery->limit(7)->get();
        }

        $totalPointsEarned = Transaction::where('payment_status', 'paid')->sum('points_earned');
        $totalPointsRedeemed = PointsRedemption::sum('points_spent');
        $totalVouchersIssued = PointsRedemption::count();
        $totalVouchersUsed = PointsRedemption::where('is_used', true)->count();

        return response()->json([
            'summary' => [
                'total_revenue' => (float) $totalRevenue,
                'active_orders' => (int) $activeOrders,
                'total_customers' => (int) $totalCustomers,
                'total_laundry_masuk' => (int) $totalLaundryMasuk,
            ],
            'points_summary' => [
                'total_points_earned' => (float) $totalPointsEarned,
                'total_points_redeemed' => (float) $totalPointsRedeemed,
                'total_vouchers_issued' => (int) $totalVouchersIssued,
                'total_vouchers_used' => (int) $totalVouchersUsed,
            ],
            'recent_transactions' => $recentTransactions,
            'daily_stats' => $dailyStats,
        ]);
    }
}
