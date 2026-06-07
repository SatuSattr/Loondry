<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
$request = Illuminate\Http\Request::capture();
$data = app('App\Http\Controllers\Web\TransactionWebController')->index($request);
// Inertia::render returns an Inertia\Response
// We can get the props:
$props = $data->toResponse($request)->original;
echo json_encode($props['page']['props'] ?? $props);
