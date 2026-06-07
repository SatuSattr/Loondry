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
        $total_price = $service->price * $request->weight;

        // Generate invoice code: LND-NNN (sequential, e.g. LND-001)
        $lastTransaction = Transaction::latest()->first();
        $id = $lastTransaction ? $lastTransaction->id + 1 : 1;
        $invoice_code = 'LND-' . str_pad($id, 3, '0', STR_PAD_LEFT);

        $transaction = DB::transaction(function () use ($request, $invoice_code, $total_price) {
            $transaction = Transaction::create([
                'invoice_code' => $invoice_code,
                'admin_id' => $request->user()->id,
                'customer_id' => $request->customer_id,
                'service_id' => $request->service_id,
                'weight' => $request->weight,
                'total_price' => $total_price,
                'status' => 'antrian',
                'payment_method' => $request->payment_method,
                'payment_status' => 'pending',
            ]);

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
     * Display the specified resource.
     */
    public function show(Transaction $transaction)
    {
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
        $request->validate([
            'payment_proof' => ['required', 'image', 'mimes:jpg,jpeg,png', 'max:2048'],
        ]);

        if ($transaction->payment_proof) {
            Storage::disk('public')->delete($transaction->payment_proof);
        }

        $path = $request->file('payment_proof')->store('payment_proofs', 'public');

        $transaction->update([
            'payment_proof' => $path,
            'payment_status' => 'paid',
            'paid_at' => now(),
        ]);

        // Generate PDF and send Email
        $transaction->load(['customer.user', 'admin', 'service']);
        $pdf = Pdf::loadView('pdf.receipt', ['transaction' => $transaction]);
        $pdfContent = $pdf->output();

        Mail::to($transaction->customer->user->email)->send(new TransactionReceiptMail($transaction, $pdfContent));

        return response()->json([
            'message' => 'Payment proof uploaded and receipt sent to email successfully',
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
        $transaction->load(['customer.user', 'admin', 'service']);

        $pdf = Pdf::loadView('pdf.receipt', ['transaction' => $transaction]);

        return $pdf->download('receipt-' . $transaction->invoice_code . '.pdf');
    }
}
