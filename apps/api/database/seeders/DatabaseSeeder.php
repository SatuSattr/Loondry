<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Service;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Admin User
        User::create([
            'name' => 'Admin Loondry',
            'email' => 'admin@loondry.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        // Services according to the brief
        Service::create([
            'service_name' => 'Cuci Kering Setrika',
            'price' => 8000,
            'unit' => 'Kg',
            'status' => 'active',
        ]);

        Service::create([
            'service_name' => 'Cuci Kering Express',
            'price' => 12000,
            'unit' => 'Kg',
            'status' => 'active',
        ]);

        Service::create([
            'service_name' => 'Jas / Blazer',
            'price' => 25000,
            'unit' => 'Pcs',
            'status' => 'active',
        ]);

        Service::create([
            'service_name' => 'Selimut Besar',
            'price' => 35000,
            'unit' => 'Pcs',
            'status' => 'active',
        ]);
    }
}
