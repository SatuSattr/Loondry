<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\TransactionController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);

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
    });

    // Customer self-service routes
    Route::put('/profile/customer', [\App\Http\Controllers\Api\ProfileController::class, 'updateCustomer']);

    // Shared or Customer routes
    Route::get('/transactions/{transaction}', [TransactionController::class, 'show']);
    Route::get('/status-laundry', [TransactionController::class, 'statusLaundry']);
    Route::post('/transactions/{transaction}/payment', [TransactionController::class, 'uploadPaymentProof']);

    // Receipt / Print
    Route::get('/transactions/{transaction}/receipt', [TransactionController::class, 'printReceipt']);
});
