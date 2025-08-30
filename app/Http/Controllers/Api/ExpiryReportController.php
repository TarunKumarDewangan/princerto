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
use App\Models\VehicleTax;
use App\Models\VehicleVltd;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class ExpiryReportController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->validate([
            'vehicle_no' => 'nullable|string|max:255',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
            'owner_name' => 'nullable|string|max:255',
            'exact_date' => 'nullable|date',
            'doc_type' => 'nullable|string|max:255',
        ]);

        $vehicleNo = $filters['vehicle_no'] ?? null;
        $ownerName = $filters['owner_name'] ?? null;
        $exactDate = isset($filters['exact_date']) ? Carbon::parse($filters['exact_date']) : null;
        $docType = $filters['doc_type'] ?? null;

        if ($exactDate) {
            $startDate = $exactDate->copy()->startOfDay();
            $endDate = $exactDate->copy()->endOfDay();
        } else {
            $startDate = isset($filters['start_date']) ? Carbon::parse($filters['start_date']) : null;
            $endDate = isset($filters['end_date']) ? Carbon::parse($filters['end_date']) : null;
        }

        $page = $filters['page'] ?? 1;
        $perPage = $filters['per_page'] ?? 15;
        $allExpiries = new Collection();
        $authUser = $request->user()->load('branch');

        // Add debug logging
        Log::info('Expiry Report Request', [
            'page' => $page,
            'per_page' => $perPage,
            'filters' => $filters
        ]);

        if (empty($vehicleNo)) {
            $this->fetchLicenseExpiries($allExpiries, $startDate, $endDate, $ownerName, $authUser, $docType);
        }

        $this->fetchVehicleDocumentExpiries($allExpiries, $vehicleNo, $startDate, $endDate, $ownerName, $authUser, $docType);

        // Remove duplicates and ensure clean data
        $uniqueExpiries = $allExpiries->unique(function ($item) {
            return $item['type'] . '|' . $item['identifier'] . '|' . $item['citizen_id'];
        });

        $sortedExpiries = $uniqueExpiries->sortBy('expiry_date')->values();

        Log::info('Expiry Report Data', [
            'total_items' => $sortedExpiries->count(),
            'page' => $page,
            'per_page' => $perPage,
            'offset' => ($page - 1) * $perPage
        ]);

        // Fixed pagination using slice with proper values conversion
        $paginatedItems = $sortedExpiries->slice(($page - 1) * $perPage, $perPage)->values();

        $paginator = new LengthAwarePaginator(
            $paginatedItems,
            $sortedExpiries->count(),
            $perPage,
            $page,
            [
                'path' => $request->url(),
                'query' => $request->query()
            ]
        );

        Log::info('Pagination Result', [
            'current_page_items' => $paginatedItems->count(),
            'total_items' => $sortedExpiries->count(),
            'paginator_data_count' => count($paginator->items())
        ]);

        return $paginator;
    }

    private function fetchLicenseExpiries(Collection &$allExpiries, ?Carbon $startDate, ?Carbon $endDate, ?string $ownerName, User $authUser, ?string $docType)
    {
        $branchUserIds = null;
        if ($authUser->role === 'manager' && $authUser->branch_id && $authUser->branch?->name !== 'Dhamtari') {
            $branchUserIds = User::where('branch_id', $authUser->branch_id)->pluck('id');
        }

        if (!$docType || $docType === 'Learner License') {
            $learnerLicenses = LearnerLicense::with('citizen:id,name,mobile')
                ->when($branchUserIds, fn($q) => $q->whereHas('citizen.creator', fn($subQ) => $subQ->whereIn('id', $branchUserIds)))
                ->when($ownerName, fn($q) => $q->whereHas('citizen', fn($subQ) => $subQ->where('name', 'like', "%{$ownerName}%")))
                ->when($startDate, fn($q) => $q->whereDate('expiry_date', '>=', $startDate))
                ->when($endDate, fn($q) => $q->whereDate('expiry_date', '<=', $endDate))
                ->whereNotNull('expiry_date')
                ->get();

            foreach ($learnerLicenses as $ll) {
                if ($ll->citizen && $ll->expiry_date && $ll->ll_no) {
                    $allExpiries->push([
                        'type' => 'Learner License',
                        'owner_name' => $ll->citizen->name,
                        'owner_mobile' => $ll->citizen->mobile,
                        'identifier' => $ll->ll_no,
                        'expiry_date' => $ll->expiry_date->format('Y-m-d'),
                        'citizen_id' => $ll->citizen_id,
                    ]);
                }
            }
        }

        if (!$docType || $docType === 'Driving License') {
            $drivingLicenses = DrivingLicense::with('citizen:id,name,mobile')
                ->when($branchUserIds, fn($q) => $q->whereHas('citizen.creator', fn($subQ) => $subQ->whereIn('id', $branchUserIds)))
                ->when($ownerName, fn($q) => $q->whereHas('citizen', fn($subQ) => $subQ->where('name', 'like', "%{$ownerName}%")))
                ->when($startDate, fn($q) => $q->whereDate('expiry_date', '>=', $startDate))
                ->when($endDate, fn($q) => $q->whereDate('expiry_date', '<=', $endDate))
                ->whereNotNull('expiry_date')
                ->get();

            foreach ($drivingLicenses as $dl) {
                if ($dl->citizen && $dl->expiry_date && $dl->dl_no) {
                    $allExpiries->push([
                        'type' => 'Driving License',
                        'owner_name' => $dl->citizen->name,
                        'owner_mobile' => $dl->citizen->mobile,
                        'identifier' => $dl->dl_no,
                        'expiry_date' => $dl->expiry_date->format('Y-m-d'),
                        'citizen_id' => $dl->citizen_id,
                    ]);
                }
            }
        }
    }

    private function fetchVehicleDocumentExpiries(Collection &$allExpiries, ?string $vehicleNo, ?Carbon $startDate, ?Carbon $endDate, ?string $ownerName, User $authUser, ?string $docType)
    {
        $branchUserIds = null;
        if ($authUser->role === 'manager' && $authUser->branch_id && $authUser->branch?->name !== 'Dhamtari') {
            $branchUserIds = User::where('branch_id', $authUser->branch_id)->pluck('id');
        }

        $documentTypes = [
            ['model' => VehicleInsurance::class, 'date_col' => 'end_date', 'type_name' => 'Insurance'],
            ['model' => VehiclePucc::class, 'date_col' => 'valid_until', 'type_name' => 'PUCC'],
            ['model' => VehicleFitness::class, 'date_col' => 'expiry_date', 'type_name' => 'Fitness'],
            ['model' => VehiclePermit::class, 'date_col' => 'expiry_date', 'type_name' => 'Permit'],
            ['model' => VehicleVltd::class, 'date_col' => 'expiry_date', 'type_name' => 'VLTd'],
            ['model' => VehicleSpeedGovernor::class, 'date_col' => 'expiry_date', 'type_name' => 'Speed Gov.'],
            ['model' => VehicleTax::class, 'date_col' => 'tax_upto', 'type_name' => 'Tax'],
        ];

        foreach ($documentTypes as $doc) {
            if ($docType && $doc['type_name'] !== $docType) {
                continue;
            }

            $query = $doc['model']::query()->with('vehicle.citizen:id,name,mobile')
                ->when($branchUserIds, fn($q) => $q->whereHas('vehicle.citizen.creator', fn($subQ) => $subQ->whereIn('id', $branchUserIds)))
                ->when($vehicleNo, fn($q) => $q->whereHas('vehicle', fn($subQ) => $subQ->where('registration_no', 'like', "%{$vehicleNo}%")))
                ->when($ownerName, fn($q) => $q->whereHas('vehicle.citizen', fn($subQ) => $subQ->where('name', 'like', "%{$ownerName}%")))
                ->when($startDate, fn($q) => $q->whereDate($doc['date_col'], '>=', $startDate))
                ->when($endDate, fn($q) => $q->whereDate($doc['date_col'], '<=', $endDate))
                ->whereNotNull($doc['date_col'])
                ->get();

            foreach ($query as $item) {
                if ($item->vehicle && $item->vehicle->citizen && $item->{$doc['date_col']} && $item->vehicle->registration_no) {
                    $allExpiries->push([
                        'type' => $doc['type_name'],
                        'owner_name' => $item->vehicle->citizen->name,
                        'owner_mobile' => $item->vehicle->citizen->mobile,
                        'identifier' => $item->vehicle->registration_no,
                        'expiry_date' => $item->{$doc['date_col']}->format('Y-m-d'),
                        'citizen_id' => $item->vehicle->citizen_id,
                    ]);
                }
            }
        }
    }
}
