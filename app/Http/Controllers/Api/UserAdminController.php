<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Middleware\RoleMiddleware;
use App\Http\Requests\UpdateUserRoleRequest;
use App\Http\Requests\StoreUserRequest;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserAdminController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        // Only ADMIN can access all endpoints here
        $this->middleware(RoleMiddleware::class . ':admin');
    }

    /**
     * GET /api/admin/users?q=raj&role=manager&per_page=10
     */
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

    /**
     * POST /api/admin/users
     * body: { name, email, password, role }
     */
    public function store(StoreUserRequest $request)
    {
        $data = $request->validated();

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => $data['role'],
        ]);

        return response()->json($user, 201);
    }

    /**
     * PATCH /api/admin/users/{user}/role
     * body: { role: "admin|manager|user" }
     */
    public function updateRole(UpdateUserRoleRequest $request, User $user)
    {
        // Prevent demoting yourself accidentally (optional safety)
        if ($request->user()->id === $user->id) {
            return response()->json(['message' => 'You cannot change your own role here'], 422);
        }

        $user->update(['role' => $request->validated()['role']]);

        // THE FIX IS HERE:
        // We call fresh() without arguments to get the latest model data from the database.
        // We no longer pass an array of columns, which was causing the error.
        return $user->fresh();
    }
}
