<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Middleware\RoleMiddleware;
use App\Models\DrivingLicense;
use App\Models\Citizen;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class DrivingLicenseController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        $this->middleware(RoleMiddleware::class . ':admin,manager')->only(['storeForCitizen', 'update', 'destroy']);
    }

    public function indexByCitizen(Citizen $citizen)
    {
        return DrivingLicense::where('citizen_id', $citizen->id)
            ->orderByDesc('id')
            ->paginate(10);
    }

    public function search(Request $request)
    {
        $dl = trim((string) $request->query('dl_no', ''));
        $app = trim((string) $request->query('application_no', ''));
        $authUser = $request->user();

        $q = DrivingLicense::query()
            ->with('citizen:id,name,mobile')
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

    public function storeForCitizen(Request $request, Citizen $citizen)
    {
        $data = $request->validate([
            'dl_no' => 'required|string|max:100|unique:driving_licenses,dl_no',
            'application_no' => 'nullable|string|max:150',
            'issue_date' => 'nullable|date',
            'expiry_date' => 'nullable|date|after_or_equal:issue_date',
            'vehicle_class' => 'nullable|string|max:255',
            'office' => 'nullable|string|max:150',
            'file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
        ]);

        if ($request->hasFile('file')) {
            $path = $request->file('file')->store('dl_documents', 'public');
            $data['file_path'] = $path;
        }

        $data['citizen_id'] = $citizen->id;
        $rec = DrivingLicense::create($data);
        return response()->json($rec, 201);
    }

    // --- START OF THE FIX (1/3) ---
    // The variable name is changed from $drivingLicense to $dl to match the route parameter {dl}.
    public function show(DrivingLicense $dl)
    {
        return $dl->load('citizen:id,name,mobile');
    }
    // --- END OF THE FIX ---

    // --- START OF THE FIX (2/3) ---
    // The variable name is changed from $drivingLicense to $dl.
    public function update(Request $request, DrivingLicense $dl)
    {
        // The variable inside the method is also updated to use $dl.
        $dlId = $dl->id;
        $data = $request->validate([
            'dl_no' => ['sometimes', 'required', 'string', 'max:100', Rule::unique('driving_licenses', 'dl_no')->ignore($dlId)],
            'application_no' => 'sometimes|nullable|string|max:150',
            'issue_date' => 'sometimes|nullable|date',
            'expiry_date' => 'sometimes|nullable|date|after_or_equal:issue_date',
            'vehicle_class' => 'sometimes|nullable|string|max:255',
            'office' => 'sometimes|nullable|string|max:150',
            'file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
        ]);

        if ($request->hasFile('file')) {
            if ($dl->file_path) { // Using the corrected variable
                Storage::disk('public')->delete($dl->file_path);
            }
            $path = $request->file('file')->store('dl_documents', 'public');
            $data['file_path'] = $path;
        }

        $dl->update($data); // Using the corrected variable
        return $dl->fresh();
    }
    // --- END OF THE FIX ---

    // --- START OF THE FIX (3/3) ---
    // The variable name is changed from $drivingLicense to $dl.
    public function destroy(DrivingLicense $dl)
    {
        // The variable inside the method is also updated to use $dl.
        if ($dl->file_path) {
            Storage::disk('public')->delete($dl->file_path);
        }
        $dl->delete(); // This will now delete the correct record from the database.
        return response()->json(['message' => 'Driving License record deleted successfully.']);
    }
    // --- END OF THE FIX ---
}
