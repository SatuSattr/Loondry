<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\VoucherController;
use App\Http\Controllers\Api\NotificationController;
use Illuminate\Support\Facades\Route;

Route::get('/health', fn () => response()->json(['status' => 'ok']));

Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::put('/profile', [\App\Http\Controllers\Api\ProfileController::class, 'update']);
    Route::put('/profile/password', [\App\Http\Controllers\Api\ProfileController::class, 'password']);
    Route::post('/profile/avatar', [\App\Http\Controllers\Api\ProfileController::class, 'avatar']);
    Route::post('/profile/device-token', [\App\Http\Controllers\Api\ProfileController::class, 'updateDeviceToken']);
    Route::get('/vouchers-templates', [VoucherController::class, 'index']);

    // Admin only routes
    Route::middleware('role:admin')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index']);
        
        Route::apiResource('services', ServiceController::class);
        Route::apiResource('customers', CustomerController::class);
        Route::post('/customers/{customer}/avatar', [CustomerController::class, 'uploadAvatar']);
        
        Route::get('/transactions', [TransactionController::class, 'index']);
        Route::post('/transactions', [TransactionController::class, 'store']);
        Route::put('/transactions/{transaction}/status', [TransactionController::class, 'updateStatus']);
        Route::post('/transactions/{transaction}/condition-images', [TransactionController::class, 'uploadConditionImages']);
        
        Route::get('/reports/revenue', [TransactionController::class, 'revenueReport']);
        Route::get('/reports/statistics', [TransactionController::class, 'statisticsReport']);
        Route::get('/reports/transactions', [TransactionController::class, 'transactionsReport']);

        Route::apiResource('vouchers-templates', VoucherController::class)->parameters([
            'vouchers-templates' => 'voucher'
        ])->except(['index']);
        Route::get('/admin/vouchers', [VoucherController::class, 'allVouchers']);
        Route::post('/admin/notifications', [NotificationController::class, 'sendTargeted']);
    });

    // Customer self-service routes
    Route::put('/profile/customer', [\App\Http\Controllers\Api\ProfileController::class, 'updateCustomer']);

    // Notifications routes
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);

    // Points & Voucher routes
    Route::get('/points', [VoucherController::class, 'pointsBalance']);
    Route::post('/vouchers/redeem', [VoucherController::class, 'redeem']);
    Route::get('/vouchers', [VoucherController::class, 'myVouchers']);
    Route::get('/vouchers/check/{voucher_code}', [VoucherController::class, 'checkVoucherCode']);
    Route::post('/transactions/{transaction}/apply-voucher', [VoucherController::class, 'applyVoucher']);

    // Shared or Customer routes
    Route::get('/transactions/{transaction}', [TransactionController::class, 'show']);
    Route::get('/status-laundry', [TransactionController::class, 'statusLaundry']);
    Route::post('/transactions/{transaction}/payment', [TransactionController::class, 'uploadPaymentProof']);
    Route::post('/transactions/{transaction}/approve-payment', [TransactionController::class, 'approvePayment']);
    Route::post('/transactions/{transaction}/reject-payment', [TransactionController::class, 'rejectPayment']);
    Route::post('/transactions/{transaction}/cancel-payment', [TransactionController::class, 'cancelPayment']);

    // Receipt / Print
    Route::get('/transactions/{transaction}/receipt', [TransactionController::class, 'printReceipt']);
});
