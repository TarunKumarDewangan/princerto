<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use App\Models\VehiclePermit;
use Illuminate\Http\Request;
use App\Http\Middleware\RoleMiddleware;
use Illuminate\Validation\Rule;

class VehiclePermitController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        $this->middleware(RoleMiddleware::class . ':admin,manager')->except(['indexByVehicle']);
    }

    public function indexByVehicle(Vehicle $vehicle)
    {
        return $vehicle->permits()->orderBy('expiry_date', 'desc')->paginate(10);
    }

    public function storeForVehicle(Request $request, Vehicle $vehicle)
    {
        $data = $request->validate([
            'permit_number' => 'required|string|max:255|unique:vehicle_permits,permit_number',
            'issue_date' => 'required|date',
            'expiry_date' => 'required|date|after_or_equal:issue_date',
        ]);
        $permit = $vehicle->permits()->create($data);
        return response()->json($permit, 201);
    }

    public function update(Request $request, VehiclePermit $permit)
    {
        $data = $request->validate([
            'permit_number' => ['required', 'string', 'max:255', Rule::unique('vehicle_permits')->ignore($permit->id)],
            'issue_date' => 'required|date',
            'expiry_date' => 'required|date|after_or_equal:issue_date',
        ]);
        $permit->update($data);
        return $permit->fresh();
    }

    public function destroy(VehiclePermit $permit)
    {
        $permit->delete();
        return response()->json(['message' => 'Permit record deleted successfully.']);
    }
}
