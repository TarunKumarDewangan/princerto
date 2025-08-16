<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Citizen;
use App\Models\LearnerLicense;
use App\Models\DrivingLicense;
use App\Models\Vehicle;
use App\Http\Middleware\RoleMiddleware;

class GlobalSearchController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        $this->middleware(RoleMiddleware::class . ':admin,manager');
    }

    /**
     * Handle a global search request.
     * GET /api/global-search?query=...
     */
    public function search(Request $request)
    {
        $query = $request->validate(['query' => 'required|string|min:2'])['query'];

        $results = [];

        // Search Citizens by name or mobile
        $citizens = Citizen::where('name', 'LIKE', "%{$query}%")
            ->orWhere('mobile', 'LIKE', "%{$query}%")
            ->limit(5)
            ->get();

        foreach ($citizens as $citizen) {
            $results[] = [
                'type' => 'Citizen',
                'title' => $citizen->name,
                'description' => 'Mobile: ' . $citizen->mobile,
                'url' => '/citizens/' . $citizen->id,
            ];
        }

        // Search Learner Licenses by LL No OR Application No
        $lls = LearnerLicense::with('citizen:id,name')
            ->where('ll_no', 'LIKE', "%{$query}%")
            // THE CHANGE IS HERE: Added search for application_no
            ->orWhere('application_no', 'LIKE', "%{$query}%")
            ->limit(5)
            ->get();

        foreach ($lls as $ll) {
            $results[] = [
                'type' => 'Learner License',
                'title' => $ll->ll_no . ($ll->application_no ? " / " . $ll->application_no : ""),
                'description' => 'Holder: ' . $ll->citizen->name,
                'url' => '/citizens/' . $ll->citizen_id,
            ];
        }

        // Search Driving Licenses by DL No OR Application No
        $dls = DrivingLicense::with('citizen:id,name')
            ->where('dl_no', 'LIKE', "%{$query}%")
            // THE CHANGE IS HERE: Added search for application_no
            ->orWhere('application_no', 'LIKE', "%{$query}%")
            ->limit(5)
            ->get();

        foreach ($dls as $dl) {
            $results[] = [
                'type' => 'Driving License',
                'title' => $dl->dl_no . ($dl->application_no ? " / " . $dl->application_no : ""),
                'description' => 'Holder: ' . $dl->citizen->name,
                'url' => '/citizens/' . $dl->citizen_id,
            ];
        }

        // Search Vehicles by Registration No
        $vehicles = Vehicle::with('citizen:id,name')
            ->where('registration_no', 'LIKE', "%{$query}%")
            ->limit(5)
            ->get();

        foreach ($vehicles as $vehicle) {
            $results[] = [
                'type' => 'Vehicle',
                'title' => $vehicle->registration_no,
                'description' => 'Owner: ' . $vehicle->citizen->name,
                'url' => '/citizens/' . $vehicle->citizen_id,
            ];
        }

        // To avoid duplicate results (e.g., if LL No and App No both match the query)
        // we can unique the results based on the URL.
        $uniqueResults = collect($results)->unique('url')->values()->all();

        return response()->json($uniqueResults);
    }
}
