<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Middleware\RoleMiddleware;
use App\Models\LearnerLicense;
use App\Models\Citizen;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class LearnerLicenseController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        $this->middleware(RoleMiddleware::class . ':admin,manager')->only(['storeForCitizen', 'update', 'destroy']);
    }

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

    // --- START OF THE FIX (1/3) ---
    // The variable name is changed from $learnerLicense to $ll to match the route parameter {ll}.
    public function show(LearnerLicense $ll)
    {
        return $ll->load('citizen:id,name,mobile');
    }
    // --- END OF THE FIX ---

    // --- START OF THE FIX (2/3) ---
    // The variable name is changed from $learnerLicense to $ll.
    public function update(Request $request, LearnerLicense $ll)
    {
        $llId = $ll->id; // Using the corrected variable

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
            if ($ll->file_path) { // Using the corrected variable
                Storage::disk('public')->delete($ll->file_path);
            }
            $path = $request->file('file')->store('ll_documents', 'public');
            $data['file_path'] = $path;
        }

        $ll->update($data); // Using the corrected variable

        return $ll->fresh();
    }
    // --- END OF THE FIX ---

    // --- START OF THE FIX (3/3) ---
    // The variable name is changed from $learnerLicense to $ll.
    public function destroy(LearnerLicense $ll)
    {
        try {
            if ($ll->file_path) { // Using the corrected variable
                try {
                    Storage::disk('public')->delete($ll->file_path);
                } catch (\Throwable $e) {
                    Log::warning('LL file delete failed: ' . $e->getMessage());
                }
            }

            $ll->delete(); // This will now delete the correct record from the database.

            return response()->json(['message' => 'Learner License record deleted successfully.']);

        } catch (QueryException $e) {
            if ((int) $e->getCode() === 23000) {
                return response()->json([
                    'message' => 'Cannot delete this record because it is referenced by other records.'
                ], 409);
            }
            Log::error('LL Delete QueryException: ' . $e->getMessage());
            return response()->json(['message' => 'Delete failed due to a database error.'], 500);

        } catch (\Throwable $e) {
            Log::error('LL Delete Failed: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to delete record. Please check server logs.'], 500);
        }
    }
    // --- END OF THE FIX ---
}
