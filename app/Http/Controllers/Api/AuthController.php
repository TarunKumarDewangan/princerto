<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Citizen;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    public function register(Request $req)
    {
        $data = $req->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|unique:users,phone|digits:10',
            'password' => ['required', Password::min(6)],
        ]);

        // REVERTED: Logic now correctly creates a User and Citizen without the 'created_by_id' field.
        $user = DB::transaction(function () use ($data) {
            $user = User::create([
                'name' => $data['name'],
                'phone' => $data['phone'],
                'password' => Hash::make($data['password']),
                'role' => 'user',
            ]);

            $citizen = Citizen::create([
                'user_id' => $user->id,
                'name' => $user->name,
                'mobile' => $user->phone,
            ]);

            $user->citizen_id = $citizen->id;
            $user->save();

            return $user;
        });

        return response()->json(['message' => 'User created successfully.', 'user' => $user], 201);
    }

    public function login(Request $request)
    {
        if ($request->has('email')) {
            $credentials = $request->validate(['email' => 'required|email', 'password' => 'required|string',]);
            $user = User::where('email', $credentials['email'])->first();
        } else {
            $credentials = $request->validate(['phone' => 'required|string', 'password' => 'required|string',]);
            $user = User::where('phone', $credentials['phone'])->first();
        }

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 422);
        }

        $token = $user->createToken('api')->plainTextToken;
        return response()->json(['user' => $user, 'token' => $token]);
    }

    public function logout(Request $req)
    {
        $req->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out']);
    }
}
