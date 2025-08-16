<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Middleware\RoleMiddleware;
use App\Http\Requests\StoreDrivingLicenseRequest;
use App\Http\Requests\UpdateDrivingLicenseRequest;
use App\Models\DrivingLicense;
use App\Models\Citizen;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class DrivingLicenseController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        // Ensure middleware protects all write actions
        $this->middleware(RoleMiddleware::class . ':admin,manager')->only(['storeForCitizen', 'update', 'destroy']);
    }

    // GET /api/citizens/{citizen}/dl
    public function indexByCitizen(Citizen $citizen)
    {
        return DrivingLicense::where('citizen_id', $citizen->id)
            ->orderByDesc('id')
            ->paginate(10);
    }

    // GET /api/search/dl?dl_no=..&application_no=..
    public function search(Request $request)
    {
        $dl = trim((string) $request->query('dl_no', ''));
        $app = trim((string) $request->query('application_no', ''));
        $authUser = $request->user();

        $q = DrivingLicense::query()
            ->with('citizen:id,name,father_name,mobile')
            ->when($authUser->role === 'user', function (Builder $b) use ($authUser) {
                $b->whereHas('citizen', function (Builder $citizenQuery) use ($authUser) {
                    $citizenQuery->where('user_id', $authUser->id);
                });
            })
            ->when($dl !== '', fn(Builder $b) => $b->where('dl_no', 'like', "%{$dl}%"))
            ->when($app !== '', fn(Builder $b) => $b->where('application_no', 'like', "%{$app}%"))
            ->orderByDesc('id');

        return $q->paginate(10);
    }

    // POST /api/citizens/{citizen}/dl
    public function storeForCitizen(StoreDrivingLicenseRequest $request, Citizen $citizen)
    {
        $data = $request->validated();
        $data['citizen_id'] = $citizen->id;
        $rec = DrivingLicense::create($data);
        return response()->json($rec, 201);
    }

    // GET /api/dl/{drivingLicense} - Corrected parameter name
    public function show(DrivingLicense $drivingLicense)
    {
        return $drivingLicense->load('citizen:id,name,mobile');
    }

    /**
     * START: New/Updated Methods
     */

    // PUT/PATCH /api/dl/{drivingLicense} - Corrected parameter name
    public function update(UpdateDrivingLicenseRequest $request, DrivingLicense $drivingLicense)
    {
        $drivingLicense->update($request->validated());
        return $drivingLicense->fresh();
    }

    // DELETE /api/dl/{drivingLicense} - Corrected parameter name
    public function destroy(DrivingLicense $drivingLicense)
    {
        $drivingLicense->delete();
        return response()->json(['message' => 'Driving License record deleted successfully.']);
    }

    /**
     * END: New/Updated Methods
     */
}
