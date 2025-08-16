<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use App\Models\VehiclePucc;
use Illuminate\Http\Request;
use App\Http\Middleware\RoleMiddleware;
use Illuminate\Validation\Rule;

class VehiclePuccController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        // Protect all write actions
        $this->middleware(RoleMiddleware::class . ':admin,manager')->except(['indexByVehicle']);
    }

    /**
     * Display a listing of the PUCCs for a specific vehicle.
     * GET /api/vehicles/{vehicle}/puccs
     */
    public function indexByVehicle(Vehicle $vehicle)
    {
        return $vehicle->puccs()->orderBy('valid_until', 'desc')->paginate(10);
    }

    /**
     * Store a newly created PUCC for a specific vehicle.
     * POST /api/vehicles/{vehicle}/puccs
     */
    public function storeForVehicle(Request $request, Vehicle $vehicle)
    {
        $data = $request->validate([
            'pucc_number' => 'required|string|max:255|unique:vehicle_puccs,pucc_number',
            'valid_from' => 'required|date',
            'valid_until' => 'required|date|after_or_equal:valid_from',
            'status' => 'required|string|in:active,expired',
        ]);

        $pucc = $vehicle->puccs()->create($data);

        return response()->json($pucc, 201);
    }

    /**
     * Update the specified PUCC record in storage.
     * PUT /api/puccs/{pucc}
     */
    public function update(Request $request, VehiclePucc $pucc)
    {
        $data = $request->validate([
            'pucc_number' => ['required', 'string', 'max:255', Rule::unique('vehicle_puccs')->ignore($pucc->id)],
            'valid_from' => 'required|date',
            'valid_until' => 'required|date|after_or_equal:valid_from',
            'status' => 'required|string|in:active,expired',
        ]);

        $pucc->update($data);

        return $pucc->fresh();
    }

    /**
     * Remove the specified PUCC record from storage.
     * DELETE /api/puccs/{pucc}
     */
    public function destroy(VehiclePucc $pucc)
    {
        $pucc->delete();

        return response()->json(['message' => 'PUCC record deleted successfully.']);
    }
}
