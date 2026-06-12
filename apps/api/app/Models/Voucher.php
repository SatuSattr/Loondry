<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'code',
    'name',
    'description',
    'discount_type',
    'discount_value',
    'max_discount',
    'min_transaction',
    'points_cost',
    'start_date',
    'end_date',
    'status'
])]
class Voucher extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'discount_value' => 'float',
            'max_discount' => 'float',
            'min_transaction' => 'float',
            'points_cost' => 'integer',
            'start_date' => 'date',
            'end_date' => 'date',
        ];
    }

    public function redemptions(): HasMany
    {
        return $this->hasMany(PointsRedemption::class);
    }
}
