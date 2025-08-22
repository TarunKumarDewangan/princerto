<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Middleware\RoleMiddleware;
use App\Models\Vehicle;
use App\Models\VehicleTax;
use Illuminate\Http\Request; // Import the base Request class
use Illuminate\Support\Facades\Storage; // Import Storage facade

class VehicleTaxController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        $this->middleware(RoleMiddleware::class . ':admin,manager')->only(['storeForVehicle', 'update', 'destroy']);
    }

    public function indexByVehicle(Vehicle $vehicle)
    {
        return VehicleTax::where('vehicle_id', $vehicle->id)
            ->orderByDesc('tax_upto')
            ->paginate(10);
    }

    // --- START OF MODIFIED CODE ---
    public function storeForVehicle(Request $request, Vehicle $vehicle)
    {
        $data = $request->validate([
            'vehicle_type' => 'nullable|string|max:50',
            'tax_mode' => 'required|string|max:50',
            'tax_from' => 'required|date',
            'tax_upto' => 'required|date|after_or_equal:tax_from',
            'file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048', // Validate the file
        ]);

        if ($request->hasFile('file')) {
            // Store the file in 'public/tax_documents' and get its path
            $path = $request->file('file')->store('tax_documents', 'public');
            $data['file_path'] = $path;
        }

        $data['vehicle_id'] = $vehicle->id;
        $rec = VehicleTax::create($data);
        return response()->json($rec, 201);
    }

    public function update(Request $request, VehicleTax $tax)
    {
        $data = $request->validate([
            'vehicle_type' => 'sometimes|required|string|max:50',
            'tax_mode' => 'sometimes|required|string|max:50',
            'tax_from' => 'sometimes|required|date',
            'tax_upto' => 'sometimes|required|date|after_or_equal:tax_from',
            'file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
        ]);

        if ($request->hasFile('file')) {
            // If a new file is uploaded, delete the old one first
            if ($tax->file_path) {
                Storage::disk('public')->delete($tax->file_path);
            }
            // Store the new file and update the path
            $path = $request->file('file')->store('tax_documents', 'public');
            $data['file_path'] = $path;
        }

        $tax->update($data);
        return $tax->fresh();
    }
    // --- END OF MODIFIED CODE ---

    public function destroy(VehicleTax $tax)
    {
        // --- START OF MODIFIED CODE ---
        // Also delete the associated file from storage
        if ($tax->file_path) {
            Storage::disk('public')->delete($tax->file_path);
        }
        $tax->delete();
        // --- END OF MODIFIED CODE ---
        return response()->json(['message' => 'Deleted']);
    }
}
