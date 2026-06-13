<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\TransactionRequest;
use App\Mail\TransactionReceiptMail;
use App\Models\Service;
use App\Models\Transaction;
use App\Models\TransactionLog;
use App\Models\TransactionImage;
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
        $points_earned = intdiv($raw_total, config('points.earn_per')) * config('points.earn_rate');

        // Generate invoice code: LND-NNN (sequential, e.g. LND-001)
        $maxId = Transaction::max('id') ?: 0;
        $id = $maxId + 1;
        $invoice_code = 'LND-' . str_pad($id, 3, '0', STR_PAD_LEFT);

        $transaction = DB::transaction(function () use ($request, $invoice_code, $raw_total, $points_earned) {
            $paymentStatus = $request->input('payment_status', 'pending');
            $paidAt = null;
            $proofPath = null;

            if ($paymentStatus === 'paid') {
                $paidAt = now();
                if ($request->payment_method === 'transfer' && $request->hasFile('payment_proof')) {
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
            ]);

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

        if ($transaction->status !== $request->status) {
            DB::transaction(function () use ($request, $transaction) {
                $transaction->update(['status' => $request->status]);
                $transaction->logs()->create(['status' => $request->status]);
            });
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
            'images' => ['required', 'array'],
            'images.*' => ['image', 'mimes:jpg,jpeg,png', 'max:5120'],
        ]);

        $uploadedImages = [];
        foreach ($request->file('images') as $image) {
            $path = $image->store('transaction_conditions', 'public');
            $transactionImage = $transaction->images()->create(['image_path' => $path]);
            $uploadedImages[] = $transactionImage;
        }

        return response()->json([
            'message' => 'Condition images uploaded successfully',
            'data' => $uploadedImages,
        ]);
    }

    /**
     * Upload payment proof and send receipt.
     */
    public function uploadPaymentProof(Request $request, Transaction $transaction)
    {
        $this->authorizeTransaction($transaction);
        $request->validate([
            'payment_proof' => $transaction->payment_method === 'cash'
                ? ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:2048']
                : ['required', 'image', 'mimes:jpg,jpeg,png', 'max:2048'],
        ]);

        $path = null;
        if ($request->hasFile('payment_proof')) {
            if ($transaction->payment_proof) {
                Storage::disk('public')->delete($transaction->payment_proof);
            }
            $path = $request->file('payment_proof')->store('payment_proofs', 'public');
        }

        DB::transaction(function () use ($path, $transaction) {
            $updateData = [
                'payment_status' => 'paid',
                'paid_at' => now(),
            ];
            if ($path !== null) {
                $updateData['payment_proof'] = $path;
            }
            $transaction->update($updateData);

            $customerUser = $transaction->customer->user;
            $customerUser->increment('points', $transaction->points_earned);
        });

        $transaction->load(['customer.user', 'admin', 'service']);

        try {
            $pdf = Pdf::loadView('pdf.receipt', ['transaction' => $transaction]);
            $pdfContent = $pdf->output();
            Mail::to($transaction->customer->user->email)->send(new TransactionReceiptMail($transaction, $pdfContent));
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::warning('Receipt email failed: ' . $e->getMessage());
        }

        $msg = $transaction->payment_method === 'cash'
            ? 'Cash payment confirmed, points awarded, and receipt sent to email successfully'
            : 'Payment proof uploaded, points awarded, and receipt sent to email successfully';

        return response()->json([
            'message' => $msg,
            'data' => $transaction,
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
