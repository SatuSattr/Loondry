<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->integer('points_earned')->default(0);
            $table->string('voucher_code', 50)->nullable();
            $table->decimal('discount', 12, 2)->default(0);
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn(['points_earned', 'voucher_code', 'discount']);
        });
    }
};
