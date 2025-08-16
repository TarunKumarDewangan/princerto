<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Citizen;
use App\Models\ServiceRequest;
use App\Models\User;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    public function getStats(Request $request)
    {
        $totalUsers = User::count();
        $totalCitizens = Citizen::count();
        $pendingRequests = ServiceRequest::where('status', 'pending')->count();

        return response()->json([
            'total_users' => $totalUsers,
            'total_citizens' => $totalCitizens,
            'pending_requests' => $pendingRequests,
        ]);
    }

    public function getUserStats(Request $request)
    {
        $user = $request->user();

        $pendingRequestsCount = ServiceRequest::where('user_id', $user->id)
            ->where('status', 'pending')
            ->count();

        // THE FIX IS HERE: Calculate stats based on ALL citizens created by the user.
        $createdCitizenIds = $user->createdCitizens()->pluck('id');

        if ($createdCitizenIds->isEmpty()) {
            return response()->json([
                'll_count' => 0,
                'dl_count' => 0,
                'vehicle_count' => 0,
                'pending_requests_count' => $pendingRequestsCount,
            ]);
        }

        $llCount = \App\Models\LearnerLicense::whereIn('citizen_id', $createdCitizenIds)->count();
        $dlCount = \App\Models\DrivingLicense::whereIn('citizen_id', $createdCitizenIds)->count();
        $vehicleCount = \App\Models\Vehicle::whereIn('citizen_id', $createdCitizenIds)->count();

        return response()->json([
            'll_count' => $llCount,
            'dl_count' => $dlCount,
            'vehicle_count' => $vehicleCount,
            'pending_requests_count' => $pendingRequestsCount,
        ]);
    }
}
