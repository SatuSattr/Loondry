<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vouchers', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('discount_type'); // 'percentage', 'flat'
            $table->decimal('discount_value', 12, 2);
            $table->decimal('max_discount', 12, 2)->nullable();
            $table->decimal('min_transaction', 12, 2)->nullable();
            $table->integer('points_cost')->default(0);
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->string('status')->default('active'); // 'active', 'inactive'
            $table->timestamps();
        });

        Schema::table('points_redemptions', function (Blueprint $table) {
            $table->foreignId('voucher_id')->nullable()->constrained('vouchers')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('points_redemptions', function (Blueprint $table) {
            $table->dropForeign(['voucher_id']);
            $table->dropColumn('voucher_id');
        });

        Schema::dropIfExists('vouchers');
    }
};
