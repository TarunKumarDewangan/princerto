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
        $authUser = $request->user()->load('branch');

        // --- START OF THE FIX ---
        // Default to fetching all records
        $citizenQuery = Citizen::query();
        $userQuery = User::query();
        $serviceRequestQuery = ServiceRequest::query();

        // If the logged-in user is a 'manager'...
        if ($authUser->role === 'manager') {
            // ...and they are assigned to a specific branch that is NOT 'Dhamtari'...
            if ($authUser->branch_id && $authUser->branch?->name !== 'Dhamtari') {

                // ...get all user IDs from that same branch...
                $branchUserIds = User::where('branch_id', $authUser->branch_id)->pluck('id');

                // ...and apply filters to only count records related to those users.
                $citizenQuery->whereIn('user_id', $branchUserIds);
                $userQuery->where('branch_id', $authUser->branch_id); // Filter users by the branch itself
                $serviceRequestQuery->whereIn('user_id', $branchUserIds);
            }
            // If the manager's branch IS 'Dhamtari' or they have no branch, no filters are applied.
        }
        // Super Admins and Admins will also not have filters applied, so they see system-wide totals.

        // Now, get the final counts from the (potentially filtered) queries.
        $totalUsers = $userQuery->count();
        $totalCitizens = $citizenQuery->count();
        $pendingRequests = $serviceRequestQuery->where('status', 'pending')->count();
        // --- END OF THE FIX ---

        return response()->json([
            'total_users' => $totalUsers,
            'total_citizens' => $totalCitizens,
            'pending_requests' => $pendingRequests,
        ]);
    }

    public function getUserStats(Request $request)
    {
        $user = $request->user();

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
