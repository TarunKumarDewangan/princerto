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

        // REVERTED: We now correctly check for the 'primaryCitizen' relationship.
        $citizen = $user->primaryCitizen;

        $pendingRequestsCount = ServiceRequest::where('user_id', $user->id)
            ->where('status', 'pending')
            ->count();

        if (!$citizen) {
            return response()->json([
                'll_count' => 0,
                'dl_count' => 0,
                'vehicle_count' => 0,
                'pending_requests_count' => $pendingRequestsCount,
            ]);
        }

        // REVERTED: The stats are now correctly calculated based on the single primary citizen profile.
        $llCount = $citizen->learnerLicenses()->count();
        $dlCount = $citizen->drivingLicenses()->count();
        $vehicleCount = $citizen->vehicles()->count();

        return response()->json([
            'll_count' => $llCount,
            'dl_count' => $dlCount,
            'vehicle_count' => $vehicleCount,
            'pending_requests_count' => $pendingRequestsCount,
        ]);
    }
}
