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
