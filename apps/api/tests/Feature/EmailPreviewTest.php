<?php

use Illuminate\Support\Facades\Mail;
use App\Models\User;
use App\Mail\CustomerCredentialMail;
use Illuminate\Support\Facades\Config;

test('send beautiful credential email for preview', function () {
    // Ensure we use the custom LND_MAIL settings from .env
    // These are already handled by config/mail.php, but we can verify them here
    $host = config('mail.mailers.smtp.host');
    
    if ($host === '127.0.0.1') {
        $this->markTestSkipped('SMTP not configured. Please check your .env LND_MAIL settings.');
    }

    // Create a mock user for the preview
    $user = new User([
        'name' => 'Force Nace Preview',
        'email' => 'forcenace@gmail.com'
    ]);

    // Send the email
    try {
        Mail::to('forcenace@gmail.com')->send(new CustomerCredentialMail($user, 'WFLgu9JL'));
        expect(true)->toBeTrue();
        echo "\n[SUCCESS] Email sent to forcenace@gmail.com. Please check your inbox!\n";
    } catch (\Exception $e) {
        echo "\n[ERROR] Failed to send email: " . $e->getMessage() . "\n";
        throw $e;
    }
});
