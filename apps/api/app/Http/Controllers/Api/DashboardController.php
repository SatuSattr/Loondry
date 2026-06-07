<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Get dashboard analytics summary.
     */
    public function index()
    {
        $totalRevenue = Transaction::where('payment_status', 'paid')->sum('total_price');
        $activeOrders = Transaction::whereNotIn('status', ['diambil'])->count();
        $totalCustomers = Customer::count();
        
        $recentTransactions = Transaction::with(['customer.user', 'service'])
            ->latest()
            ->limit(5)
            ->get();

        $dailyStats = Transaction::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('count(*) as count'),
            DB::raw('sum(total_price) as revenue')
        )
            ->where('payment_status', 'paid')
            ->groupBy('date')
            ->orderBy('date', 'desc')
            ->limit(7)
            ->get();

        return response()->json([
            'summary' => [
                'total_revenue' => $totalRevenue,
                'active_orders' => $activeOrders,
                'total_customers' => $totalCustomers,
            ],
            'recent_transactions' => $recentTransactions,
            'daily_stats' => $dailyStats,
        ]);
    }
}
