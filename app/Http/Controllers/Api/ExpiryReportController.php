<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DrivingLicense;
use App\Models\LearnerLicense;
use App\Models\VehicleFitness;
use App\Models\VehicleInsurance;
use App\Models\VehiclePermit;
use App\Models\VehiclePucc;
use App\Models\VehicleSpeedGovernor;
use App\Models\VehicleVltd;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class ExpiryReportController extends Controller
{
    /**
     * Fetch a paginated list of all expiring documents across the system.
     */
    public function index(Request $request)
    {
        // 1. Validate and retrieve all possible filters
        $filters = $request->validate([
            'vehicle_no' => 'nullable|string|max:255',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
            // --- START OF NEW CODE ---
            'owner_name' => 'nullable|string|max:255',
            'exact_date' => 'nullable|date',
            // --- END OF NEW CODE ---
        ]);

        $vehicleNo = $filters['vehicle_no'] ?? null;
        $ownerName = $filters['owner_name'] ?? null; // Get owner name
        $exactDate = isset($filters['exact_date']) ? Carbon::parse($filters['exact_date']) : null; // Get exact date

        // --- START OF MODIFIED CODE ---
        // Handle date filters: an exact date will override the date range.
        if ($exactDate) {
            $startDate = $exactDate->copy()->startOfDay();
            $endDate = $exactDate->copy()->endOfDay();
        } else {
            $startDate = isset($filters['start_date']) ? Carbon::parse($filters['start_date']) : null;
            $endDate = isset($filters['end_date']) ? Carbon::parse($filters['end_date']) : null;
        }
        // --- END OF MODIFIED CODE ---

        $page = $filters['page'] ?? 1;
        $perPage = $filters['per_page'] ?? 15;

        $allExpiries = new Collection();

        // 2. Fetch and format each type of document
        if (empty($vehicleNo)) {
            $this->fetchLicenseExpiries($allExpiries, $startDate, $endDate, $ownerName);
        }

        $this->fetchVehicleDocumentExpiries($allExpiries, $vehicleNo, $startDate, $endDate, $ownerName);

        // 3. Sort all combined results by expiry date
        $sortedExpiries = $allExpiries->sortBy('expiry_date')->values();

        // 4. Manually create a paginator for the combined collection
        $paginatedItems = $sortedExpiries->slice(($page - 1) * $perPage, $perPage);
        $paginator = new LengthAwarePaginator(
            $paginatedItems,
            $sortedExpiries->count(),
            $perPage,
            $page,
            ['path' => $request->url(), 'query' => $request->query()]
        );

        return $paginator;
    }

    private function fetchLicenseExpiries(Collection &$allExpiries, ?Carbon $startDate, ?Carbon $endDate, ?string $ownerName)
    {
        // Learner Licenses
        LearnerLicense::with('citizen:id,name,mobile')
            ->when($ownerName, function ($q) use ($ownerName) {
                $q->whereHas('citizen', fn($subQ) => $subQ->where('name', 'like', "%{$ownerName}%"));
            })
            ->when($startDate, fn($q) => $q->whereDate('expiry_date', '>=', $startDate))
            ->when($endDate, fn($q) => $q->whereDate('expiry_date', '<=', $endDate))
            ->get()->each(function ($ll) use (&$allExpiries) {
                $allExpiries->push([
                    'type' => 'Learner License',
                    'owner_name' => $ll->citizen->name,
                    'owner_mobile' => $ll->citizen->mobile,
                    'identifier' => $ll->ll_no,
                    'expiry_date' => $ll->expiry_date->format('Y-m-d'),
                    'citizen_id' => $ll->citizen_id,
                ]);
            });

        // Driving Licenses
        DrivingLicense::with('citizen:id,name,mobile')
            ->when($ownerName, function ($q) use ($ownerName) {
                $q->whereHas('citizen', fn($subQ) => $subQ->where('name', 'like', "%{$ownerName}%"));
            })
            ->when($startDate, fn($q) => $q->whereDate('expiry_date', '>=', $startDate))
            ->when($endDate, fn($q) => $q->whereDate('expiry_date', '<=', $endDate))
            ->get()->each(function ($dl) use (&$allExpiries) {
                $allExpiries->push([
                    'type' => 'Driving License',
                    'owner_name' => $dl->citizen->name,
                    'owner_mobile' => $dl->citizen->mobile,
                    'identifier' => $dl->dl_no,
                    'expiry_date' => $dl->expiry_date->format('Y-m-d'),
                    'citizen_id' => $dl->citizen_id,
                ]);
            });
    }

    private function fetchVehicleDocumentExpiries(Collection &$allExpiries, ?string $vehicleNo, ?Carbon $startDate, ?Carbon $endDate, ?string $ownerName)
    {
        $documentTypes = [
            ['model' => VehicleInsurance::class, 'date_col' => 'end_date', 'type_name' => 'Insurance'],
            ['model' => VehiclePucc::class, 'date_col' => 'valid_until', 'type_name' => 'PUCC'],
            ['model' => VehicleFitness::class, 'date_col' => 'expiry_date', 'type_name' => 'Fitness'],
            ['model' => VehiclePermit::class, 'date_col' => 'expiry_date', 'type_name' => 'Permit'],
            ['model' => VehicleVltd::class, 'date_col' => 'expiry_date', 'type_name' => 'VLTd'],
            ['model' => VehicleSpeedGovernor::class, 'date_col' => 'expiry_date', 'type_name' => 'Speed Gov.'],
        ];

        foreach ($documentTypes as $doc) {
            $query = $doc['model']::query()->with('vehicle.citizen:id,name,mobile')
                ->when($vehicleNo, function ($q) use ($vehicleNo) {
                    $q->whereHas('vehicle', fn($subQ) => $subQ->where('registration_no', 'like', "%{$vehicleNo}%"));
                })
                ->when($ownerName, function ($q) use ($ownerName) {
                    $q->whereHas('vehicle.citizen', fn($subQ) => $subQ->where('name', 'like', "%{$ownerName}%"));
                })
                ->when($startDate, fn($q) => $q->whereDate($doc['date_col'], '>=', $startDate))
                ->when($endDate, fn($q) => $q->whereDate($doc['date_col'], '<=', $endDate));

            $query->get()->each(function ($item) use (&$allExpiries, $doc) {
                if ($item->vehicle && $item->vehicle->citizen) {
                    $allExpiries->push([
                        'type' => $doc['type_name'],
                        'owner_name' => $item->vehicle->citizen->name,
                        'owner_mobile' => $item->vehicle->citizen->mobile,
                        'identifier' => $item->vehicle->registration_no,
                        'expiry_date' => $item->{$doc['date_col']}->format('Y-m-d'),
                        'citizen_id' => $item->vehicle->citizen_id,
                    ]);
                }
            });
        }
    }
}
