<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Middleware\RoleMiddleware;
use App\Http\Requests\StoreVehicleTaxRequest;
use App\Http\Requests\UpdateVehicleTaxRequest;
use App\Models\Vehicle;
use App\Models\VehicleTax;
use Illuminate\Http\Request;

class VehicleTaxController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        $this->middleware(RoleMiddleware::class . ':admin,manager')->only(['store', 'update', 'destroy']);
    }

    // GET /api/vehicles/{vehicle}/taxes
    public function indexByVehicle(Vehicle $vehicle)
    {
        return VehicleTax::where('vehicle_id', $vehicle->id)
            ->orderByDesc('tax_upto')
            ->paginate(10);
    }

    // POST /api/vehicles/{vehicle}/taxes
    public function storeForVehicle(StoreVehicleTaxRequest $request, Vehicle $vehicle)
    {
        $data = $request->validated();
        $data['vehicle_id'] = $vehicle->id;
        $rec = VehicleTax::create($data);
        return response()->json($rec, 201);
    }

    // PUT/PATCH /api/taxes/{tax}
    public function update(UpdateVehicleTaxRequest $request, VehicleTax $tax)
    {
        $tax->update($request->validated());
        return $tax->fresh();
    }

    // DELETE /api/taxes/{tax}
    public function destroy(VehicleTax $tax)
    {
        $tax->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
