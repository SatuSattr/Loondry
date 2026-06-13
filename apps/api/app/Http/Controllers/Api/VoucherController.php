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
            'max_uses_per_user' => ['nullable', 'integer', 'min:1'],
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
            'max_uses_per_user' => ['nullable', 'integer', 'min:1'],
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
        $targetUser = $operator;

        // If customer_id is provided, redeem on behalf of that customer
        if ($request->filled('customer_id') && in_array($operator->role, ['admin', 'operator'])) {
            $customer = \App\Models\Customer::with('user')->findOrFail($request->customer_id);
            $targetUser = $customer->user;
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

        // Validate maximum usage limit per user
        if ($voucher->max_uses_per_user && $voucher->max_uses_per_user > 0) {
            $userRedemptionsCount = PointsRedemption::where('user_id', $targetUser->id)
                ->where('voucher_id', $voucher->id)
                ->count();
            if ($userRedemptionsCount >= $voucher->max_uses_per_user) {
                return response()->json(['message' => 'You have reached the maximum redemption limit for this voucher.'], 400);
            }
        }

        $voucherCode = strtoupper($voucher->code . '-' . $targetUser->id . '-' . Str::random(6));

        try {
            $redemption = DB::transaction(function () use ($targetUser, $voucher, $voucherCode) {
                // Lock the user row for update to prevent concurrent modification
                $lockedUser = \App\Models\User::where('id', $targetUser->id)->lockForUpdate()->firstOrFail();

                if ($lockedUser->points < $voucher->points_cost) {
                    throw new \Exception('Points insufficient');
                }

                $lockedUser->decrement('points', $voucher->points_cost);

                return PointsRedemption::create([
                    'user_id' => $lockedUser->id,
                    'voucher_id' => $voucher->id,
                    'voucher_code' => $voucherCode,
                    'points_spent' => $voucher->points_cost,
                    'discount_value' => $voucher->discount_value,
                    'is_used' => false,
                    'expires_at' => now()->addDays(3),
                ]);
            });
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }

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
        $userId = $request->user()->id;
        if ($request->user()->role === 'admin' && $request->filled('user_id')) {
            $userId = $request->user_id;
        }

        $vouchers = PointsRedemption::with('voucher')
            ->where('user_id', $userId)
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
        $user = $request->user();
        if ($user->role !== 'admin') {
            $customer = $user->customer;
            if (!$customer || $transaction->customer_id !== $customer->id) {
                return response()->json(['message' => 'Unauthorized access to transaction.'], 403);
            }
        }

        $request->validate([
            'voucher_code' => ['required', 'string'],
        ]);

        try {
            $result = PointsRedemption::validateAndCalculateDiscount(
                $request->voucher_code,
                $transaction->total_price,
                $transaction->customer_id
            );

            $redemption = $result['redemption'];
            $discount = $result['discount'];

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
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    /**
     * Check voucher code validity and return discount value.
     */
    public function checkVoucherCode(Request $request, string $voucherCode)
    {
        $request->validate([
            'total_price' => ['required', 'numeric', 'min:0'],
            'customer_id' => ['required', 'integer', 'exists:customers,id'],
        ]);

        try {
            $result = PointsRedemption::validateAndCalculateDiscount(
                $voucherCode,
                $request->total_price,
                $request->customer_id
            );

            return response()->json([
                'valid' => true,
                'discount' => $result['discount'],
                'voucher_code' => $result['redemption']->voucher_code,
                'name' => $result['redemption']->voucher ? $result['redemption']->voucher->name : 'Point Redemption Discount',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'valid' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}
