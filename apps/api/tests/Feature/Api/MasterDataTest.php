<?php

use App\Models\Customer;
use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->admin = User::factory()->create(['role' => 'admin']);
    $this->actingAs($this->admin, 'sanctum');
});

test('can list services', function () {
    Service::create(['service_name' => 'Cuci Kering', 'price' => 1000, 'unit' => 'Kg']);
    
    $response = $this->getJson('/api/services');

    $response->assertStatus(200)
        ->assertJsonCount(1, 'data');
});

test('can create service', function () {
    $response = $this->postJson('/api/services', [
        'service_name' => 'Jas',
        'price' => 5000,
        'unit' => 'Pcs',
    ]);

    $response->assertStatus(201);
    $this->assertDatabaseHas('services', ['service_name' => 'Jas', 'unit' => 'Pcs']);
});

test('can list customers', function () {
    $user = User::factory()->create(['role' => 'customer']);
    $user->customer()->create(['phone' => '123', 'address' => 'Test']);

    $response = $this->getJson('/api/customers');

    $response->assertStatus(200)
        ->assertJsonCount(1, 'data');
});

test('can create customer', function () {
    $response = $this->postJson('/api/customers', [
        'name' => 'Customer 1',
        'email' => 'customer1@example.com',
        'password' => 'password',
        'phone' => '08123456789',
        'address' => 'Jl. Merdeka No. 1',
    ]);

    $response->assertStatus(201);
    $this->assertDatabaseHas('users', ['email' => 'customer1@example.com', 'role' => 'customer']);
    $this->assertDatabaseHas('customers', ['phone' => '08123456789']);
});

test('can update customer', function () {
    $user = User::factory()->create(['role' => 'customer']);
    $customer = $user->customer()->create(['phone' => '123', 'address' => 'Test']);

    $response = $this->putJson("/api/customers/{$customer->id}", [
        'name' => 'Updated Name',
        'email' => $user->email,
        'phone' => '987',
        'address' => 'Updated Address',
    ]);

    $response->assertStatus(200);
    $this->assertDatabaseHas('users', ['id' => $user->id, 'name' => 'Updated Name']);
    $this->assertDatabaseHas('customers', ['id' => $customer->id, 'phone' => '987']);
});
