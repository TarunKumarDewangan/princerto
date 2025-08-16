<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Middleware\RoleMiddleware;
use App\Http\Requests\StoreLearnerLicenseRequest;
use App\Http\Requests\UpdateLearnerLicenseRequest;
use App\Models\LearnerLicense;
use App\Models\Citizen;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class LearnerLicenseController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        $this->middleware(RoleMiddleware::class . ':admin,manager')->only(['storeForCitizen', 'update', 'destroy']);
    }

    // GET /api/citizens/{citizen}/ll
    public function indexByCitizen(Citizen $citizen)
    {
        return LearnerLicense::where('citizen_id', $citizen->id)
            ->orderByDesc('id')
            ->paginate(10);
    }

    // GET /api/search/ll?ll_no=..&application_no=..
    public function search(Request $request)
    {
        $ll = trim((string) $request->query('ll_no', ''));
        $app = trim((string) $request->query('application_no', ''));
        $authUser = $request->user();

        $q = LearnerLicense::query()
            ->with('citizen:id,name,father_name,mobile')
            ->when($authUser->role === 'user', function (Builder $b) use ($authUser) {
                $b->whereHas('citizen', function (Builder $citizenQuery) use ($authUser) {
                    $citizenQuery->where('user_id', $authUser->id);
                });
            })
            ->when($ll !== '', fn(Builder $b) => $b->where('ll_no', 'like', "%{$ll}%"))
            ->when($app !== '', fn(Builder $b) => $b->where('application_no', 'like', "%{$app}%"))
            ->orderByDesc('id');

        return $q->paginate(10);
    }

    // POST /api/citizens/{citizen}/ll
    public function storeForCitizen(StoreLearnerLicenseRequest $request, Citizen $citizen)
    {
        $data = $request->validated();
        $data['citizen_id'] = $citizen->id;
        $rec = LearnerLicense::create($data);
        return response()->json($rec, 201);
    }

    // GET /api/ll/{learnerLicense}
    public function show(LearnerLicense $learnerLicense)
    {
        return $learnerLicense->load('citizen:id,name,mobile');
    }

    // PUT/PATCH /api/ll/{learnerLicense}
    public function update(UpdateLearnerLicenseRequest $request, LearnerLicense $learnerLicense)
    {
        $learnerLicense->update($request->validated());
        return $learnerLicense->fresh();
    }

    // DELETE /api/ll/{learnerLicense}
    public function destroy(LearnerLicense $learnerLicense)
    {
        $learnerLicense->delete();
        return response()->json(['message' => 'Learner License record deleted successfully.']);
    }
}
