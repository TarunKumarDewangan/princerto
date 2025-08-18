<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();
        $citizen = $user->primaryCitizen;

        // Validation for all fields in the popup form
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:20'],
            'father_name' => ['nullable', 'string', 'max:255'],
            'dob' => ['required', 'date'],
            'address' => ['nullable', 'string', 'max:500'],
            'email' => ['nullable', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
        ]);

        // THE FIX IS HERE: Update both User and Citizen models to keep them in sync.

        // 1. Update the User model
        $user->name = $validated['name'];
        $user->phone = $validated['phone'];
        $user->email = $validated['email'];
        $user->save();

        // 2. Update the Citizen model
        if ($citizen) {
            $citizenData = $validated;
            // The 'mobile' column on citizens table corresponds to the 'phone' field from the form
            $citizenData['mobile'] = $validated['phone'];
            $citizen->update($citizenData);
        }

        return response()->json($user->fresh()->load('primaryCitizen'));
    }

    // other methods remain unchanged...
    public function changePhone(Request $request)
    { /* ... no changes ... */
    }
    public function changePassword(Request $request)
    { /* ... no changes ... */
    }
}
