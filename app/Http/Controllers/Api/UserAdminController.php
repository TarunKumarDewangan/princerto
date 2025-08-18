<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Requests\UpdateUserRoleRequest;
use App\Models\User;
use App\Models\Citizen;
use App\Notifications\AdminPasswordResetNotification;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;

class UserAdminController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        // THE FIX IS HERE: The old middleware was removed.
        // Permissions are now correctly handled in routes/api.php.
    }

    public function index(Request $request)
    {
        $q = trim((string) $request->query('q', ''));
        $role = trim((string) $request->query('role', ''));
        $per = (int) ($request->query('per_page', 10));
        $query = User::query()
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

    public function store(StoreUserRequest $request)
    {
        $data = $request->validated();
        $adminUser = $request->user();

        $user = DB::transaction(function () use ($data, $adminUser) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'phone' => $data['phone'] ?? null,
                'password' => Hash::make($data['password']),
                'role' => $data['role'],
            ]);

            $citizen = Citizen::create([
                'user_id' => $user->id,
                'created_by_id' => $adminUser->id,
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

    public function update(UpdateUserRequest $request, User $user)
    {
        $loggedInUser = $request->user();
        if ($loggedInUser->role === 'manager' && ($user->role === 'admin' || $user->role === 'manager')) {
            abort(403, 'You do not have permission to edit this user.');
        }
        $user->update($request->validated());
        return $user->fresh();
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
