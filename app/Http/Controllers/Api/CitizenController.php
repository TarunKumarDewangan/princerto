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
        $this->middleware(RoleMiddleware::class . ':admin,manager')->only(['update', 'destroy']);
    }

    public function index(Request $request)
    {
        $q = trim((string) $request->query('q', ''));
        $mob = trim((string) $request->query('mobile', ''));
        $per = (int) ($request->query('per_page', 10));
        $authUser = $request->user();

        // REVERTED: Stable query logic that uses the 'user' relationship.
        $query = Citizen::query()
            ->with('user:id,name') // We now get the creator from the user_id link
            ->when($authUser->role === 'user', function (Builder $b) use ($authUser) {
                // Regular users can only see profiles they have created.
                $b->where('user_id', $authUser->id);
            })
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
        $loggedInUser = $request->user();

        // REVERTED: This now correctly sets the creator as the logged-in user.
        $data['user_id'] = $loggedInUser->id;

        $citizen = Citizen::create($data);

        // This logic is for the "Myself" profile creation scenario
        if ($request->input('is_self') === true && !$loggedInUser->citizen_id) {
            $loggedInUser->citizen_id = $citizen->id;
            $loggedInUser->save();
        }

        return response()->json($citizen, 201);
    }

    public function show(Citizen $citizen, Request $request)
    {
        $authUser = $request->user();
        if ($authUser->role === 'user' && $citizen->user_id !== $authUser->id) {
            abort(403, 'This action is unauthorized.');
        }

        $citizen->load(['learnerLicenses', 'drivingLicenses', 'vehicles']);
        return $citizen;
    }

    public function getAllDetails(Citizen $citizen, Request $request)
    {
        $authUser = $request->user();
        if ($authUser->role === 'user' && $citizen->user_id !== $authUser->id) {
            abort(403, 'This action is unauthorized.');
        }

        $citizen->load(['learnerLicenses', 'drivingLicenses', 'vehicles.insurances', 'vehicles.puccs', 'vehicles.fitnesses', 'vehicles.permits', 'vehicles.vltds', 'vehicles.speedGovernors', 'vehicles.taxes']);
        return $citizen;
    }

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
