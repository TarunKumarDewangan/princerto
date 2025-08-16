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

    public function search(Request $request)
    {
        $query = $request->validate(['query' => 'required|string|min:2'])['query'];

        $results = [];

        // Search Citizens
        $citizens = Citizen::where('name', 'LIKE', "%{$query}%")
            ->orWhere('mobile', 'LIKE', "%{$query}%")
            ->limit(5)
            ->get();

        foreach ($citizens as $citizen) {
            $results[] = [
                'unique_key' => 'citizen-' . $citizen->id, // THE FIX IS HERE
                'type' => 'Citizen',
                'title' => $citizen->name,
                'description' => 'Mobile: ' . $citizen->mobile,
                'url' => '/citizens/' . $citizen->id,
            ];
        }

        // Search Learner Licenses
        $lls = LearnerLicense::with('citizen:id,name')
            ->where('ll_no', 'LIKE', "%{$query}%")
            ->orWhere('application_no', 'LIKE', "%{$query}%")
            ->limit(5)
            ->get();

        foreach ($lls as $ll) {
            $results[] = [
                'unique_key' => 'll-' . $ll->id, // THE FIX IS HERE
                'type' => 'Learner License',
                'title' => $ll->ll_no . ($ll->application_no ? " / " . $ll->application_no : ""),
                'description' => 'Holder: ' . $ll->citizen->name,
                'url' => '/citizens/' . $ll->citizen_id,
            ];
        }

        // Search Driving Licenses
        $dls = DrivingLicense::with('citizen:id,name')
            ->where('dl_no', 'LIKE', "%{$query}%")
            ->orWhere('application_no', 'LIKE', "%{$query}%")
            ->limit(5)
            ->get();

        foreach ($dls as $dl) {
            $results[] = [
                'unique_key' => 'dl-' . $dl->id, // THE FIX IS HERE
                'type' => 'Driving License',
                'title' => $dl->dl_no . ($dl->application_no ? " / " . $dl->application_no : ""),
                'description' => 'Holder: ' . $dl->citizen->name,
                'url' => '/citizens/' . $dl->citizen_id,
            ];
        }

        // Search Vehicles
        $vehicles = Vehicle::with('citizen:id,name')
            ->where('registration_no', 'LIKE', "%{$query}%")
            ->limit(5)
            ->get();

        foreach ($vehicles as $vehicle) {
            $results[] = [
                'unique_key' => 'vehicle-' . $vehicle->id, // THE FIX IS HERE
                'type' => 'Vehicle',
                'title' => $vehicle->registration_no,
                'description' => 'Owner: ' . $vehicle->citizen->name,
                'url' => '/citizens/' . $vehicle->citizen_id,
            ];
        }

        // THE FIX IS HERE: We now de-duplicate based on the unique key for each item,
        // not the owner's URL. This will show all distinct results.
        $uniqueResults = collect($results)->unique('unique_key')->values()->all();

        return response()->json($uniqueResults);
    }
}
