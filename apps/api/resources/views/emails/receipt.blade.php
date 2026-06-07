<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Struk Pembayaran Loondry</title>
    <!--[if mso]>
    <noscript>
    <xml>
        <o:OfficeDocumentSettings>
            <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
    </xml>
    </noscript>
    <![endif]-->
    <style>
        @media screen and (max-width: 600px) {
            .content-padding {
                padding-left: 24px !important;
                padding-right: 24px !important;
            }
            .wrapper-padding {
                padding: 16px 8px !important;
            }
            .logo-img {
                width: 140px !important;
            }
            .welcome-text {
                font-size: 24px !important;
            }
            .detail-label, .detail-value {
                font-size: 14px !important;
            }
        }
    </style>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; line-height: 1.6; color: #334155; background-color: #f8fafc; margin: 0; padding: 0;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" class="wrapper-padding" style="background-color: #f8fafc; padding: 48px 16px;">
        <tr>
            <td align="center">
                <!-- Main Container -->
                <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 570px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(15, 23, 42, 0.03); border: 1px solid #e2e8f0;">
                    
                    <!-- Branded Top Header -->
                    <tr>
                        <td align="left" class="content-padding" style="padding: 40px 48px 0 48px;">
                            <img src="https://i.imgur.com/PSP5Fu5.png" alt="Loondry Logo" width="160" border="0" class="logo-img" style="display: block; outline: none; text-decoration: none; height: auto;">
                        </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                        <td class="content-padding" style="padding: 32px 48px 40px 48px; text-align: left;">
                            <h2 class="welcome-text" style="margin: 0 0 16px 0; color: #0f172a; font-size: 28px; font-weight: 700; letter-spacing: -0.03em;">Pembayaran Berhasil</h2>
                            
                            <p style="margin: 0 0 16px 0; font-size: 16px; color: #334155;">Halo <strong>{{ $transaction->customer->user->name }}</strong>,</p>
                            <p style="margin: 0 0 32px 0; font-size: 15px; color: #64748b; line-height: 1.7;">Terima kasih telah memercayakan pakaian Anda kepada Loondry. Pembayaran Anda telah kami terima dan berikut adalah ringkasan detail transaksi Anda:</p>
                            
                            <!-- Invoice / Transaction Detail Box -->
                            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 24px; border-collapse: separate;">
                                <tr>
                                    <td style="background-color: #f4f9ff; border-radius: 12px; padding: 24px; border: 1px solid #e0f2fe;">
                                        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                                            <!-- Invoice Code -->
                                            <tr>
                                                <td class="detail-label" style="padding-bottom: 6px; color: #0284c7; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; width: 35%;">No. Invoice</td>
                                                <td class="detail-value" style="padding-bottom: 12px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 15px; color: #0f172a; font-weight: 600;">
                                                    {{ $transaction->invoice_code }}
                                                </td>
                                            </tr>
                                            <!-- Service Name -->
                                            <tr>
                                                <td class="detail-label" style="padding-bottom: 6px; border-top: 1px solid #e0f2fe; padding-top: 12px; color: #0284c7; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Layanan</td>
                                                <td class="detail-value" style="padding-bottom: 12px; border-top: 1px solid #e0f2fe; padding-top: 12px; font-size: 15px; color: #334155;">
                                                    {{ $transaction->service->service_name }}
                                                </td>
                                            </tr>
                                            <!-- Total Price -->
                                            <tr>
                                                <td class="detail-label" style="border-top: 1px solid #e0f2fe; padding-top: 12px; color: #0284c7; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Total Bayar</td>
                                                <td class="detail-value" style="border-top: 1px solid #e0f2fe; padding-top: 12px; font-size: 18px; color: #0369a1; font-weight: 700;">
                                                    Rp {{ number_format($transaction->total_price, 0, ',', '.') }}
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- PDF Attachment Notice -->
                            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 32px;">
                                <tr>
                                    <td style="font-size: 13px; color: #64748b; line-height: 1.5; background-color: #f8fafc; border-left: 3px solid #cbd5e1; padding: 12px 16px; border-radius: 0 8px 8px 0;">
                                        📄 <strong>Informasi Lampiran:</strong> Salinan struk pembayaran resmi dan rincian item laundry Anda telah kami sertakan dalam format <strong>PDF</strong> pada lampiran email ini.
                                    </td>
                                </tr>
                            </table>

                            <!-- Closing Sign-off -->
                            <p style="margin: 0; font-size: 15px; color: #334155;">
                                Salam hangat,<br>
                                <strong>Tim Loondry</strong>
                            </p>

                            <!-- Help Center Line -->
                            <div style="margin-top: 32px; padding-top: 20px; border-top: 1px dashed #e2e8f0; text-align: center;">
                                <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.6;">
                                    Butuh bantuan terkait transaksi atau layanan kami? Tim support kami siap membantu.<br>Cukup balas email ini kapan saja.
                                </p>
                            </div>
                        </td>
                    </tr>

                    <!-- Footer Details -->
                    <tr>
                        <td align="center" class="content-padding" style="background-color: #f8fafc; padding: 24px 48px; border-top: 1px solid #f1f5f9;">
                            <p style="margin: 0; font-size: 11px; color: #94a3b8; line-height: 1.6; font-weight: 400;">
                                <strong>Loondry HQ</strong> &bull; Jl. Poras No.07, RT.01/RW.04, Loji, Kec. Bogor Bar., Kota Bogor, Jawa Barat 16117
                            </p>
                        </td>
                    </tr>
                </table>
                
                <!-- Bottom Copyright Subtext -->
                <p style="margin: 24px 0 0 0; font-size: 11px; color: #94a3b8; text-align: center; letter-spacing: 0.01em;">
                    &copy; {{ date('Y') }} Loondry.
                </p>
            </td>
        </tr>
    </table>
</body>
</html>