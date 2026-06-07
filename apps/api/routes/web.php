<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'message' => 'Loondry API is running',
        'status' => 'success',
    ]);
})->name('home');
