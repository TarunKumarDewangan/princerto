<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Middleware\RoleMiddleware;
use App\Models\LearnerLicense;
use App\Models\Citizen;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class LearnerLicenseController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        $this->middleware(RoleMiddleware::class . ':admin,manager')->only(['storeForCitizen', 'update', 'destroy']);
    }

    // --- START OF THE FIX ---
    // This method was missing its implementation.
    public function indexByCitizen(Citizen $citizen)
    {
        return LearnerLicense::where('citizen_id', $citizen->id)
            ->orderByDesc('id')
            ->paginate(10);
    }

    public function search(Request $request)
    {
        $ll = trim((string) $request->query('ll_no', ''));
        $app = trim((string) $request->query('application_no', ''));
        $authUser = $request->user();

        $q = LearnerLicense::query()
            ->with('citizen:id,name,mobile')
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
    // --- END OF THE FIX ---

    public function storeForCitizen(Request $request, Citizen $citizen)
    {
        $data = $request->validate([
            'll_no' => 'required|string|max:100|unique:learner_licenses,ll_no',
            'application_no' => 'nullable|string|max:150',
            'issue_date' => 'nullable|date',
            'expiry_date' => 'nullable|date|after_or_equal:issue_date',
            'vehicle_class' => 'nullable|string|max:255',
            'office' => 'nullable|string|max:150',
            'file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
        ]);

        if ($request->hasFile('file')) {
            $path = $request->file('file')->store('ll_documents', 'public');
            $data['file_path'] = $path;
        }

        $data['citizen_id'] = $citizen->id;
        $rec = LearnerLicense::create($data);
        return response()->json($rec, 201);
    }

    public function show(LearnerLicense $learnerLicense)
    {
        return $learnerLicense->load('citizen:id,name,mobile');
    }

    public function update(Request $request, LearnerLicense $learnerLicense)
    {
        $llId = $learnerLicense->id;
        $data = $request->validate([
            'll_no' => ['sometimes', 'required', 'string', 'max:100', Rule::unique('learner_licenses', 'll_no')->ignore($llId)],
            'application_no' => 'sometimes|nullable|string|max:150',
            'issue_date' => 'sometimes|nullable|date',
            'expiry_date' => 'sometimes|nullable|date|after_or_equal:issue_date',
            'vehicle_class' => 'sometimes|nullable|string|max:255',
            'office' => 'sometimes|nullable|string|max:150',
            'file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
        ]);

        if ($request->hasFile('file')) {
            if ($learnerLicense->file_path) {
                Storage::disk('public')->delete($learnerLicense->file_path);
            }
            $path = $request->file('file')->store('ll_documents', 'public');
            $data['file_path'] = $path;
        }

        $learnerLicense->update($data);
        return $learnerLicense->fresh();
    }

    public function destroy(LearnerLicense $learnerLicense)
    {
        if ($learnerLicense->file_path) {
            Storage::disk('public')->delete($learnerLicense->file_path);
        }
        $learnerLicense->delete();
        return response()->json(['message' => 'Learner License record deleted successfully.']);
    }
}
