<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use App\Models\VehicleVltd;
use Illuminate\Http\Request;
use App\Http\Middleware\RoleMiddleware;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class VehicleVltdController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        $this->middleware(RoleMiddleware::class . ':admin,manager')->except(['indexByVehicle']);
    }

    public function indexByVehicle(Vehicle $vehicle)
    {
        return $vehicle->vltds()->orderBy('expiry_date', 'desc')->paginate(10);
    }

    public function storeForVehicle(Request $request, Vehicle $vehicle)
    {
        $data = $request->validate([
            'certificate_number' => 'required|string|max:255|unique:vehicle_vltds,certificate_number',
            'issue_date' => 'required|date',
            'expiry_date' => 'required|date|after_or_equal:issue_date',
            'file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
        ]);

        if ($request->hasFile('file')) {
            $path = $request->file('file')->store('vltd_documents', 'public');
            $data['file_path'] = $path;
        }

        $vltd = $vehicle->vltds()->create($data);
        return response()->json($vltd, 201);
    }

    public function update(Request $request, VehicleVltd $vltd)
    {
        $data = $request->validate([
            'certificate_number' => ['required', 'string', 'max:255', Rule::unique('vehicle_vltds')->ignore($vltd->id)],
            'issue_date' => 'required|date',
            'expiry_date' => 'required|date|after_or_equal:issue_date',
            'file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
        ]);

        if ($request->hasFile('file')) {
            if ($vltd->file_path) {
                Storage::disk('public')->delete($vltd->file_path);
            }
            $path = $request->file('file')->store('vltd_documents', 'public');
            $data['file_path'] = $path;
        }

        $vltd->update($data);
        return $vltd->fresh();
    }

    public function destroy(VehicleVltd $vltd)
    {
        if ($vltd->file_path) {
            Storage::disk('public')->delete($vltd->file_path);
        }
        $vltd->delete();
        return response()->json(['message' => 'VLTd record deleted successfully.']);
    }
}
