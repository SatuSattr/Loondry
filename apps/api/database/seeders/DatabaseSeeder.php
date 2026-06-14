<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Customer;
use App\Models\Service;
use App\Models\Voucher;
use App\Models\Transaction;
use App\Models\TransactionLog;
use App\Models\PointsRedemption;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Carbon;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Clear existing data with foreign keys disabled
        DB::statement('PRAGMA foreign_keys = OFF;');
        DB::table('transaction_logs')->truncate();
        DB::table('transaction_images')->truncate();
        DB::table('transactions')->truncate();
        DB::table('points_redemptions')->truncate();
        DB::table('customers')->truncate();
        DB::table('vouchers')->truncate();
        DB::table('users')->truncate();
        DB::table('services')->truncate();
        DB::statement('PRAGMA foreign_keys = ON;');

        // 2. Seed Admin User
        $admin = User::create([
            'name' => 'Admin Loondry',
            'email' => 'admin@loondry.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        // 3. Seed Services according to the brief
        $services = [
            Service::create([
                'service_name' => 'Cuci Kering Setrika',
                'price' => 8000,
                'unit' => 'Kg',
                'status' => 'active',
            ]),
            Service::create([
                'service_name' => 'Cuci Kering Express',
                'price' => 12000,
                'unit' => 'Kg',
                'status' => 'active',
            ]),
            Service::create([
                'service_name' => 'Jas / Blazer',
                'price' => 25000,
                'unit' => 'Pcs',
                'status' => 'active',
            ]),
            Service::create([
                'service_name' => 'Selimut Besar',
                'price' => 35000,
                'unit' => 'Pcs',
                'status' => 'active',
            ]),
        ];

        // 4. Seed Voucher templates
        $vouchers = [
            Voucher::create([
                'code' => 'DISC10',
                'name' => 'Diskon 10% Hemat',
                'description' => 'Diskon 10% untuk semua jenis layanan laundry.',
                'discount_type' => 'percentage',
                'discount_value' => 10,
                'max_discount' => 10000,
                'min_transaction' => 20000,
                'points_cost' => 5,
                'max_uses_per_user' => 3,
                'start_date' => '2026-06-01',
                'end_date' => '2026-07-31',
                'status' => 'active',
            ]),
            Voucher::create([
                'code' => 'CUCIBERSIH',
                'name' => 'Potongan Rp 5.000',
                'description' => 'Potongan langsung Rp 5.000 dengan minimal transaksi Rp 15.000.',
                'discount_type' => 'flat',
                'discount_value' => 5000,
                'max_discount' => 5000,
                'min_transaction' => 15000,
                'points_cost' => 8,
                'max_uses_per_user' => 2,
                'start_date' => '2026-06-01',
                'end_date' => '2026-07-31',
                'status' => 'active',
            ]),
            Voucher::create([
                'code' => 'SULTANLAUNDRY',
                'name' => 'Potongan Rp 15.000',
                'description' => 'Potongan langsung Rp 15.000 khusus untuk Sultan Loondry!',
                'discount_type' => 'flat',
                'discount_value' => 15000,
                'max_discount' => 15000,
                'min_transaction' => 40000,
                'points_cost' => 20,
                'max_uses_per_user' => 1,
                'start_date' => '2026-06-01',
                'end_date' => '2026-07-31',
                'status' => 'active',
            ]),
            Voucher::create([
                'code' => 'EXPRESSHEBAT',
                'name' => 'Diskon 25% Express',
                'description' => 'Diskon 25% khusus layanan express, hemat hingga Rp 15.000.',
                'discount_type' => 'percentage',
                'discount_value' => 25,
                'max_discount' => 15000,
                'min_transaction' => 30000,
                'points_cost' => 12,
                'max_uses_per_user' => 2,
                'start_date' => '2026-06-01',
                'end_date' => '2026-07-31',
                'status' => 'active',
            ]),
        ];

        // 5. Seed Customer users & profiles
        $indonesianNames = [
            'Ahmad Hidayat', 'Siti Aminah', 'Budi Santoso', 'Dewi Lestari', 'Eko Prasetyo',
            'Rini Handayani', 'Hendra Wijaya', 'Sri Wahyuni', 'Agus Susanto', 'Mega Utami',
            'Rian Hidayat', 'Anisa Rahmawati', 'Dedi Kurniawan', 'Fitriani', 'Joko Widodo',
            'Kartika Sari', 'Mulyadi', 'Novianti', 'Rudi Hermawan', 'Wulandari',
            'Aditya Pratama', 'Indah Permatasari', 'Bambang Pamungkas', 'Yuni Shara', 'Taufik Hidayat',
            'Rian Akbar', 'Cut Nyak Dien', 'Gajah Mada', 'Rahmat Hidayat', 'Putri Ayu',
            'Faisal Basri', 'Sari Indah', 'Lutfi Hakim', 'Rizky Febian', 'Tiara Andini',
            'Andi Mallarangeng', 'Farida Nurhan', 'Reza Rahadian', 'Chelsea Islan', 'Ariel Noah'
        ];

        $religions = ['Islam', 'Kristen Protestan', 'Kristen Katolik', 'Hindu', 'Buddha', 'Khonghucu'];
        $cities = ['Jakarta Selatan', 'Bandung Wetan', 'Surabaya Gubeng', 'Yogyakarta Depok', 'Semarang Candi', 'Medan Baru', 'Makassar Rappocini', 'Malang Lowokwaru', 'Denpasar Timur', 'Solo Banjarsari'];
        $streets = ['Jl. Sudirman No. ', 'Jl. Gatot Subroto No. ', 'Jl. Dago No. ', 'Jl. Pemuda No. ', 'Jl. Malioboro No. ', 'Jl. Diponegoro No. ', 'Jl. Asia Afrika No. ', 'Jl. Slamet Riyadi No. '];

        $customers = [];
        $runningPoints = [];

        foreach ($indonesianNames as $index => $name) {
            $email = strtolower(str_replace(' ', '.', $name)) . '@gmail.com';
            
            // Generate starting points
            $initialPoints = rand(20, 100);

            $user = User::create([
                'name' => $name,
                'email' => $email,
                'password' => Hash::make('password'),
                'role' => 'customer',
                'birth_date' => Carbon::now()->subYears(rand(18, 45))->subDays(rand(1, 365))->format('Y-m-d'),
                'religion' => $religions[array_rand($religions)],
                'gender' => ($index % 2 === 0) ? 'L' : 'P',
                'points' => $initialPoints,
                'email_verified_at' => now(),
            ]);

            $phone = '08' . rand(11, 19) . rand(1000000, 9999999);
            $address = $streets[array_rand($streets)] . rand(1, 150) . ', ' . $cities[array_rand($cities)];
            
            $customer = Customer::create([
                'user_id' => $user->id,
                'phone' => $phone,
                'address' => $address,
            ]);

            $customers[] = $customer;
            $runningPoints[$user->id] = $initialPoints;
        }

        // 6. Generate Transactions parameters and sort them chronologically
        $tempTransactions = [];
        $totalTransactionsCount = 140;

        // Spread dates between June 1, 2026 and July 1, 2026
        // Today is June 14, 2026.
        $todayStr = '2026-06-14 10:51:40';
        $todayTimestamp = strtotime($todayStr);
        $startDateTimestamp = strtotime('2026-06-01 08:00:00');
        $endDateTimestamp = strtotime('2026-07-01 20:00:00');

        for ($i = 0; $i < $totalTransactionsCount; $i++) {
            // Generate a random timestamp within range
            $timestamp = rand($startDateTimestamp, $endDateTimestamp);
            
            // Random customer
            $customer = $customers[array_rand($customers)];
            
            // Random service
            $service = $services[array_rand($services)];
            
            // Random weight based on service unit
            if ($service->unit === 'Kg') {
                $weight = rand(10, 80) / 10.0; // 1.0 to 8.0 Kg
            } else {
                $weight = rand(1, 5); // 1 to 5 Pcs
            }

            $tempTransactions[] = [
                'timestamp' => $timestamp,
                'customer' => $customer,
                'service' => $service,
                'weight' => $weight,
            ];
        }

        // Sort chronologically
        usort($tempTransactions, function ($a, $b) {
            return $a['timestamp'] <=> $b['timestamp'];
        });

        // 7. Seed Transactions, Logs, Vouchers Redemptions
        foreach ($tempTransactions as $index => $trans) {
            $customer = $trans['customer'];
            $service = $trans['service'];
            $weight = $trans['weight'];
            $transactionDate = Carbon::createFromTimestamp($trans['timestamp']);
            
            $raw_total = $service->price * $weight;
            
            // Check status based on the relative time
            $isFuture = $trans['timestamp'] > $todayTimestamp;
            
            if ($isFuture) {
                // Future orders: only ongoing/pending status
                $status = ['antrian', 'dicuci', 'disetrika'][rand(0, 2)];
                $paymentStatus = (rand(1, 100) <= 30) ? 'paid' : 'pending';
                $paymentMethod = $paymentStatus === 'paid' ? ['transfer', 'qris'][rand(0, 1)] : null;
            } else {
                // Past orders: mostly completed
                $randVal = rand(1, 100);
                if ($randVal <= 80) {
                    $status = 'diambil';
                    $paymentStatus = 'paid';
                    $paymentMethod = ['cash', 'transfer', 'qris'][rand(0, 2)];
                } elseif ($randVal <= 92) {
                    $status = 'siap diambil';
                    $paymentStatus = 'paid';
                    $paymentMethod = ['cash', 'transfer', 'qris'][rand(0, 2)];
                } else {
                    $status = ['antrian', 'dicuci', 'disetrika'][rand(0, 2)];
                    $paymentStatus = (rand(1, 100) <= 60) ? 'paid' : 'pending';
                    $paymentMethod = $paymentStatus === 'paid' ? ['cash', 'transfer', 'qris'][rand(0, 2)] : null;
                }
            }

            // Decide to apply voucher
            $discount = 0;
            $appliedVoucherCode = null;
            
            $userPoints = $runningPoints[$customer->user_id];
            $affordableVouchers = [];
            foreach ($vouchers as $v) {
                if ($userPoints >= $v->points_cost && $raw_total >= $v->min_transaction) {
                    $affordableVouchers[] = $v;
                }
            }

            // Vouchers can only be applied to paid transactions, or paid during this generation
            // 20% chance to apply a voucher if affordable
            if (!empty($affordableVouchers) && $paymentStatus === 'paid' && rand(1, 100) <= 20) {
                $v = $affordableVouchers[array_rand($affordableVouchers)];
                
                // Deduct points spent
                $runningPoints[$customer->user_id] -= $v->points_cost;
                
                // Generate redemption code
                $appliedVoucherCode = strtoupper(Str::random(6));
                
                // Calculate discount
                if ($v->discount_type === 'percentage') {
                    $discount = $raw_total * ($v->discount_value / 100);
                    if ($v->max_discount && $discount > $v->max_discount) {
                        $discount = $v->max_discount;
                    }
                } else {
                    $discount = $v->discount_value;
                }

                if ($discount > $raw_total) {
                    $discount = $raw_total;
                }

                // Create PointsRedemption record
                PointsRedemption::create([
                    'user_id' => $customer->user_id,
                    'voucher_id' => $v->id,
                    'voucher_code' => $appliedVoucherCode,
                    'points_spent' => $v->points_cost,
                    'discount_value' => $discount,
                    'is_used' => true,
                    'used_at' => $transactionDate,
                    'expires_at' => $transactionDate->copy()->addDays(3),
                    'created_at' => $transactionDate->copy()->subHours(rand(1, 12)),
                    'updated_at' => $transactionDate,
                ]);
            }

            // Calculate actual paid & points earned
            $actualPaid = max(0, $raw_total - $discount);
            $pointsEarned = 0;
            
            if ($paymentStatus === 'paid') {
                $pointsEarned = intdiv($actualPaid, 1000) * 1;
                $runningPoints[$customer->user_id] += $pointsEarned;
                $paidAt = $transactionDate->copy()->addMinutes(rand(5, 120));
                $paymentProof = in_array($paymentMethod, ['transfer', 'qris']) ? 'payment_proofs/sample_proof.png' : null;
            } else {
                $paidAt = null;
                $paymentProof = null;
            }

            // Generate invoice code
            $invoiceCode = 'LND-' . str_pad($index + 1, 3, '0', STR_PAD_LEFT);

            // Create Transaction
            $transaction = Transaction::create([
                'invoice_code' => $invoiceCode,
                'admin_id' => $admin->id,
                'customer_id' => $customer->id,
                'service_id' => $service->id,
                'weight' => $weight,
                'total_price' => $raw_total,
                'status' => $status,
                'payment_method' => $paymentMethod,
                'payment_status' => $paymentStatus,
                'payment_proof' => $paymentProof,
                'paid_at' => $paidAt,
                'points_earned' => $pointsEarned,
                'voucher_code' => $appliedVoucherCode,
                'discount' => $discount,
                'created_at' => $transactionDate,
                'updated_at' => $transactionDate,
            ]);

            // Create TransactionLogs matching status progression
            $statusOrder = ['antrian', 'dicuci', 'disetrika', 'siap diambil', 'diambil'];
            $statusIndex = array_search($status, $statusOrder);
            
            for ($sIdx = 0; $sIdx <= $statusIndex; $sIdx++) {
                $currStatus = $statusOrder[$sIdx];
                
                // Add staggered times
                if ($currStatus === 'antrian') {
                    $logTime = $transactionDate->copy();
                } elseif ($currStatus === 'dicuci') {
                    $logTime = $transactionDate->copy()->addHours(1);
                } elseif ($currStatus === 'disetrika') {
                    $logTime = $transactionDate->copy()->addHours(4);
                } elseif ($currStatus === 'siap diambil') {
                    $logTime = $transactionDate->copy()->addHours(6);
                } else { // diambil
                    $logTime = $transactionDate->copy()->addHours(24);
                }

                TransactionLog::create([
                    'transaction_id' => $transaction->id,
                    'status' => $currStatus,
                    'created_at' => $logTime,
                    'updated_at' => $logTime,
                ]);
            }
        }

        // 8. Update final points in database
        foreach ($runningPoints as $userId => $points) {
            User::where('id', $userId)->update(['points' => $points]);
        }

        // 9. Seed some extra unused/expired vouchers for extra dashboard depth
        foreach ($customers as $customer) {
            $userPoints = $runningPoints[$customer->user_id];
            
            // Seed a few unused redemptions (representing vouchers redeemed on the app but not used yet)
            if ($userPoints >= 15 && rand(1, 100) <= 25) {
                $v = $vouchers[array_rand($vouchers)];
                $runningPoints[$customer->user_id] -= $v->points_cost;
                User::where('id', $customer->user_id)->update(['points' => $runningPoints[$customer->user_id]]);
                
                $voucherCode = strtoupper(Str::random(6));
                PointsRedemption::create([
                    'user_id' => $customer->user_id,
                    'voucher_id' => $v->id,
                    'voucher_code' => $voucherCode,
                    'points_spent' => $v->points_cost,
                    'discount_value' => $v->discount_value,
                    'is_used' => false,
                    'expires_at' => Carbon::now()->addDays(rand(1, 3)),
                    'created_at' => Carbon::now()->subHours(rand(1, 12)),
                    'updated_at' => Carbon::now(),
                ]);
            }

            // Seed a few expired redemptions (vouchers that expired)
            if ($userPoints >= 15 && rand(1, 100) <= 15) {
                $v = $vouchers[array_rand($vouchers)];
                $runningPoints[$customer->user_id] -= $v->points_cost;
                User::where('id', $customer->user_id)->update(['points' => $runningPoints[$customer->user_id]]);
                
                $voucherCode = strtoupper(Str::random(6));
                PointsRedemption::create([
                    'user_id' => $customer->user_id,
                    'voucher_id' => $v->id,
                    'voucher_code' => $voucherCode,
                    'points_spent' => $v->points_cost,
                    'discount_value' => $v->discount_value,
                    'is_used' => false,
                    'expires_at' => Carbon::now()->subDays(rand(2, 5)), // Expired in the past
                    'created_at' => Carbon::now()->subDays(rand(6, 8)),
                    'updated_at' => Carbon::now()->subDays(rand(2, 5)),
                ]);
            }
        }
    }
}
