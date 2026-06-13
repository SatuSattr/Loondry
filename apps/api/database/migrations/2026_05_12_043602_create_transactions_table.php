<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id(); // BigInt (PK), Auto Increment
            $table->string('invoice_code', 50)->unique(); // Varchar (50), Unique
            $table->foreignId('admin_id')->constrained('users')->onDelete('cascade'); // Relasi ke users.id (Role Admin)
            $table->foreignId('customer_id')->constrained('customers')->onDelete('cascade'); // Relasi ke customers.id
            $table->foreignId('service_id')->constrained('services')->onDelete('cascade'); // Relasi ke services.id
            $table->decimal('weight', 8, 2); // Required for calculation and Mobile detail
            $table->decimal('total_price', 12, 2); // Decimal (12,2)
            $table->enum('status', ['antrian', 'dicuci', 'disetrika', 'siap diambil', 'diambil'])->default('antrian'); // Enum
            $table->enum('payment_method', ['cash', 'transfer', 'qris']); // Enum
            $table->enum('payment_status', ['pending', 'paid'])->default('pending'); // Enum
            $table->string('payment_proof', 255)->nullable(); // Varchar (255)
            $table->timestamp('paid_at')->nullable(); // Timestamp
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
