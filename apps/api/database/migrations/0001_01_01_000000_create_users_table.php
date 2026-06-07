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
        Schema::create('users', function (Blueprint $table) {
            $table->id(); // BigInt (PK), Auto Increment
            $table->string('name'); // Varchar (255)
            $table->string('email')->unique(); // Varchar (255), Unique
            $table->string('password'); // Varchar (255)
            $table->enum('role', ['admin', 'customer'])->default('customer'); // Enum ('admin', 'customer')
            
            // Additional fields for "Skor 4" as per Rubrik VI.1.1
            $table->date('birth_date')->nullable(); // TTL
            $table->string('religion', 50)->nullable(); // Agama
            $table->enum('gender', ['L', 'P'])->nullable(); // Optional extra
            
            $table->timestamp('email_verified_at')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
