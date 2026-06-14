<?php

use App\Models\Customer;
use App\Models\Service;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->admin = User::factory()->create(['role' => 'admin']);
    $this->customer_user = User::factory()->create(['role' => 'customer']);
    $this->customer = $this->customer_user->customer()->create(['phone' => '123', 'address' => 'Test']);
    $this->service = Service::create(['service_name' => 'Cuci Kering', 'price' => 8000, 'unit' => 'Kg']);
});

test('admin can create transaction', function () {
    $this->actingAs($this->admin, 'sanctum');

    $response = $this->postJson('/api/transactions', [
        'customer_id' => $this->customer->id,
        'service_id' => $this->service->id,
        'weight' => 2,
        'payment_method' => 'cash',
        'payment_status' => 'paid',
    ]);

    $response->assertStatus(201)
        ->assertJsonPath('data.total_price', '16000.00');
    
    $this->assertDatabaseHas('transactions', [
        'customer_id' => $this->customer->id,
        'total_price' => 16000,
    ]);
});

test('admin can list all transactions', function () {
    $this->actingAs($this->admin, 'sanctum');

    Transaction::create([
        'invoice_code' => 'LND-001',
        'admin_id' => $this->admin->id,
        'customer_id' => $this->customer->id,
        'service_id' => $this->service->id,
        'weight' => 2,
        'total_price' => 16000,
        'status' => 'antrian',
        'payment_method' => 'cash',
    ]);

    $response = $this->getJson('/api/transactions');

    $response->assertStatus(200)
        ->assertJsonCount(1, 'data');
});

test('admin can view transaction detail', function () {
    $this->actingAs($this->admin, 'sanctum');

    $transaction = Transaction::create([
        'invoice_code' => 'LND-001',
        'admin_id' => $this->admin->id,
        'customer_id' => $this->customer->id,
        'service_id' => $this->service->id,
        'weight' => 2,
        'total_price' => 16000,
        'status' => 'antrian',
        'payment_method' => 'cash',
    ]);

    $response = $this->getJson("/api/transactions/{$transaction->id}");

    $response->assertStatus(200)
        ->assertJsonPath('data.invoice_code', 'LND-001');
});

test('admin can update transaction status', function () {
    $this->actingAs($this->admin, 'sanctum');

    $transaction = Transaction::create([
        'invoice_code' => 'LND-001',
        'admin_id' => $this->admin->id,
        'customer_id' => $this->customer->id,
        'service_id' => $this->service->id,
        'weight' => 2,
        'total_price' => 16000,
        'status' => 'antrian',
        'payment_method' => 'cash',
    ]);

    $response = $this->putJson("/api/transactions/{$transaction->id}/status", [
        'status' => 'dicuci',
    ]);

    $response->assertStatus(200);
    $this->assertDatabaseHas('transactions', ['id' => $transaction->id, 'status' => 'dicuci']);
});

test('customer can view their own transactions', function () {
    $this->actingAs($this->customer_user, 'sanctum');

    Transaction::create([
        'invoice_code' => 'LND-001',
        'admin_id' => $this->admin->id,
        'customer_id' => $this->customer->id,
        'service_id' => $this->service->id,
        'weight' => 2,
        'total_price' => 16000,
        'status' => 'antrian',
        'payment_method' => 'cash',
    ]);

    $response = $this->getJson('/api/status-laundry');

    $response->assertStatus(200)
        ->assertJsonCount(1, 'data');
});

test('can upload payment proof', function () {
    Storage::fake('public');

    $this->actingAs($this->customer_user, 'sanctum');

    $transaction = Transaction::create([
        'invoice_code' => 'LND-001',
        'admin_id' => $this->admin->id,
        'customer_id' => $this->customer->id,
        'service_id' => $this->service->id,
        'weight' => 2,
        'total_price' => 16000,
        'status' => 'antrian',
        'payment_method' => 'transfer',
    ]);

    $file = UploadedFile::fake()->image('proof.jpg');

    $response = $this->postJson("/api/transactions/{$transaction->id}/payment", [
        'payment_proof' => $file,
    ]);

    $response->assertStatus(200);
    
    $transaction->refresh();
    expect($transaction->payment_proof)->not->toBeNull();
    Storage::disk('public')->assertExists($transaction->payment_proof);
});

test('customer can update their own profile', function () {
    $this->actingAs($this->customer_user, 'sanctum');

    $response = $this->putJson('/api/profile/customer', [
        'name' => 'Updated Name',
        'phone' => '081234567890',
        'address' => 'Jl. Baru No. 1',
    ]);

    $response->assertStatus(200);
    $this->assertDatabaseHas('users', ['id' => $this->customer_user->id, 'name' => 'Updated Name']);
    $this->assertDatabaseHas('customers', ['id' => $this->customer->id, 'phone' => '081234567890', 'address' => 'Jl. Baru No. 1']);
});

test('admin can download transaction receipt', function () {
    $this->actingAs($this->admin, 'sanctum');

    $transaction = Transaction::create([
        'invoice_code' => 'LND-002',
        'admin_id' => $this->admin->id,
        'customer_id' => $this->customer->id,
        'service_id' => $this->service->id,
        'weight' => 2,
        'total_price' => 16000,
        'status' => 'antrian',
        'payment_method' => 'cash',
    ]);

    $response = $this->get("/api/transactions/{$transaction->id}/receipt");

    $response->assertStatus(200);
    $response->assertHeader('Content-Type', 'application/pdf');
});

test('admin can upload transaction condition images', function () {
    Storage::fake('public');

    $this->actingAs($this->admin, 'sanctum');

    $transaction = Transaction::create([
        'invoice_code' => 'LND-001',
        'admin_id' => $this->admin->id,
        'customer_id' => $this->customer->id,
        'service_id' => $this->service->id,
        'weight' => 2,
        'total_price' => 16000,
        'status' => 'antrian',
        'payment_method' => 'cash',
    ]);

    $file = UploadedFile::fake()->image('condition_photo.jpg');

    $response = $this->postJson("/api/transactions/{$transaction->id}/condition-images", [
        'images' => [$file],
    ]);

    $response->assertStatus(200);
    
    $transaction->refresh();
    expect($transaction->images)->toHaveCount(1);
    Storage::disk('public')->assertExists($transaction->images->first()->image_path);
});

test('admin cannot update status of completed transaction', function () {
    $this->actingAs($this->admin, 'sanctum');

    $transaction = Transaction::create([
        'invoice_code' => 'LND-100',
        'admin_id' => $this->admin->id,
        'customer_id' => $this->customer->id,
        'service_id' => $this->service->id,
        'weight' => 2,
        'total_price' => 16000,
        'status' => 'diambil',
        'payment_method' => 'cash',
        'payment_status' => 'paid',
    ]);

    $response = $this->putJson("/api/transactions/{$transaction->id}/status", [
        'status' => 'dicuci',
    ]);

    $response->assertStatus(422);
});

test('admin cannot complete transaction if payment is pending', function () {
    $this->actingAs($this->admin, 'sanctum');

    $transaction = Transaction::create([
        'invoice_code' => 'LND-101',
        'admin_id' => $this->admin->id,
        'customer_id' => $this->customer->id,
        'service_id' => $this->service->id,
        'weight' => 2,
        'total_price' => 16000,
        'status' => 'antrian',
        'payment_method' => 'cash',
        'payment_status' => 'pending',
    ]);

    $response = $this->putJson("/api/transactions/{$transaction->id}/status", [
        'status' => 'diambil',
    ]);

    $response->assertStatus(422);
});

test('admin status update to siap diambil sends notification to customer', function () {
    $this->actingAs($this->admin, 'sanctum');

    $transaction = Transaction::create([
        'invoice_code' => 'LND-200',
        'admin_id' => $this->admin->id,
        'customer_id' => $this->customer->id,
        'service_id' => $this->service->id,
        'weight' => 2.5,
        'total_price' => 20000,
        'status' => 'antrian',
        'payment_method' => 'cash',
        'payment_status' => 'pending',
    ]);

    $response = $this->putJson("/api/transactions/{$transaction->id}/status", [
        'status' => 'siap diambil',
    ]);

    $response->assertStatus(200);

    // Assert a notification was created for the customer user
    $this->assertDatabaseHas('notifications', [
        'user_id' => $this->customer_user->id,
        'title' => 'Pesanan Siap Diambil!',
    ]);

    $notification = \App\Models\Notification::where('user_id', $this->customer_user->id)->latest()->first();
    expect($notification->content)->toContain($this->service->service_name);
    expect($notification->content)->toContain('2.5');
    expect($notification->content)->toContain($this->service->unit);
    expect($notification->content)->toContain('LND-200');
});

test('admin can create transaction with QRIS upfront and payment proof', function () {
    Storage::fake('public');

    $this->actingAs($this->admin, 'sanctum');

    $file = UploadedFile::fake()->image('qris_proof.png');

    $response = $this->postJson('/api/transactions', [
        'customer_id' => $this->customer->id,
        'service_id' => $this->service->id,
        'weight' => 2,
        'payment_method' => 'qris',
        'payment_status' => 'paid',
        'payment_proof' => $file,
    ]);

    $response->assertStatus(201);
    
    $transaction = Transaction::where('invoice_code', $response->json('data.invoice_code'))->first();
    expect($transaction->payment_method)->toBe('qris');
    expect($transaction->payment_status)->toBe('paid');
    expect($transaction->payment_proof)->not->toBeNull();
    Storage::disk('public')->assertExists($transaction->payment_proof);
});

test('admin can upload payment proof for pending QRIS transaction', function () {
    Storage::fake('public');

    $this->actingAs($this->admin, 'sanctum');

    $transaction = Transaction::create([
        'invoice_code' => 'LND-QRIS-PENDING',
        'admin_id' => $this->admin->id,
        'customer_id' => $this->customer->id,
        'service_id' => $this->service->id,
        'weight' => 2,
        'total_price' => 16000,
        'status' => 'antrian',
        'payment_method' => 'qris',
        'payment_status' => 'pending',
    ]);

    $file = UploadedFile::fake()->image('qris_post_proof.png');

    $response = $this->postJson("/api/transactions/{$transaction->id}/payment", [
        'payment_proof' => $file,
    ]);

    $response->assertStatus(200);

    $transaction->refresh();
    expect($transaction->payment_status)->toBe('paid');
    expect($transaction->payment_proof)->not->toBeNull();
    Storage::disk('public')->assertExists($transaction->payment_proof);
});

test('points are only awarded when transaction is paid', function () {
    $this->actingAs($this->admin, 'sanctum');

    // Refresh to load database default values (points = 0)
    $this->customer_user->refresh();
    $initialPoints = $this->customer_user->points;

    // Create a pending transaction
    $response = $this->postJson('/api/transactions', [
        'customer_id' => $this->customer->id,
        'service_id' => $this->service->id,
        'weight' => 10, // 80000 total price
        'payment_method' => 'cash',
        'payment_status' => 'pending',
    ]);

    $response->assertStatus(201);
    $this->customer_user->refresh();
    // Points should not be added yet
    expect($this->customer_user->points)->toBe($initialPoints);

    // Now confirm payment
    $txId = $response->json('data.id');
    $payResponse = $this->postJson("/api/transactions/{$txId}/payment");
    $payResponse->assertStatus(200);

    $this->customer_user->refresh();
    // Points should now be added: 80 points (80000 / 1000)
    expect($this->customer_user->points)->toBe($initialPoints + 80);
});

test('refined voucher system features: redemption, expiration, security and usage', function () {
    // 1. Create a Voucher Template
    $voucher = \App\Models\Voucher::create([
        'code' => 'DISC50',
        'name' => 'Discount 50 Percent',
        'discount_type' => 'percentage',
        'discount_value' => 50,
        'points_cost' => 10,
        'status' => 'active',
    ]);

    // Give customer points to redeem
    $this->customer_user->update(['points' => 100]);

    // 2. Redeem Voucher
    $this->actingAs($this->customer_user, 'sanctum');
    $redeemResponse = $this->postJson('/api/vouchers/redeem', [
        'voucher_id' => $voucher->id,
    ]);

    $redeemResponse->assertStatus(201);
    $voucherCode = $redeemResponse->json('data.voucher_code');

    // Assert code is 6 characters and has 3 days expiry
    expect(strlen($voucherCode))->toBe(6);
    
    $redemption = \App\Models\PointsRedemption::where('voucher_code', $voucherCode)->first();
    expect($redemption->expires_at)->not->toBeNull();
    // Expect about 3 days expiry
    expect((int) abs(round(now()->diffInDays($redemption->expires_at))))->toBe(3);

    // 3. Security: Prevent other customer from using the code
    $otherCustomerUser = User::factory()->create(['role' => 'customer']);
    $otherCustomer = $otherCustomerUser->customer()->create(['phone' => '456', 'address' => 'Test 2']);
    
    $this->actingAs($this->admin, 'sanctum');
    $creationResponse1 = $this->postJson('/api/transactions', [
        'customer_id' => $otherCustomer->id,
        'service_id' => $this->service->id,
        'weight' => 2,
        'payment_method' => 'cash',
        'payment_status' => 'paid',
        'voucher_code' => $voucherCode,
    ]);
    // Mismatch user ID should fail with 422
    $creationResponse1->assertStatus(422);
    expect($creationResponse1->json('message'))->toContain('another customer');

    // 4. Expiration check
    $redemption->update(['expires_at' => now()->subDay()]); // Make it expired
    $creationResponse2 = $this->postJson('/api/transactions', [
        'customer_id' => $this->customer->id,
        'service_id' => $this->service->id,
        'weight' => 2,
        'payment_method' => 'cash',
        'payment_status' => 'paid',
        'voucher_code' => $voucherCode,
    ]);
    $creationResponse2->assertStatus(422);
    expect($creationResponse2->json('message'))->toContain('expired');

    // Reset expiry for successful use
    $redemption->update(['expires_at' => now()->addDays(3)]);

    // 5. Usage during creation: Apply voucher on transaction creation
    $creationResponse3 = $this->postJson('/api/transactions', [
        'customer_id' => $this->customer->id,
        'service_id' => $this->service->id,
        'weight' => 2, // 16000 total price
        'payment_method' => 'cash',
        'payment_status' => 'paid',
        'voucher_code' => $voucherCode,
    ]);

    $creationResponse3->assertStatus(201);
    expect($creationResponse3->json('data.discount'))->toBe('8000.00'); // 50% discount of 16000
    
    $redemption->refresh();
    expect($redemption->is_used)->toBeTrue();
});

test('admin can check voucher code validity', function () {
    $voucher = \App\Models\Voucher::create([
        'code' => 'CHECK10',
        'name' => 'Discount 10 Percent',
        'discount_type' => 'percentage',
        'discount_value' => 10,
        'points_cost' => 5,
        'status' => 'active',
    ]);

    $this->customer_user->update(['points' => 10]);

    $this->actingAs($this->customer_user, 'sanctum');
    $redeemResponse = $this->postJson('/api/vouchers/redeem', [
        'voucher_id' => $voucher->id,
    ]);
    $voucherCode = $redeemResponse->json('data.voucher_code');

    $this->actingAs($this->admin, 'sanctum');
    $response = $this->getJson("/api/vouchers/check/{$voucherCode}?total_price=20000&customer_id={$this->customer->id}");

    $response->assertStatus(200)
        ->assertJsonPath('valid', true)
        ->assertJsonPath('discount', 2000); // 10% of 20000
});

test('admin cannot apply voucher code on creation when payment is pending', function () {
    $voucher = \App\Models\Voucher::create([
        'code' => 'DISC10PENDING',
        'name' => 'Discount 10 Percent',
        'discount_type' => 'percentage',
        'discount_value' => 10,
        'points_cost' => 5,
        'status' => 'active',
    ]);

    $this->customer_user->update(['points' => 10]);

    $this->actingAs($this->customer_user, 'sanctum');
    $redeemResponse = $this->postJson('/api/vouchers/redeem', [
        'voucher_id' => $voucher->id,
    ]);
    $voucherCode = $redeemResponse->json('data.voucher_code');

    $this->actingAs($this->admin, 'sanctum');
    $response = $this->postJson('/api/transactions', [
        'customer_id' => $this->customer->id,
        'service_id' => $this->service->id,
        'weight' => 2,
        'payment_method' => 'cash',
        'payment_status' => 'pending',
        'voucher_code' => $voucherCode,
    ]);

    $response->assertStatus(422);
    expect($response->json('message'))->toContain('payment completion');
});
