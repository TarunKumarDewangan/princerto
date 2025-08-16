<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Citizen;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CitizenExportController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    /**
     * GET /api/citizens/export?q=&mobile=
     */
    public function __invoke(Request $request): StreamedResponse
    {
        $q = trim((string) $request->query('q', ''));
        $mob = trim((string) $request->query('mobile', ''));

        $query = Citizen::query()
            ->when($q !== '', function (Builder $b) use ($q) {
                $b->where(function (Builder $x) use ($q) {
                    $x->where('name', 'like', "%{$q}%")
                        ->orWhere('father_name', 'like', "%{$q}%")
                        ->orWhere('email', 'like', "%{$q}%");
                });
            })
            ->when($mob !== '', fn(Builder $b) => $b->where('mobile', 'like', "%{$mob}%"))
            ->withCount(['learnerLicenses', 'drivingLicenses', 'vehicles'])
            ->orderByDesc('id');

        $filename = 'citizens_export_' . now()->format('Ymd_His') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Cache-Control' => 'no-store, no-cache, must-revalidate',
        ];

        $columns = [
            'ID',
            'Name',
            'Father Name',
            'Mobile',
            'Email',
            'DOB',
            'Address',
            'LL Count',
            'DL Count',
            'Vehicle Count',
            'Created At'
        ];

        $callback = function () use ($query, $columns) {
            $out = fopen('php://output', 'w');
            // UTF-8 BOM (Excel friendly)
            fprintf($out, chr(0xEF) . chr(0xBB) . chr(0xBF));
            fputcsv($out, $columns);

            $query->chunk(1000, function ($rows) use ($out) {
                foreach ($rows as $c) {
                    fputcsv($out, [
                        $c->id,
                        $c->name,
                        $c->father_name,
                        $c->mobile,
                        $c->email,
                        optional($c->dob)->format('Y-m-d'),
                        $c->address,
                        $c->learner_licenses_count,
                        $c->driving_licenses_count,
                        $c->vehicles_count,
                        optional($c->created_at)->format('Y-m-d H:i:s'),
                    ]);
                }
            });

            fclose($out);
        };

        return response()->stream($callback, 200, $headers);
    }
}
