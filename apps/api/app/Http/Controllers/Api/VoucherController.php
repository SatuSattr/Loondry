<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PointsRedemption;
use App\Models\Transaction;
use App\Models\Voucher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class VoucherController extends Controller
{
    /**
     * List all vouchers (Admin CRUD & User list).
     */
    public function index(Request $request)
    {
        $query = Voucher::query();
        if ($request->has('status')) {
            $query->where('status', $request->query('status'));
        }
        
        $vouchers = $query->latest()->get();
        return response()->json(['data' => $vouchers]);
    }

    /**
     * Create a new voucher template.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'unique:vouchers,code'],
            'name' => ['required', 'string'],
            'description' => ['nullable', 'string'],
            'discount_type' => ['required', 'string', 'in:percentage,flat'],
            'discount_value' => ['required', 'numeric', 'min:0'],
            'max_discount' => ['nullable', 'numeric', 'min:0'],
            'min_transaction' => ['nullable', 'numeric', 'min:0'],
            'points_cost' => ['required', 'integer', 'min:0'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'status' => ['nullable', 'string', 'in:active,inactive'],
        ]);

        $voucher = Voucher::create($validated);

        return response()->json([
            'message' => 'Voucher template created successfully',
            'data' => $voucher
        ], 201);
    }

    /**
     * Show single voucher.
     */
    public function show(Voucher $voucher)
    {
        return response()->json(['data' => $voucher]);
    }

    /**
     * Update a voucher template.
     */
    public function update(Request $request, Voucher $voucher)
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'unique:vouchers,code,' . $voucher->id],
            'name' => ['required', 'string'],
            'description' => ['nullable', 'string'],
            'discount_type' => ['required', 'string', 'in:percentage,flat'],
            'discount_value' => ['required', 'numeric', 'min:0'],
            'max_discount' => ['nullable', 'numeric', 'min:0'],
            'min_transaction' => ['nullable', 'numeric', 'min:0'],
            'points_cost' => ['required', 'integer', 'min:0'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'status' => ['nullable', 'string', 'in:active,inactive'],
        ]);

        $voucher->update($validated);

        return response()->json([
            'message' => 'Voucher template updated successfully',
            'data' => $voucher
        ]);
    }

    /**
     * Delete a voucher template.
     */
    public function destroy(Voucher $voucher)
    {
        $voucher->delete();
        return response()->json(['message' => 'Voucher template deleted successfully']);
    }

    /**
     * Get points balance and redemptions history.
     */
    public function pointsBalance(Request $request)
    {
        $user = $request->user();
        $redemptions = PointsRedemption::with('voucher')
            ->where('user_id', $user->id)
            ->latest()
            ->get();

        return response()->json([
            'points' => $user->points,
            'redemption_history' => $redemptions,
        ]);
    }

    /**
     * Redeem a specific voucher template with points.
     */
    public function redeem(Request $request)
    {
        $request->validate([
            'voucher_id' => ['required', 'integer', 'exists:vouchers,id'],
            'customer_id' => ['nullable', 'integer', 'exists:customers,id'],
        ]);

        $operator = $request->user();
        $user = $operator;

        // If customer_id is provided, redeem on behalf of that customer
        if ($request->filled('customer_id') && in_array($operator->role, ['admin', 'operator'])) {
            $customer = \App\Models\Customer::with('user')->findOrFail($request->customer_id);
            $user = $customer->user;
        }

        $voucher = Voucher::findOrFail($request->voucher_id);

        if ($voucher->status !== 'active') {
            return response()->json(['message' => 'Voucher is not active'], 400);
        }

        // Validate date validity
        $today = now()->startOfDay();
        if ($voucher->start_date && $today->lt($voucher->start_date)) {
            return response()->json(['message' => 'Voucher period has not started yet'], 400);
        }
        if ($voucher->end_date && $today->gt($voucher->end_date)) {
            return response()->json(['message' => 'Voucher period has expired'], 400);
        }

        if ($user->points < $voucher->points_cost) {
            return response()->json(['message' => 'Points insufficient'], 400);
        }

        $voucherCode = strtoupper($voucher->code . '-' . Str::random(6));

        $redemption = DB::transaction(function () use ($user, $voucher, $voucherCode) {
            $user->decrement('points', $voucher->points_cost);

            return PointsRedemption::create([
                'user_id' => $user->id,
                'voucher_id' => $voucher->id,
                'voucher_code' => $voucherCode,
                'points_spent' => $voucher->points_cost,
                'discount_value' => $voucher->discount_value, // basic reference
                'is_used' => false,
            ]);
        });

        return response()->json([
            'message' => 'Voucher redeemed successfully',
            'data' => $redemption->load('voucher'),
        ], 201);
    }

    /**
     * Get un-used vouchers redeemed by user.
     */
    public function myVouchers(Request $request)
    {
        $vouchers = PointsRedemption::with('voucher')
            ->where('user_id', $request->user()->id)
            ->where('is_used', false)
            ->latest()
            ->get();

        return response()->json(['data' => $vouchers]);
    }

    /**
     * Get all redeemed vouchers.
     */
    public function allVouchers()
    {
        $vouchers = PointsRedemption::with(['user', 'voucher'])->latest()->get();
        return response()->json(['data' => $vouchers]);
    }

    /**
     * Apply a redeemed voucher to a transaction.
     */
    public function applyVoucher(Request $request, Transaction $transaction)
    {
        $request->validate([
            'voucher_code' => ['required', 'string', 'exists:points_redemptions,voucher_code'],
        ]);

        $redemption = PointsRedemption::with('voucher')
            ->where('voucher_code', $request->voucher_code)
            ->where('is_used', false)
            ->first();

        if (!$redemption) {
            return response()->json(['message' => 'Voucher not found or already used'], 404);
        }

        if ($redemption->user_id !== $transaction->customer->user_id) {
            return response()->json(['message' => 'Voucher belongs to another customer'], 403);
        }

        // If it's linked to an admin voucher template, validate and calculate dynamically
        $discount = 0;
        if ($redemption->voucher) {
            $voucher = $redemption->voucher;
            $today = now()->startOfDay();

            // Validate date range
            if ($voucher->start_date && $today->lt($voucher->start_date)) {
                return response()->json(['message' => 'Voucher is not valid yet'], 400);
            }
            if ($voucher->end_date && $today->gt($voucher->end_date)) {
                return response()->json(['message' => 'Voucher has expired'], 400);
            }

            // Validate minimum transaction amount
            if ($voucher->min_transaction && $transaction->total_price < $voucher->min_transaction) {
                return response()->json([
                    'message' => 'Minimum transaction required to use this voucher is Rp ' . number_format($voucher->min_transaction)
                ], 400);
            }

            // Calculate discount
            if ($voucher->discount_type === 'percentage') {
                $discount = $transaction->total_price * ($voucher->discount_value / 100);
                if ($voucher->max_discount && $discount > $voucher->max_discount) {
                    $discount = $voucher->max_discount;
                }
            } else {
                $discount = $voucher->discount_value;
            }
        } else {
            // Old legacy code (direct points-to-cash redemption value)
            $discount = $redemption->discount_value;
        }

        // Cap discount at total price
        if ($discount > $transaction->total_price) {
            $discount = $transaction->total_price;
        }

        DB::transaction(function () use ($transaction, $redemption, $discount) {
            $transaction->update([
                'voucher_code' => $redemption->voucher_code,
                'discount' => $discount,
            ]);

            $redemption->update([
                'is_used' => true,
                'used_at' => now(),
            ]);
        });

        return response()->json([
            'message' => 'Voucher applied successfully',
            'data' => $transaction->fresh()->load(['customer.user', 'service']),
        ]);
    }
}
