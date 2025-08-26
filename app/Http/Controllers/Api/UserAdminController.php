<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateUserRoleRequest;
use App\Models\User;
use App\Models\Citizen;
use App\Notifications\AdminPasswordResetNotification;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password as PasswordRule;

class UserAdminController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    public function index(Request $request)
    {
        $q = trim((string) $request->query('q', ''));
        $role = trim((string) $request->query('role', ''));
        $per = (int) ($request->query('per_page', 10));
        $query = User::query()
            ->with('branch')
            ->when($q !== '', function (Builder $b) use ($q) {
                $b->where(function (Builder $x) use ($q) {
                    $x->where('name', 'like', "%{$q}%")
                        ->orWhere('email', 'like', "%{$q}%")
                        ->orWhere('phone', 'like', "%{$q}%");
                });
            })
            ->when($role !== '', fn(Builder $b) => $b->where('role', $role))
            ->orderBy('name');
        return $query->paginate($per);
    }

    public function store(Request $request)
    {
        // --- VALIDATION RULES UPDATED ---
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'string', 'email', 'max:255', 'unique:users'],
            'phone' => ['required', 'string', 'max:20', 'unique:users,phone'],
            'password' => ['required', 'string', PasswordRule::min(8)],
            'role' => ['required', 'string', 'in:manager,user'],
            'branch_id' => ['nullable', 'exists:branches,id'],
        ]);

        $user = DB::transaction(function () use ($data) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'] ?? null,
                'phone' => $data['phone'],
                'password' => Hash::make($data['password']),
                'role' => $data['role'],
                'branch_id' => $data['role'] === 'manager' ? ($data['branch_id'] ?: null) : null,
            ]);

            $citizen = Citizen::create([
                'user_id' => $user->id,
                // 'created_by_id' was removed in a previous step, this is correct
                'name' => $user->name,
                'mobile' => $user->phone,
                'email' => $user->email,
            ]);

            $user->citizen_id = $citizen->id;
            $user->save();

            return $user;
        });

        return response()->json($user, 201);
    }

    public function update(Request $request, User $user)
    {
        $loggedInUser = $request->user();
        if ($loggedInUser->role === 'manager' && ($user->role === 'admin' || $user->role === 'manager')) {
            abort(403, 'You do not have permission to edit this user.');
        }

        // --- VALIDATION RULES UPDATED ---
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'phone' => ['required', 'string', 'max:20', Rule::unique('users')->ignore($user->id)],
            'branch_id' => ['nullable', 'exists:branches,id'],
        ]);

        // Use a transaction to update both user and their primary citizen profile
        DB::transaction(function () use ($user, $data) {
            if ($user->role === 'manager') {
                $user->branch_id = $data['branch_id'] ?? null;
            } else {
                $user->branch_id = null;
            }

            $user->name = $data['name'];
            $user->email = $data['email'] ?? null;
            $user->phone = $data['phone'];
            $user->save();

            // Sync changes with the primary citizen profile
            if ($user->primaryCitizen) {
                $user->primaryCitizen->update([
                    'name' => $user->name,
                    'email' => $user->email,
                    'mobile' => $user->phone,
                ]);
            }
        });

        return $user->fresh('branch');
    }

    public function destroy(Request $request, User $user)
    {
        $loggedInUser = $request->user();
        if ($loggedInUser->id === $user->id) {
            return response()->json(['message' => 'You cannot delete your own account.'], 422);
        }
        if ($loggedInUser->role === 'manager' && ($user->role === 'admin' || $user->role === 'manager')) {
            abort(403, 'You do not have permission to delete this user.');
        }
        $user->delete();
        return response()->json(['message' => 'User deleted successfully.']);
    }

    public function sendResetLink(Request $request, User $user)
    {
        $loggedInUser = $request->user();
        if ($loggedInUser->role === 'manager' && ($user->role === 'admin' || $user->role === 'manager')) {
            abort(403, 'You do not have permission to reset this user\'s password.');
        }
        $token = Password::broker()->createToken($user);
        $frontendUrl = rtrim(config('app.frontend_url', 'http://localhost:5173'), '/');
        $resetUrl = "{$frontendUrl}/reset-password?token={$token}&email=" . urlencode($user->email);
        $user->notify(new AdminPasswordResetNotification($resetUrl));
        return response()->json(['message' => 'Password reset link sent to ' . $user->email]);
    }

    public function updateRole(UpdateUserRoleRequest $request, User $user)
    {
        $loggedInUser = $request->user();
        if ($loggedInUser->id === $user->id) {
            return response()->json(['message' => 'You cannot change your own role here'], 422);
        }
        if ($loggedInUser->role === 'manager') {
            if ($user->role === 'admin' || $user->role === 'manager') {
                abort(403, 'You do not have permission to change this user\'s role.');
            }
            if ($request->validated()['role'] === 'admin') {
                abort(403, 'You do not have permission to promote a user to Admin.');
            }
        }
        $user->update(['role' => $request->validated()['role']]);
        return $user->fresh();
    }
}
