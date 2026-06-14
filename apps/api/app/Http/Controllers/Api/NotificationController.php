<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class NotificationController extends Controller
{
    /**
     * Get user notifications.
     */
    public function index(Request $request)
    {
        $notifications = Notification::where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json(['data' => $notifications]);
    }

    /**
     * Mark a single notification as read.
     */
    public function markAsRead(Request $request, Notification $notification)
    {
        if ($notification->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $notification->update(['is_read' => true]);

        return response()->json(['message' => 'Notification marked as read.', 'data' => $notification]);
    }

    /**
     * Admin: Send targeted notifications.
     */
    public function sendTargeted(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
            'image' => ['nullable', 'image', 'max:2048'], // max 2MB
            'genders' => ['nullable', 'array'],
            'genders.*' => ['string', 'in:L,P'],
            'religions' => ['nullable', 'array'],
            'religions.*' => ['string'],
            'min_age' => ['nullable', 'integer', 'min:0'],
            'max_age' => ['nullable', 'integer', 'min:0', 'gte:min_age'],
            'is_in_app' => ['nullable'],
            'is_push' => ['nullable'],
        ]);

        $isInApp = $request->boolean('is_in_app', true);
        $isPush = $request->boolean('is_push', true);

        if (!$isInApp && !$isPush) {
            return response()->json(['message' => 'Please select at least one delivery channel.'], 422);
        }

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('notifications', 'public');
        }

        $query = User::where('role', 'customer');

        if ($request->filled('genders')) {
            $query->whereIn('gender', $request->genders);
        }

        if ($request->filled('religions')) {
            $query->where(function ($q) use ($request) {
                foreach ($request->religions as $religion) {
                    $q->orWhereRaw('LOWER(religion) = ?', [strtolower($religion)]);
                }
            });
        }

        $now = Carbon::now();

        if ($request->filled('min_age')) {
            $minAgeDate = $now->copy()->subYears($request->min_age)->toDateString();
            $query->where('birth_date', '<=', $minAgeDate);
        }

        if ($request->filled('max_age')) {
            $maxAgeDate = $now->copy()->subYears($request->max_age + 1)->addDay()->toDateString();
            $query->where('birth_date', '>=', $maxAgeDate);
        }

        $targetedUsers = $query->get();

        if ($targetedUsers->isEmpty()) {
            return response()->json(['message' => 'No customers matched the targeted criteria.'], 400);
        }

        if ($isInApp) {
            $notificationsToInsert = [];
            $timestamp = now();

            foreach ($targetedUsers as $user) {
                $notificationsToInsert[] = [
                    'user_id' => $user->id,
                    'title' => $validated['title'],
                    'content' => $validated['content'],
                    'image_path' => $imagePath,
                    'is_read' => false,
                    'created_at' => $timestamp,
                    'updated_at' => $timestamp,
                ];
            }

            Notification::insert($notificationsToInsert);
        }

        if ($isPush) {
            $pushMessages = [];
            foreach ($targetedUsers as $user) {
                if ($user->device_token) {
                    $pushMessages[] = [
                        'to' => $user->device_token,
                        'title' => $validated['title'],
                        'body' => $validated['content'],
                    ];
                }
            }
            if (!empty($pushMessages)) {
                \App\Services\ExpoPushService::sendMultiple($pushMessages);
            }
        }

        return response()->json([
            'message' => 'Notification sent successfully to ' . count($targetedUsers) . ' customer(s).',
            'recipients_count' => count($targetedUsers)
        ], 201);
    }
}
