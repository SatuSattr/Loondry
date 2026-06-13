<?php

use App\Models\Customer;
use App\Models\User;
use App\Models\Voucher;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->admin = User::factory()->create(['role' => 'admin']);
    $this->customer_user = User::factory()->create(['role' => 'customer', 'points' => 1000]);
    $this->customer = $this->customer_user->customer()->create(['phone' => '123', 'address' => 'Test']);
});

test('admin can create voucher with max_uses_per_user limit', function () {
    $this->actingAs($this->admin, 'sanctum');

    $response = $this->postJson('/api/vouchers-templates', [
        'code' => 'LIMIT50',
        'name' => 'Limit Voucher',
        'discount_type' => 'flat',
        'discount_value' => 5000,
        'points_cost' => 100,
        'max_uses_per_user' => 2,
    ]);

    $response->assertStatus(201);
    $this->assertDatabaseHas('vouchers', [
        'code' => 'LIMIT50',
        'max_uses_per_user' => 2,
    ]);
});

test('user cannot redeem voucher beyond max_uses_per_user limit', function () {
    $this->actingAs($this->admin, 'sanctum');

    $voucher = Voucher::create([
        'code' => 'LIMIT50',
        'name' => 'Limit Voucher',
        'discount_type' => 'flat',
        'discount_value' => 5000,
        'points_cost' => 100,
        'max_uses_per_user' => 2,
        'status' => 'active',
    ]);

    // 1st redemption (Success)
    $response = $this->postJson('/api/vouchers/redeem', [
        'voucher_id' => $voucher->id,
        'customer_id' => $this->customer->id,
    ]);
    $response->assertStatus(201);

    // 2nd redemption (Success)
    $response = $this->postJson('/api/vouchers/redeem', [
        'voucher_id' => $voucher->id,
        'customer_id' => $this->customer->id,
    ]);
    $response->assertStatus(201);

    // 3rd redemption (Fail)
    $response = $this->postJson('/api/vouchers/redeem', [
        'voucher_id' => $voucher->id,
        'customer_id' => $this->customer->id,
    ]);
    $response->assertStatus(400)
        ->assertJsonPath('message', 'You have reached the maximum redemption limit for this voucher.');
});

test('user can redeem unlimited times if no limit is set', function () {
    $this->actingAs($this->admin, 'sanctum');

    $voucher = Voucher::create([
        'code' => 'UNLIMITED',
        'name' => 'Unlimited Voucher',
        'discount_type' => 'flat',
        'discount_value' => 5000,
        'points_cost' => 100,
        'max_uses_per_user' => null,
        'status' => 'active',
    ]);

    // Redeem 5 times
    for ($i = 0; $i < 5; $i++) {
        $response = $this->postJson('/api/vouchers/redeem', [
            'voucher_id' => $voucher->id,
            'customer_id' => $this->customer->id,
        ]);
        $response->assertStatus(201);
    }
});
