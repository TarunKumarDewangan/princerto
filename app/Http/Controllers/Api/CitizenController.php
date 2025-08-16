<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Middleware\RoleMiddleware;
use App\Http\Requests\StoreCitizenRequest;
use App\Http\Requests\UpdateCitizenRequest;
use App\Models\Citizen;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class CitizenController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        $this->middleware(RoleMiddleware::class . ':admin,manager')
            ->only(['update', 'destroy']);
    }

    public function index(Request $request)
    {
        $q = trim((string) $request->query('q', ''));
        $mob = trim((string) $request->query('mobile', ''));
        $per = (int) ($request->query('per_page', 10));

        $authUser = $request->user();

        $query = Citizen::query()
            ->where('user_id', $authUser->id)
            ->when($q !== '', function (Builder $b) use ($q) {
                $b->where(function (Builder $x) use ($q) {
                    $x->where('name', 'like', "%{$q}%")
                        ->orWhere('relation_name', 'like', "%{$q}%")
                        ->orWhere('email', 'like', "%{$q}%");
                });
            })
            ->when($mob !== '', fn(Builder $b) => $b->where('mobile', 'like', "%{$mob}%"))
            ->withCount(['learnerLicenses', 'drivingLicenses', 'vehicles'])
            ->orderByDesc('id');

        return $query->paginate($per);
    }

    public function store(StoreCitizenRequest $request)
    {
        $data = $request->validated();
        $user = $request->user();

        $data['user_id'] = $user->id;

        $citizen = Citizen::create($data);

        if ($request->input('is_self') === true && !$user->citizen_id) {
            $user->citizen_id = $citizen->id;
            $user->save();
        }

        return response()->json($citizen, 201);
    }

    public function show(Citizen $citizen, Request $request)
    {
        $authUser = $request->user();

        if ($authUser->role === 'user' && $citizen->user_id !== $authUser->id) {
            abort(403, 'This action is unauthorized.');
        }

        $citizen->load([
            'learnerLicenses:id,citizen_id,ll_no,expiry_date',
            'drivingLicenses:id,citizen_id,dl_no,expiry_date',
            'vehicles:id,citizen_id,registration_no'
        ]);
        return $citizen;
    }

    // --- START OF NEW METHOD ---
    /**
     * GET /api/citizens/{citizen}/all-details
     * Gathers all related data for a citizen in one efficient query.
     */
    public function getAllDetails(Citizen $citizen, Request $request)
    {
        $authUser = $request->user();
        if ($authUser->role === 'user' && $citizen->user_id !== $authUser->id) {
            abort(403, 'This action is unauthorized.');
        }

        // Eager load everything in one go.
        $citizen->load([
            'learnerLicenses',
            'drivingLicenses',
            'vehicles.insurances',
            'vehicles.puccs',
            'vehicles.fitnesses',
            'vehicles.permits',
            'vehicles.vltds',
            'vehicles.speedGovernors',
            'vehicles.taxes'
        ]);

        return $citizen;
    }
    // --- END OF NEW METHOD ---

    public function update(UpdateCitizenRequest $request, Citizen $citizen)
    {
        $citizen->update($request->validated());
        return $citizen->fresh();
    }

    public function destroy(Citizen $citizen)
    {
        $citizen->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
