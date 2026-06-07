<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Atur Ulang Kata Sandi - Loondry</title>
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
                            <h2 class="welcome-text" style="margin: 0 0 16px 0; color: #0f172a; font-size: 28px; font-weight: 700; letter-spacing: -0.03em;">Atur Ulang Kata Sandi</h2>
                            
                            <p style="margin: 0 0 16px 0; font-size: 16px; color: #334155;">Halo <strong>{{ $user->name }}</strong>,</p>
                            <p style="margin: 0 0 32px 0; font-size: 15px; color: #64748b; line-height: 1.7;">Kami menerima permintaan untuk mengatur ulang kata sandi akun Loondry Anda. Silakan klik tombol di bawah ini untuk membuat kata sandi baru:</p>
                            
                            <!-- Call to Action Button -->
                            <div style="text-align: center; margin: 32px 0;">
                                <!--[if mso]>
                                <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="{{ $url }}" style="height:48px;v-text-anchor:middle;width:240px;" arcsize="17%" stroke="f" fillcolor="#0284c7">
                                    <w:anchorlock/>
                                    <center style="color:#ffffff;font-family:sans-serif;font-size:15px;font-weight:bold;">Atur Ulang Kata Sandi</center>
                                </v:roundrect>
                                <![endif]-->
                                <!--[if !mso]><!-->
                                <a href="{{ $url }}" style="background-color: #0284c7; color: #ffffff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; display: inline-block; font-size: 15px; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.15); transition: background-color 0.2s ease;">Atur Ulang Kata Sandi</a>
                                <!--<![endif]-->
                            </div>

                            <!-- Expiration & Security Notice -->
                            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 32px;">
                                <tr>
                                    <td style="font-size: 13px; color: #64748b; line-height: 1.5; background-color: #f8fafc; border-left: 3px solid #cbd5e1; padding: 12px 16px; border-radius: 0 8px 8px 0;">
                                        💡 <strong>Informasi Penting:</strong> Tautan ini hanya berlaku selama <strong>60 menit</strong>. Jika Anda tidak merasa melakukan permintaan ini, abaikan email ini dan kata sandi Anda akan tetap aman.
                                    </td>
                                </tr>
                            </table>

                            <!-- Security Reminder Line -->
                            <div style="margin-top: 32px; padding-top: 20px; border-top: 1px dashed #e2e8f0; text-align: center;">
                                <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.6;">
                                    Demi keamanan akun Anda, jangan pernah membagikan tautan atau email ini kepada siapa pun.
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