@php
    $logoPath = public_path('assets/loondry-logo-colored.png');
    $logoBase64 = '';
    if (file_exists($logoPath)) {
        $logoBase64 = 'data:image/png;base64,' . base64_encode(file_get_contents($logoPath));
    }
@endphp
<!DOCTYPE html>
<html>
<head>
    <link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Geist', 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #2D3748; margin: 0; padding: 20px; font-size: 12px; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #EDF2F7; padding-bottom: 20px; }
        .logo { width: 80px; margin-bottom: 10px; }
        .business-name { font-size: 24px; font-weight: bold; color: #2B6CB0; margin: 0; text-transform: uppercase; }
        .business-address { color: #718096; margin: 5px 0; line-height: 1.4; }
        
        .receipt-title { text-align: center; font-size: 18px; font-weight: bold; margin: 20px 0; color: #2D3748; }
        
        .info-table { width: 100%; margin-bottom: 30px; }
        .info-table td { padding: 5px 0; vertical-align: top; }
        .label { color: #718096; width: 100px; }
        
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .items-table th { background-color: #F7FAFC; text-align: left; padding: 12px 10px; border-bottom: 2px solid #EDF2F7; color: #4A5568; }
        .items-table td { padding: 12px 10px; border-bottom: 1px solid #EDF2F7; }
        
        .total-section { float: right; width: 250px; }
        .total-row { padding: 10px 0; font-size: 14px; }
        .grand-total { font-size: 20px; font-weight: bold; color: #2B6CB0; border-top: 2px solid #2B6CB0; padding-top: 10px; margin-top: 10px; }
        
        .footer { clear: both; margin-top: 100px; text-align: center; color: #A0AEC0; font-size: 10px; border-top: 1px solid #EDF2F7; padding-top: 20px; }
    </style>
</head>
<body>
    <div class="header">
        @if ($logoBase64)
            <img src="{{ $logoBase64 }}" class="logo">
        @else
            <img src="{{ public_path('assets/loondry-logo-colored.png') }}" class="logo">
        @endif
        <h1 class="business-name">Loondry</h1>
        <p class="business-address">
            Jl. Poras No.07, RT.01/RW.04, Loji, Kec. Bogor Bar.,<br>
            Kota Bogor, Jawa Barat 16117
        </p>
    </div>

    <div class="receipt-title">STRUK PEMBAYARAN RESMI</div>

    <table class="info-table">
        <tr>
            <td>
                <table>
                    <tr><td class="label">No. Invoice</td><td>: <strong>{{ $transaction->invoice_code }}</strong></td></tr>
                    <tr><td class="label">Tanggal</td><td>: {{ $transaction->paid_at ? $transaction->paid_at->format('d M Y H:i') : $transaction->created_at->format('d M Y H:i') }}</td></tr>
                    <tr><td class="label">Admin</td><td>: {{ $transaction->admin->name }}</td></tr>
                </table>
            </td>
            <td align="right">
                <table>
                    <tr><td class="label">Pelanggan</td><td>: <strong>{{ $transaction->customer->user->name }}</strong></td></tr>
                    <tr><td class="label">Telepon</td><td>: {{ $transaction->customer->phone }}</td></tr>
                    <tr><td class="label">Metode</td><td>: {{ strtoupper($transaction->payment_method) }}</td></tr>
                </table>
            </td>
        </tr>
    </table>

    <table class="items-table">
        <thead>
            <tr>
                <th>Deskripsi Layanan</th>
                <th align="center">Berat / Qty</th>
                <th align="right">Harga Unit</th>
                <th align="right">Subtotal</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Layanan Laundry {{ ucfirst($transaction->service->service_name) }}</td>
                <td align="center">{{ $transaction->weight }} {{ $transaction->service->unit }}</td>
                <td align="right">Rp {{ number_format($transaction->service->price, 0, ',', '.') }}</td>
                <td align="right">Rp {{ number_format($transaction->total_price, 0, ',', '.') }}</td>
            </tr>
        </tbody>
    </table>

    <div class="total-section">
        <div class="total-row">
            <span style="float: left; color: #718096;">Total Tagihan</span>
            <span style="float: right;">Rp {{ number_format($transaction->total_price, 0, ',', '.') }}</span>
            <div style="clear: both;"></div>
        </div>
@if ($transaction->discount > 0)
        <div class="total-row" style="color: #E53E3E;">
            <span style="float: left;">Diskon Voucher</span>
            <span style="float: right;">- Rp {{ number_format($transaction->discount, 0, ',', '.') }}</span>
            <div style="clear: both;"></div>
        </div>
        <div class="total-row" style="color: #718096;">
            <span style="float: left;">Total Setelah Diskon</span>
            <span style="float: right;">Rp {{ number_format($transaction->total_price - $transaction->discount, 0, ',', '.') }}</span>
            <div style="clear: both;"></div>
        </div>
@endif
        <div class="total-row grand-total" style="color: {{ $transaction->payment_status === 'paid' ? '#2F855A' : ($transaction->payment_status === 'pending_confirmation' ? '#D69E2E' : '#C53030') }}; border-top: 2px solid {{ $transaction->payment_status === 'paid' ? '#2F855A' : ($transaction->payment_status === 'pending_confirmation' ? '#D69E2E' : '#C53030') }};">
            <span style="float: left;">
                @if ($transaction->payment_status === 'paid')
                    LUNAS
                @elseif ($transaction->payment_status === 'pending_confirmation')
                    PENDING KONFIRMASI
                @else
                    BELUM LUNAS
                @endif
            </span>
            <span style="float: right;">Rp {{ number_format($transaction->total_price - $transaction->discount, 0, ',', '.') }}</span>
            <div style="clear: both;"></div>
        </div>
    </div>

    <div class="footer">
        <p>Terima kasih telah mempercayakan pakaian Anda kepada Loondry.</p>
        <p>Simpan struk ini sebagai bukti pembayaran yang sah.</p>
        <p>&copy; {{ date('Y') }} Loondry - Laundry in Your Pocket</p>
    </div>
</body>
</html>
