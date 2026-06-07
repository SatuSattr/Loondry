<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE services MODIFY COLUMN unit VARCHAR(20) NOT NULL DEFAULT 'Kg'");
        } else {
            Schema::table('services', function (Blueprint $table) {
                $table->dropColumn('unit');
            });
            Schema::table('services', function (Blueprint $table) {
                $table->string('unit', 20)->default('Kg');
            });
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE services MODIFY COLUMN unit ENUM('kiloan','satuan') NOT NULL");
        }
    }
};
