<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ExpoPushService
{
    /**
     * Send a push notification to a specific token.
     *
     * @param string $token Expo Push Token (e.g. ExpoPushToken[xxx])
     * @param string $title
     * @param string $body
     * @param array $data Optional custom payload
     * @return bool
     */
    public static function send(string $token, string $title, string $body, array $data = []): bool
    {
        if (empty($token) || !str_starts_with($token, 'ExpoPushToken')) {
            Log::warning("ExpoPushService: Invalid or missing token: {$token}");
            return false;
        }

        try {
            $response = Http::withHeaders([
                'Accept' => 'application/json',
                'Accept-encoding' => 'gzip, deflate',
                'Content-Type' => 'application/json',
            ])->post('https://exp.host/--/api/v2/push/send', [
                'to' => $token,
                'title' => $title,
                'body' => $body,
                'data' => $data,
                'sound' => 'default',
            ]);

            if ($response->successful()) {
                return true;
            }

            Log::error("ExpoPushService: Failed to send push notification. Response: " . $response->body());
            return false;
        } catch (\Exception $e) {
            Log::error("ExpoPushService: Exception while sending push notification: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Send push notifications to multiple recipients at once.
     *
     * @param array $messages Array of message arrays: [['to' => 'token', 'title' => '...', 'body' => '...'], ...]
     * @return bool
     */
    public static function sendMultiple(array $messages): bool
    {
        if (empty($messages)) {
            return true;
        }

        try {
            // Expo recommends sending no more than 100 messages at once
            $chunks = array_chunk($messages, 100);
            foreach ($chunks as $chunk) {
                $response = Http::withHeaders([
                    'Accept' => 'application/json',
                    'Accept-encoding' => 'gzip, deflate',
                    'Content-Type' => 'application/json',
                ])->post('https://exp.host/--/api/v2/push/send', $chunk);

                if (!$response->successful()) {
                     Log::error("ExpoPushService: Bulk send failed. Response: " . $response->body());
                }
            }
            return true;
        } catch (\Exception $e) {
            Log::error("ExpoPushService: Exception in bulk send: " . $e->getMessage());
            return false;
        }
    }
}
