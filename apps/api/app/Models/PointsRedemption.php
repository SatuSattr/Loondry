<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'voucher_id', 'voucher_code', 'points_spent', 'discount_value', 'is_used', 'used_at', 'expires_at'])]
class PointsRedemption extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'is_used' => 'boolean',
            'used_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function voucher(): BelongsTo
    {
        return $this->belongsTo(Voucher::class);
    }

    /**
     * Validate a voucher code and calculate discount.
     *
     * @throws \Exception
     */
    public static function validateAndCalculateDiscount(string $voucherCode, float $totalPrice, int $customerId): array
    {
        $customer = \App\Models\Customer::findOrFail($customerId);

        $redemption = self::with('voucher')
            ->where('voucher_code', $voucherCode)
            ->where('is_used', false)
            ->first();

        if (!$redemption) {
            throw new \Exception('Voucher not found or already used.');
        }

        if ($redemption->user_id !== $customer->user_id) {
            throw new \Exception('This voucher belongs to another customer.');
        }

        if ($redemption->expires_at && now()->gt($redemption->expires_at)) {
            throw new \Exception('Voucher has expired (3-day validity period has passed).');
        }

        $discount = 0;
        if ($redemption->voucher) {
            $voucher = $redemption->voucher;
            $today = now()->startOfDay();

            if ($voucher->start_date && $today->lt($voucher->start_date)) {
                throw new \Exception('Voucher cannot be used yet.');
            }
            if ($voucher->end_date && $today->gt($voucher->end_date)) {
                throw new \Exception('Voucher has expired.');
            }

            if ($voucher->min_transaction && $totalPrice < $voucher->min_transaction) {
                throw new \Exception('The minimum transaction amount for this voucher is Rp ' . number_format($voucher->min_transaction, 0, ',', '.'));
            }

            if ($voucher->discount_type === 'percentage') {
                $discount = $totalPrice * ($voucher->discount_value / 100);
                if ($voucher->max_discount && $discount > $voucher->max_discount) {
                    $discount = $voucher->max_discount;
                }
            } else {
                $discount = $voucher->discount_value;
            }
        } else {
            $discount = $redemption->discount_value;
        }

        if ($discount > $totalPrice) {
            $discount = $totalPrice;
        }

        return [
            'redemption' => $redemption,
            'discount' => $discount,
        ];
    }
}
