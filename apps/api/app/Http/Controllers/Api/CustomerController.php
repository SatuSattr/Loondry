<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CustomerRequest;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Mail\CustomerCredentialMail;
use Illuminate\Support\Facades\Mail;

class CustomerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Customer::with('user');

        if ($request->has('q')) {
            $search = $request->q;
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            })->orWhere('phone', 'like', "%{$search}%");
        }

        $customers = $query->get();

        return response()->json([
            'data' => $customers,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(CustomerRequest $request)
    {
        // Use password from request if provided, otherwise generate random 8-character
        $passwordToUse = $request->password ?: Str::random(8);

        $customer = DB::transaction(function () use ($request, $passwordToUse) {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($passwordToUse),
                'role' => 'customer',
                'birth_date' => $request->birth_date,
                'religion' => $request->religion,
                'gender' => $request->gender,
                'email_verified_at' => now(), // Auto-verified since it's created by Admin
            ]);

            return $user->customer()->create([
                'phone' => $request->phone,
                'address' => $request->address,
            ]);
        });

        // Send credentials to customer email
        try {
            Mail::to($request->email)->send(new CustomerCredentialMail($customer->user, $passwordToUse));
        } catch (\Exception $e) {
            // Log the error but continue (the account is already created)
            \Illuminate\Support\Facades\Log::error("Failed to send credentials to {$request->email}: " . $e->getMessage());
        }

        return response()->json([
            'message' => 'Customer created successfully and credentials sent to email.',
            'data' => $customer->load('user'),
            'debug_password' => $passwordToUse,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Customer $customer)
    {
        return response()->json([
            'data' => $customer->load('user'),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(CustomerRequest $request, Customer $customer)
    {
        DB::transaction(function () use ($request, $customer) {
            $userData = $request->only(['name', 'email', 'birth_date', 'religion', 'gender']);
            
            if ($request->password) {
                $userData['password'] = Hash::make($request->password);
            }

            if ($customer->user) {
                $customer->user->update(array_filter($userData, function ($value) {
                    return $value !== null;
                }));
            }

            $customerData = $request->only(['phone', 'address']);
            $customer->update(array_filter($customerData, function ($value) {
                return $value !== null;
            }));
        });

        return response()->json([
            'message' => 'Customer updated successfully',
            'data' => $customer->load('user'),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Customer $customer)
    {
        DB::transaction(function () use ($customer) {
            $user = $customer->user;
            $customer->delete();
            if ($user) {
                if ($user->avatar) {
                    \Illuminate\Support\Facades\Storage::disk('public')->delete($user->avatar);
                }
                $user->delete();
            }
        });

        return response()->json([
            'message' => 'Customer deleted successfully',
        ]);
    }

    /**
     * Upload an avatar for a customer.
     */
    public function uploadAvatar(Request $request, Customer $customer)
    {
        $request->validate([
            'avatar' => ['required', 'image', 'max:2048'],
        ]);

        $user = $customer->user;
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        if ($user->avatar) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($user->avatar);
        }

        $path = $request->file('avatar')->store('avatars', 'public');
        $user->update(['avatar' => $path]);

        return response()->json([
            'message' => 'Customer avatar updated successfully',
            'avatar_url' => $user->avatar_url,
            'data' => $customer->load('user'),
        ]);
    }
}
