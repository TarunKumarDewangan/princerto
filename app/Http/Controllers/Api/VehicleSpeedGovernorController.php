<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use App\Models\VehicleSpeedGovernor;
use Illuminate\Http\Request;
use App\Http\Middleware\RoleMiddleware;
use Illuminate\Validation\Rule;

class VehicleSpeedGovernorController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        $this->middleware(RoleMiddleware::class . ':admin,manager')->except(['indexByVehicle']);
    }

    public function indexByVehicle(Vehicle $vehicle)
    {
        return $vehicle->speedGovernors()->orderBy('expiry_date', 'desc')->paginate(10);
    }

    public function storeForVehicle(Request $request, Vehicle $vehicle)
    {
        $data = $request->validate([
            'certificate_number' => 'required|string|max:255|unique:vehicle_speed_governors,certificate_number',
            'issue_date' => 'required|date',
            'expiry_date' => 'required|date|after_or_equal:issue_date',
        ]);
        $speedGovernor = $vehicle->speedGovernors()->create($data);
        return response()->json($speedGovernor, 201);
    }

    public function update(Request $request, VehicleSpeedGovernor $speedGovernor)
    {
        $data = $request->validate([
            'certificate_number' => ['required', 'string', 'max:255', Rule::unique('vehicle_speed_governors')->ignore($speedGovernor->id)],
            'issue_date' => 'required|date',
            'expiry_date' => 'required|date|after_or_equal:issue_date',
        ]);
        $speedGovernor->update($data);
        return $speedGovernor->fresh();
    }

    public function destroy(VehicleSpeedGovernor $speedGovernor)
    {
        $speedGovernor->delete();
        return response()->json(['message' => 'Speed Governor record deleted successfully.']);
    }
}
