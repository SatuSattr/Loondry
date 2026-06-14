<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\TransactionRequest;
use App\Mail\TransactionReceiptMail;
use App\Models\Service;
use App\Models\Transaction;
use App\Models\TransactionLog;
use App\Models\TransactionImage;
use App\Models\PointsRedemption;
use Barryvdh\DomPDF\Facade\Pdf;
use Barryvdh\DomPDF\PDF as DomPDF;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

class TransactionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $transactions = Transaction::with(['customer.user', 'admin', 'service', 'logs', 'images'])->latest()->get();
        return response()->json([
            'data' => $transactions,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(TransactionRequest $request)
    {
        $service = Service::findOrFail($request->service_id);
        $raw_total = $service->price * $request->weight;

        $paymentStatus = $request->input('payment_status', 'pending');
        if ($paymentStatus !== 'paid') {
            $paymentStatus = 'pending';
        }

        // Apply voucher if provided
        $discount = 0;
        $redemption = null;
        if ($request->filled('voucher_code')) {
            if ($paymentStatus === 'pending') {
                return response()->json([
                    'message' => 'Vouchers cannot be applied when creating a transaction with deferred payment (Pay Later). Please use the voucher during payment completion.'
                ], 422);
            }

            try {
                $result = PointsRedemption::validateAndCalculateDiscount(
                    $request->voucher_code,
                    $raw_total,
                    $request->customer_id
                );
                $redemption = $result['redemption'];
                $discount = $result['discount'];
            } catch (\Exception $e) {
                return response()->json(['message' => $e->getMessage()], 422);
            }
        }

        $actual_paid = max(0, $raw_total - $discount);
        $points_earned = intdiv($actual_paid, config('points.earn_per')) * config('points.earn_rate');

        // Generate invoice code: LND-NNN (sequential, e.g. LND-001)
        $maxId = Transaction::max('id') ?: 0;
        $id = $maxId + 1;
        $invoice_code = 'LND-' . str_pad($id, 3, '0', STR_PAD_LEFT);

        $transaction = DB::transaction(function () use ($request, $invoice_code, $raw_total, $points_earned, $discount, $redemption) {
            $paymentStatus = $request->input('payment_status', 'pending');
            $paidAt = null;
            $proofPath = null;

            if ($paymentStatus === 'paid') {
                $paidAt = now();
                if (in_array($request->payment_method, ['transfer', 'qris']) && $request->hasFile('payment_proof')) {
                    $proofPath = $request->file('payment_proof')->store('payment_proofs', 'public');
                }
            } else {
                $paymentStatus = 'pending';
            }

            $transaction = Transaction::create([
                'invoice_code' => $invoice_code,
                'admin_id' => $request->user()->id,
                'customer_id' => $request->customer_id,
                'service_id' => $request->service_id,
                'weight' => $request->weight,
                'total_price' => $raw_total,
                'status' => 'antrian',
                'payment_method' => $request->payment_method,
                'payment_status' => $paymentStatus,
                'payment_proof' => $proofPath,
                'paid_at' => $paidAt,
                'points_earned' => $points_earned,
                'discount' => $discount,
                'voucher_code' => $redemption ? $redemption->voucher_code : null,
            ]);

            if ($redemption) {
                $redemption->update([
                    'is_used' => true,
                    'used_at' => now(),
                ]);
            }

            // If paid, increment points for customer
            if ($paymentStatus === 'paid') {
                $customerUser = $transaction->customer->user;
                $customerUser->increment('points', $points_earned);
            }

            // Log initial status
            $transaction->logs()->create(['status' => 'antrian']);

            return $transaction;
        });

        return response()->json([
            'message' => 'Transaction created successfully',
            'data' => $transaction->load(['customer.user', 'service']),
        ], 201);
    }

    /**
     * Helper to verify user owns the transaction or is admin.
     */
    private function authorizeTransaction(Transaction $transaction)
    {
        $user = request()->user();
        if ($user->role !== 'admin') {
            $customer = $user->customer;
            if (!$customer || $transaction->customer_id !== $customer->id) {
                abort(response()->json(['message' => 'Unauthorized access to transaction.'], 403));
            }
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Transaction $transaction)
    {
        $this->authorizeTransaction($transaction);
        return response()->json([
            'data' => $transaction->load(['customer.user', 'admin', 'service', 'logs', 'images']),
        ]);
    }

    /**
     * Update the status of the transaction.
     */
    public function updateStatus(Request $request, Transaction $transaction)
    {
        $request->validate([
            'status' => ['required', 'in:antrian,dicuci,disetrika,siap diambil,diambil'],
        ]);

        if ($transaction->status === 'diambil') {
            return response()->json([
                'message' => 'Completed transactions (diambil) cannot have their status updated again.',
            ], 422);
        }

        if ($request->status === 'diambil' && $transaction->payment_status !== 'paid') {
            return response()->json([
                'message' => 'The transaction cannot be completed because payment is not completed. Please approve/process the payment first.',
            ], 422);
        }

        if ($transaction->status !== $request->status) {
            DB::transaction(function () use ($request, $transaction) {
                $transaction->update(['status' => $request->status]);
                $transaction->logs()->create(['status' => $request->status]);
            });

            if ($request->status === 'siap diambil') {
                $customer = $transaction->customer;
                if ($customer && $customer->user_id) {
                    $service = $transaction->service;
                    $serviceName = $service ? $service->service_name : 'Layanan';
                    $unit = $service ? $service->unit : 'Kg';
                    $title = 'Pesanan Siap Diambil!';
                    $content = sprintf(
                        'Pesanan %s %g %s dengan kode %s sudah siap diambil!',
                        $serviceName,
                        (float)$transaction->weight,
                        $unit,
                        $transaction->invoice_code
                    );

                    \App\Models\Notification::create([
                        'user_id' => $customer->user_id,
                        'title' => $title,
                        'content' => $content,
                        'is_read' => false,
                    ]);

                    $customerUser = $customer->user;
                    if ($customerUser && $customerUser->device_token) {
                        \App\Services\ExpoPushService::send($customerUser->device_token, $title, $content);
                    }
                }
            }
        }

        return response()->json([
            'message' => 'Transaction status updated successfully',
            'data' => $transaction->load('logs'),
        ]);
    }

    /**
     * Upload condition images.
     */
    public function uploadConditionImages(Request $request, Transaction $transaction)
    {
        $request->validate([
            'image_before' => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:5120'],
            'image_after' => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:5120'],
            'images' => ['nullable', 'array'],
            'images.*' => ['image', 'mimes:jpg,jpeg,png', 'max:5120'],
        ]);

        $uploadedImages = [];

        if ($request->hasFile('image_before')) {
            // Delete old file from storage if it exists
            $oldBefore = $transaction->images()->where('type', 'before')->first();
            if ($oldBefore) {
                Storage::disk('public')->delete($oldBefore->image_path);
                $oldBefore->delete();
            }

            $path = $request->file('image_before')->store('transaction_conditions', 'public');
            $uploadedImages[] = $transaction->images()->create([
                'image_path' => $path,
                'type' => 'before'
            ]);
        }

        if ($request->hasFile('image_after')) {
            // Delete old file from storage if it exists
            $oldAfter = $transaction->images()->where('type', 'after')->first();
            if ($oldAfter) {
                Storage::disk('public')->delete($oldAfter->image_path);
                $oldAfter->delete();
            }

            $path = $request->file('image_after')->store('transaction_conditions', 'public');
            $uploadedImages[] = $transaction->images()->create([
                'image_path' => $path,
                'type' => 'after'
            ]);
        }

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('transaction_conditions', 'public');
                $uploadedImages[] = $transaction->images()->create([
                    'image_path' => $path,
                    'type' => 'before'
                ]);
            }
        }

        return response()->json([
            'message' => 'Condition images uploaded successfully',
            'data' => $transaction->load('images'),
        ]);
    }

    /**
     * Upload payment proof and send receipt.
     */
    public function uploadPaymentProof(Request $request, Transaction $transaction)
    {
        $this->authorizeTransaction($transaction);
        
        $method = $request->input('payment_method', $transaction->payment_method);
        $isCustomer = $request->user()->role === 'customer';

        if ($isCustomer && !in_array($method, ['transfer', 'qris'])) {
            return response()->json(['message' => 'Customers can only choose transfer or qris payment method.'], 422);
        }
        
        $request->validate([
            'payment_method' => [$transaction->payment_method ? 'nullable' : 'required', 'string', 'in:cash,transfer,qris'],
            'payment_proof' => [
                (in_array($method, ['transfer', 'qris']) && !$transaction->payment_proof) ? 'required' : 'nullable',
                'image',
                'mimes:jpg,jpeg,png',
                'max:2048'
            ],
            'voucher_code' => ['nullable', 'string'],
        ]);

        if ($transaction->voucher_code && $request->filled('voucher_code')) {
            return response()->json(['message' => 'This transaction has already applied a voucher.'], 422);
        }

        $discount = $transaction->discount ?: 0;
        $redemption = null;
        if ($request->filled('voucher_code')) {
            try {
                $result = PointsRedemption::validateAndCalculateDiscount(
                    $request->voucher_code,
                    $transaction->total_price,
                    $transaction->customer_id
                );
                $redemption = $result['redemption'];
                $discount = $result['discount'];
            } catch (\Exception $e) {
                return response()->json(['message' => $e->getMessage()], 422);
            }
        }

        // Recalculate points earned based on actual paid amount after discount
        $actual_paid = max(0, $transaction->total_price - $discount);
        $points_earned = intdiv($actual_paid, config('points.earn_per')) * config('points.earn_rate');

        $path = null;
        if ($request->hasFile('payment_proof')) {
            if ($transaction->payment_proof) {
                Storage::disk('public')->delete($transaction->payment_proof);
            }
            $path = $request->file('payment_proof')->store('payment_proofs', 'public');
        }

        $isCustomer = $request->user()->role === 'customer';

        DB::transaction(function () use ($path, $transaction, $discount, $redemption, $points_earned, $request, $isCustomer) {
            $updateData = [];
            if ($path !== null) {
                $updateData['payment_proof'] = $path;
            }
            if ($request->filled('payment_method')) {
                $updateData['payment_method'] = $request->payment_method;
            }

            if ($isCustomer) {
                // Customer uploading proof: payment becomes pending_confirmation
                $updateData['payment_status'] = 'pending_confirmation';
                if ($redemption) {
                    $updateData['discount'] = $discount;
                    $updateData['voucher_code'] = $redemption->voucher_code;
                }
                $transaction->update($updateData);

                if ($redemption) {
                    $redemption->update([
                        'is_used' => true,
                        'used_at' => now(),
                    ]);
                }
            } else {
                // Admin paying/confirming: mark paid immediately
                $updateData['payment_status'] = 'paid';
                $updateData['paid_at'] = now();
                $updateData['points_earned'] = $points_earned;
                if ($redemption) {
                    $updateData['discount'] = $discount;
                    $updateData['voucher_code'] = $redemption->voucher_code;
                }
                $transaction->update($updateData);

                if ($redemption) {
                    $redemption->update([
                        'is_used' => true,
                        'used_at' => now(),
                    ]);
                }

                $customerUser = $transaction->customer->user;
                $customerUser->increment('points', $points_earned);
            }
        });

        $transaction->load(['customer.user', 'admin', 'service']);

        if (!$isCustomer) {
            try {
                $pdf = Pdf::loadView('pdf.receipt', ['transaction' => $transaction]);
                $pdfContent = $pdf->output();
                Mail::to($transaction->customer->user->email)->send(new TransactionReceiptMail($transaction, $pdfContent));
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::warning('Receipt email failed: ' . $e->getMessage());
            }
        }

        $msg = $isCustomer
            ? 'Payment proof submitted successfully and is pending admin review.'
            : ($transaction->payment_method === 'cash'
                ? 'Cash payment confirmed, points awarded, and receipt sent to email successfully'
                : 'Payment proof uploaded, points awarded, and receipt sent to email successfully');

        return response()->json([
            'message' => $msg,
            'data' => $transaction,
        ]);
    }

    /**
     * Approve a customer's uploaded payment proof.
     */
    public function approvePayment(Request $request, Transaction $transaction)
    {
        $user = $request->user();
        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized. Only admins can approve payments.'], 403);
        }

        if ($transaction->payment_status === 'paid') {
            return response()->json(['message' => 'Transaction is already paid.'], 422);
        }

        if (!$transaction->payment_proof) {
            return response()->json(['message' => 'Cannot approve. No payment proof uploaded yet.'], 422);
        }

        $actual_paid = max(0, $transaction->total_price - ($transaction->discount ?: 0));
        $points_earned = intdiv($actual_paid, config('points.earn_per')) * config('points.earn_rate');

        DB::transaction(function () use ($transaction, $points_earned) {
            $transaction->update([
                'payment_status' => 'paid',
                'paid_at' => now(),
                'points_earned' => $points_earned,
            ]);

            $customerUser = $transaction->customer->user;
            $customerUser->increment('points', $points_earned);
        });

        $transaction->load(['customer.user', 'admin', 'service']);

        try {
            $pdf = Pdf::loadView('pdf.receipt', ['transaction' => $transaction]);
            $pdfContent = $pdf->output();
            Mail::to($transaction->customer->user->email)->send(new TransactionReceiptMail($transaction, $pdfContent));
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::warning('Receipt email failed: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Payment approved successfully',
            'data' => $transaction,
        ]);
    }

    /**
     * Reject a customer's uploaded payment proof.
     */
    public function rejectPayment(Request $request, Transaction $transaction)
    {
        $user = $request->user();
        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized. Only admins can reject payments.'], 403);
        }

        if ($transaction->payment_status === 'paid') {
            return response()->json(['message' => 'Cannot reject a paid transaction.'], 422);
        }

        // Delete proof file from storage
        if ($transaction->payment_proof) {
            Storage::disk('public')->delete($transaction->payment_proof);
        }

        // If a voucher was applied, we un-use the redemption
        if ($transaction->voucher_code) {
            $redemption = PointsRedemption::where('voucher_code', $transaction->voucher_code)->first();
            if ($redemption) {
                // Refund points to user
                $customerUser = $transaction->customer->user;
                $customerUser->increment('points', $redemption->points_spent);

                $redemption->update([
                    'is_used' => false,
                    'used_at' => null,
                ]);
            }
        }

        $transaction->update([
            'payment_status' => 'pending',
            'payment_proof' => null,
            'payment_method' => null,
            'discount' => 0,
            'voucher_code' => null,
        ]);

        return response()->json([
            'message' => 'Payment proof rejected and removed successfully',
            'data' => $transaction->load(['customer.user', 'admin', 'service']),
        ]);
    }

    /**
     * Cancel a customer's pending payment confirmation.
     */
    public function cancelPayment(Request $request, Transaction $transaction)
    {
        $this->authorizeTransaction($transaction);

        if ($transaction->payment_status !== 'pending_confirmation') {
            return response()->json(['message' => 'Cannot cancel. Payment is not pending confirmation.'], 422);
        }

        // Delete proof file from storage
        if ($transaction->payment_proof) {
            Storage::disk('public')->delete($transaction->payment_proof);
        }

        // If a voucher was applied, we un-use the redemption
        if ($transaction->voucher_code) {
            $redemption = PointsRedemption::where('voucher_code', $transaction->voucher_code)->first();
            if ($redemption) {
                // Refund points to user
                $customerUser = $transaction->customer->user;
                $customerUser->increment('points', $redemption->points_spent);

                $redemption->update([
                    'is_used' => false,
                    'used_at' => null,
                ]);
            }
        }

        $transaction->update([
            'payment_status' => 'pending',
            'payment_proof' => null,
            'payment_method' => null,
            'discount' => 0,
            'voucher_code' => null,
        ]);

        return response()->json([
            'message' => 'Payment confirmation canceled successfully',
            'data' => $transaction->load(['customer.user', 'admin', 'service']),
        ]);
    }

    /**
     * Display transactions for the logged-in customer.
     */
    public function statusLaundry(Request $request)
    {
        $customer = $request->user()->customer;

        if (! $customer) {
            return response()->json([
                'message' => 'Customer profile not found',
            ], 404);
        }

        $transactions = Transaction::with(['service'])
            ->where('customer_id', $customer->id)
            ->latest()
            ->get();

        return response()->json([
            'data' => $transactions,
        ]);
    }

    /**
     * Revenue report.
     */
    public function revenueReport()
    {
        $totalRevenue = Transaction::where('payment_status', 'paid')->sum('total_price');

        return response()->json([
            'total_revenue' => $totalRevenue,
        ]);
    }

    /**
     * Statistics report.
     */
    public function statisticsReport()
    {
        $stats = Transaction::select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
            ->groupBy('date')
            ->orderBy('date', 'desc')
            ->get();

        return response()->json([
            'statistics' => $stats,
        ]);
    }

    /**
     * Print receipt (PDF).
     */
    public function printReceipt(Transaction $transaction)
    {
        $this->authorizeTransaction($transaction);
        $transaction->load(['customer.user', 'admin', 'service']);

        $pdf = Pdf::loadView('pdf.receipt', ['transaction' => $transaction]);

        return $pdf->download('receipt-' . $transaction->invoice_code . '.pdf');
    }
}
