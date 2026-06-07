<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kredensial Akun Loondry</title>
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
            .credential-value {
                font-size: 15px !important;
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
                            <h2 class="welcome-text" style="margin: 0 0 16px 0; color: #0f172a; font-size: 28px; font-weight: 700; letter-spacing: -0.03em;">Selamat datang di <span style="color: #3C93CF;">Loondry.</span></h2>
                            
                            <p style="margin: 0 0 16px 0; font-size: 16px; color: #334155;">Halo <strong>{{ $user->name }}</strong>,</p>
                            <p style="margin: 0 0 32px 0; font-size: 15px; color: #64748b; line-height: 1.7;">Akun Anda telah berhasil didaftarkan oleh tim kami. Gunakan informasi kredensial rahasia di bawah ini untuk masuk ke panel dashboard dan melacak status laundry Anda secara real-time.</p>
                            
                            <!-- Credential Section -->
                            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 24px; border-collapse: separate;">
                                <tr>
                                    <td style="background-color: #f4f9ff; border-radius: 12px; padding: 24px; border: 1px solid #e0f2fe;">
                                        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                                            <tr>
                                                <td style="padding-bottom: 6px; color: #0284c7; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Email Login</td>
                                            </tr>
                                            <tr>
                                                <td class="credential-value" style="padding-bottom: 20px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 16px; color: #0369a1; font-weight: 600; word-break: break-all;">
                                                    {{ $user->email }}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding-bottom: 6px; color: #0284c7; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Password Sementara</td>
                                            </tr>
                                            <tr>
                                                <td style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 18px; color: #0f172a; font-weight: 700; letter-spacing: 0.5px;">
                                                    <span style="background-color: #ffffff; border: 1px solid #bae6fd; padding: 4px 10px; border-radius: 6px; display: inline-block;">{{ $password }}</span>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Security Advisory Notice -->
                            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 32px;">
                                <tr>
                                    <td style="font-size: 13px; color: #64748b; line-height: 1.5; background-color: #f8fafc; border-left: 3px solid #cbd5e1; padding: 10px 16px; border-radius: 0 8px 8px 0;">
                                        💡 <strong>Demi Keamanan:</strong> Mohon segera perbarui password sementara Anda melalui menu pengaturan profil setelah berhasil masuk untuk pertama kalinya.
                                    </td>
                                </tr>
                            </table>

                            <!-- App Download Callout -->
                            <div style="border-top: 1px solid #f1f5f9; padding-top: 32px; text-align: center;">
                                <p style="margin: 0 0 16px 0; font-size: 13px; color: #475569; font-weight: 600; letter-spacing: 0.02em;">Unduh Aplikasi Mobile Kami:</p>
                                <div style="text-align: center;">
                                    <!--[if mso]><table align="center" role="presentation"><tr><td><![endif]-->
                                    <a href="#" style="text-decoration: none; display: inline-block; margin: 0 6px 8px 6px; vertical-align: middle;">
                                        <img src="https://i.imgur.com/tMO4pRE.png" alt="Get it on Google Play" border="0" height="38" style="display: block; max-height: 38px;">
                                    </a>
                                    <!--[if mso]></td><td><![endif]-->
                                    <a href="#" style="text-decoration: none; display: inline-block; margin: 0 6px 8px 6px; vertical-align: middle;">
                                        <img src="https://i.imgur.com/aEuboHv.png" alt="Download on the App Store" border="0" height="38" style="display: block; max-height: 38px;">
                                    </a>
                                    <!--[if mso]></td></tr></table><![endif]-->
                                </div>
                            </div>

                            <!-- Help Center Line -->
                            <div style="margin-top: 24px; padding-top: 20px; border-top: 1px dashed #e2e8f0; text-align: center;">
                                <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.6;">
                                    Jika Anda tidak merasa mendaftar akun di platform kami, silakan abaikan pesan ini.<br>Butuh bantuan? Tim support kami siap menjawab balasan email ini.
                                </p>
                            </div>
                        </td>
                    </tr>

                    <!-- Footer Details -->
                    <tr>
                        <td align="center" class="content-padding" style="background-color: #f8fafc; padding: 24px 48px; border-top: 1px solid #f1f5f9;">
                            <p style="margin: 0; font-size: 11px; color: #94a3b8; line-height: 1.6; font-weight: 400;">
                                <strong>Loondry HQ</strong> &bull; Jl. Poras No.07, RT.01/RW.04, Loji, Kec. Bogor Bar., Kota Bogor
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