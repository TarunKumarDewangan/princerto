<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use App\Models\Citizen;

class ProfileController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    /**
     * PUT /api/me
     * Updates the user's name and their citizen profile details.
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();
        $citizen = $user->citizen;

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'father_name' => ['nullable', 'string', 'max:255'],
            'dob' => ['required', 'date'], // DOB is mandatory now in the popup
            'address' => ['nullable', 'string', 'max:500'],
            'email' => ['nullable', 'email', 'max:255'],
        ]);

        // Update the user's name
        $user->name = $validated['name'];
        $user->save();

        // Update the associated citizen record if it exists
        if ($citizen) {
            $citizen->update([
                'name' => $validated['name'],
                'father_name' => $validated['father_name'],
                'dob' => $validated['dob'],
                'address' => $validated['address'],
                'email' => $validated['email'],
            ]);
        }

        return response()->json($user->fresh()->load('citizen'));
    }

    /**
     * PUT /api/me/phone
     * Updates the user's mobile number (login identifier).
     */
    public function changePhone(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'phone' => ['required', 'string', 'max:30', Rule::unique('users')->ignore($user->id)],
            'password' => ['required', 'string'],
        ]);

        if (!Hash::check($validated['password'], $user->password)) {
            return response()->json(['message' => 'Incorrect password.'], 422);
        }

        $user->phone = $validated['phone'];
        $user->save();

        if ($user->citizen) {
            $user->citizen->update(['mobile' => $validated['phone']]);
        }

        return response()->json(['message' => 'Mobile number updated successfully.']);
    }

    /**
     * PUT /api/me/password
     */
    public function changePassword(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'new_password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json(['message' => 'Current password is incorrect'], 422);
        }

        $user->password = Hash::make($validated['new_password']);
        $user->save();

        return response()->json(['message' => 'Password updated']);
    }
}
