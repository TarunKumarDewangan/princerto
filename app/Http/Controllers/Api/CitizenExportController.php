<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Citizen;
use App\Http\Middleware\RoleMiddleware;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CitizenExportController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        // Only allow admins and managers to export data
        $this->middleware(RoleMiddleware::class . ':admin,manager');
    }

    /**
     * Handle the request to export citizens to a CSV file.
     * GET /api/citizens/export?q=&mobile=
     */
    public function __invoke(Request $request): StreamedResponse
    {
        $q = trim((string) $request->query('q', ''));
        $mob = trim((string) $request->query('mobile', ''));
        $authUser = $request->user();

        // This query logic exactly matches the CitizenController's index method
        // to ensure the exported data is consistent with what the user sees on the page.
        $query = Citizen::query();

        // Apply role-based filtering
        if ($authUser->role === 'user') {
            $query->where('created_by_id', $authUser->id);
        }

        // Apply search filters
        if ($q !== '') {
            $query->where(function (Builder $b) use ($q) {
                $b->where('name', 'like', "%{$q}%")
                    ->orWhere('relation_name', 'like', "%{$q}%")
                    ->orWhere('email', 'like', "%{$q}%");
            });
        }

        if ($mob !== '') {
            $query->where('mobile', 'like', "%{$mob}%");
        }

        // Add relationships and counts
        $query->with('creator:id,name')
            ->withCount(['learnerLicenses', 'drivingLicenses', 'vehicles']);

        $query->orderByDesc('id');

        // Prepare headers for file download
        $filename = 'citizens_export_' . now()->format('Ymd_His') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        // Define the columns for the CSV header row
        $columns = [
            'ID',
            'Name',
            'Relation Type',
            'Relation Name',
            'Mobile',
            'Email',
            'DOB',
            'Address',
            'City',
            'State',
            'LL Count',
            'DL Count',
            'Vehicle Count',
            'Created By',
            'Created At'
        ];

        // This callback function generates the CSV content row by row
        $callback = function () use ($query, $columns) {
            $out = fopen('php://output', 'w');

            // Add a BOM to ensure Excel properly handles UTF-8 characters
            fprintf($out, chr(0xEF) . chr(0xBB) . chr(0xBF));

            // Write the header row
            fputcsv($out, $columns);

            // Process the data in chunks to avoid using too much memory
            $query->chunk(500, function ($citizens) use ($out) {
                foreach ($citizens as $c) {
                    // Write a data row for each citizen
                    fputcsv($out, [
                        $c->id,
                        $c->name,
                        $c->relation_type,
                        $c->relation_name,
                        $c->mobile,
                        $c->email,
                        optional($c->dob)->format('Y-m-d'),
                        $c->address,
                        $c->city,
                        $c->state,
                        $c->learner_licenses_count,
                        $c->driving_licenses_count,
                        $c->vehicles_count,
                        $c->creator->name ?? 'N/A', // Use the creator relationship
                        optional($c->created_at)->format('Y-m-d H:i:s'),
                    ]);
                }
            });

            fclose($out);
        };

        // Return the streaming response to the browser
        return response()->stream($callback, 200, $headers);
    }
}
