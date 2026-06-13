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
            throw new \Exception('Voucher tidak ditemukan atau sudah digunakan.');
        }

        if ($redemption->user_id !== $customer->user_id) {
            throw new \Exception('Voucher ini milik customer lain.');
        }

        if ($redemption->expires_at && now()->gt($redemption->expires_at)) {
            throw new \Exception('Voucher sudah kedaluwarsa (masa aktif 3 hari habis).');
        }

        $discount = 0;
        if ($redemption->voucher) {
            $voucher = $redemption->voucher;
            $today = now()->startOfDay();

            if ($voucher->start_date && $today->lt($voucher->start_date)) {
                throw new \Exception('Voucher belum dapat digunakan.');
            }
            if ($voucher->end_date && $today->gt($voucher->end_date)) {
                throw new \Exception('Voucher sudah kedaluwarsa.');
            }

            if ($voucher->min_transaction && $totalPrice < $voucher->min_transaction) {
                throw new \Exception('Minimal transaksi untuk voucher ini adalah Rp ' . number_format($voucher->min_transaction, 0, ',', '.'));
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
