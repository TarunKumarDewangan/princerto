<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use App\Models\VehicleVltd;
use Illuminate\Http\Request;
use App\Http\Middleware\RoleMiddleware;
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
        ]);
        $vltd = $vehicle->vltds()->create($data);
        return response()->json($vltd, 201);
    }

    public function update(Request $request, VehicleVltd $vltd)
    {
        $data = $request->validate([
            'certificate_number' => ['required', 'string', 'max:255', Rule::unique('vehicle_vltds')->ignore($vltd->id)],
            'issue_date' => 'required|date',
            'expiry_date' => 'required|date|after_or_equal:issue_date',
        ]);
        $vltd->update($data);
        return $vltd->fresh();
    }

    public function destroy(VehicleVltd $vltd)
    {
        $vltd->delete();
        return response()->json(['message' => 'VLT a record deleted successfully.']);
    }
}
