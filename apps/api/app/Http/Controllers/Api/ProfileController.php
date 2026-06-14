<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Contracts\UpdatesUserProfileInformation;
use Laravel\Fortify\Contracts\UpdatesUserPasswords;

class ProfileController extends Controller
{
    /**
     * Update the user's profile information.
     */
    public function update(Request $request, UpdatesUserProfileInformation $updater)
    {
        $updater->update($request->user(), $request->all());

        return response()->json([
            'message' => 'Profile updated successfully' . ($request->user()->email_verified_at === null ? '. Please verify your new email.' : ''),
            'user' => $request->user()->fresh(),
        ]);
    }

    /**
     * Update the user's password.
     */
    public function password(Request $request, UpdatesUserPasswords $updater)
    {
        $updater->update($request->user(), $request->all());

        return response()->json([
            'message' => 'Password updated successfully',
        ]);
    }

    /**
     * Update customer's own profile data (name, phone, address).
     */
    public function updateCustomer(Request $request)
    {
        $user = $request->user();
        $customer = $user->customer;

        if (!$customer) {
            return response()->json(['message' => 'Customer profile not found'], 404);
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'phone' => ['sometimes', 'string', 'max:15'],
            'address' => ['sometimes', 'string'],
        ]);

        DB::transaction(function () use ($user, $customer, $validated) {
            if (isset($validated['name'])) {
                $user->update(['name' => $validated['name']]);
            }
            $customer->update(array_filter([
                'phone' => $validated['phone'] ?? null,
                'address' => $validated['address'] ?? null,
            ], fn ($v) => $v !== null));
        });

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user->fresh()->load('customer'),
        ]);
    }

    /**
     * Update the user's avatar.
     */
    public function avatar(Request $request)
    {
        $request->validate([
            'avatar' => ['required', 'image', 'max:2048'],
        ]);

        $user = $request->user();

        if ($user->avatar) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($user->avatar);
        }

        $path = $request->file('avatar')->store('avatars', 'public');
        $user->update(['avatar' => $path]);

        return response()->json([
            'message' => 'Avatar updated successfully',
            'avatar_url' => $user->avatar_url,
            'user' => $user->fresh()->load('customer'),
        ]);
    }

    /**
     * Update the user's push notification device token.
     */
    public function updateDeviceToken(Request $request)
    {
        $request->validate([
            'device_token' => ['nullable', 'string', 'max:255'],
        ]);

        $request->user()->update([
            'device_token' => $request->device_token,
        ]);

        return response()->json([
            'message' => 'Device token updated successfully',
            'user' => $request->user()->fresh(),
        ]);
    }
}
