<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\VoucherController;
use Illuminate\Support\Facades\Route;

Route::get('/health', fn () => response()->json(['status' => 'ok']));

Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::put('/profile', [\App\Http\Controllers\Api\ProfileController::class, 'update']);
    Route::put('/profile/password', [\App\Http\Controllers\Api\ProfileController::class, 'password']);

    // Admin only routes
    Route::middleware('role:admin')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index']);
        
        Route::apiResource('services', ServiceController::class);
        Route::apiResource('customers', CustomerController::class);
        
        Route::get('/transactions', [TransactionController::class, 'index']);
        Route::post('/transactions', [TransactionController::class, 'store']);
        Route::put('/transactions/{transaction}/status', [TransactionController::class, 'updateStatus']);
        Route::post('/transactions/{transaction}/condition-images', [TransactionController::class, 'uploadConditionImages']);
        
        Route::get('/reports/revenue', [TransactionController::class, 'revenueReport']);
        Route::get('/reports/statistics', [TransactionController::class, 'statisticsReport']);

        Route::apiResource('vouchers-templates', VoucherController::class)->parameters([
            'vouchers-templates' => 'voucher'
        ]);
        Route::get('/admin/vouchers', [VoucherController::class, 'allVouchers']);
    });

    // Customer self-service routes
    Route::put('/profile/customer', [\App\Http\Controllers\Api\ProfileController::class, 'updateCustomer']);

    // Points & Voucher routes
    Route::get('/points', [VoucherController::class, 'pointsBalance']);
    Route::post('/vouchers/redeem', [VoucherController::class, 'redeem']);
    Route::get('/vouchers', [VoucherController::class, 'myVouchers']);
    Route::post('/transactions/{transaction}/apply-voucher', [VoucherController::class, 'applyVoucher']);

    // Shared or Customer routes
    Route::get('/transactions/{transaction}', [TransactionController::class, 'show']);
    Route::get('/status-laundry', [TransactionController::class, 'statusLaundry']);
    Route::post('/transactions/{transaction}/payment', [TransactionController::class, 'uploadPaymentProof']);

    // Receipt / Print
    Route::get('/transactions/{transaction}/receipt', [TransactionController::class, 'printReceipt']);
});
