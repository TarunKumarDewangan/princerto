<?php

namespace App\Console\Commands;

use App\Models\DrivingLicense;
use App\Models\VehicleFitness;
use App\Models\VehicleInsurance;
use App\Models\VehiclePucc;
use App\Services\WhatsAppService;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class SendExpiryNotifications extends Command
{
    protected $signature = 'notifications:send-expiries';
    protected $description = 'Scan for expiring documents and send WhatsApp notifications.';

    public function handle(WhatsAppService $whatsAppService): void
    {
        $this->info('Starting to check for expiring documents...');
        Log::info('Running SendExpiryNotifications command.');

        $notificationDays = 30; // Notify 30 days in advance
        $expiryTargetDate = Carbon::today()->addDays($notificationDays);

        $this->checkDrivingLicenses($whatsAppService, $expiryTargetDate);
        $this->checkVehicleInsurances($whatsAppService, $expiryTargetDate);
        $this->checkVehiclePuccs($whatsAppService, $expiryTargetDate);
        $this->checkVehicleFitnesses($whatsAppService, $expiryTargetDate);
        // You can add other checks for Permit, VLTd, etc. here following the same pattern.

        $this->info('Finished checking for expiring documents.');
        Log::info('Finished SendExpiryNotifications command.');
    }

    private function checkDrivingLicenses(WhatsAppService $service, Carbon $targetDate)
    {
        $licenses = DrivingLicense::whereDate('expiry_date', $targetDate)
            ->with('citizen:id,name,mobile')->get();

        foreach ($licenses as $dl) {
            $citizen = $dl->citizen;
            if ($citizen && $citizen->mobile) {
                $expiryDate = $dl->expiry_date->format('d-m-Y');
                $message = "Dear {$citizen->name}, your Driving License ({$dl->dl_no}) is expiring on {$expiryDate}. Please renew it soon. - Citizen Hub";

                $service->sendTextMessage('91' . $citizen->mobile, $message);
            }
        }
    }

    private function checkVehicleInsurances(WhatsAppService $service, Carbon $targetDate)
    {
        $insurances = VehicleInsurance::whereDate('end_date', $targetDate)
            ->with('vehicle.citizen:id,name,mobile')->get();

        foreach ($insurances as $ins) {
            $citizen = $ins->vehicle?->citizen;
            if ($citizen && $citizen->mobile) {
                $expiryDate = $ins->end_date->format('d-m-Y');
                $message = "Dear {$citizen->name}, your Insurance for vehicle {$ins->vehicle->registration_no} is expiring on {$expiryDate}. Please renew it soon. - Citizen Hub";

                $service->sendTextMessage('91' . $citizen->mobile, $message);
            }
        }
    }

    private function checkVehiclePuccs(WhatsAppService $service, Carbon $targetDate)
    {
        $puccs = VehiclePucc::whereDate('valid_until', $targetDate)
            ->with('vehicle.citizen:id,name,mobile')->get();

        foreach ($puccs as $pucc) {
            $citizen = $pucc->vehicle?->citizen;
            if ($citizen && $citizen->mobile) {
                $expiryDate = $pucc->valid_until->format('d-m-Y');
                $message = "Dear {$citizen->name}, your PUCC for vehicle {$pucc->vehicle->registration_no} is expiring on {$expiryDate}. Please renew it soon. - Citizen Hub";

                $service->sendTextMessage('91' . $citizen->mobile, $message);
            }
        }
    }

    private function checkVehicleFitnesses(WhatsAppService $service, Carbon $targetDate)
    {
        $fitnesses = VehicleFitness::whereDate('expiry_date', $targetDate)
            ->with('vehicle.citizen:id,name,mobile')->get();

        foreach ($fitnesses as $fitness) {
            $citizen = $fitness->vehicle?->citizen;
            if ($citizen && $citizen->mobile) {
                $expiryDate = $fitness->expiry_date->format('d-m-Y');
                $message = "Dear {$citizen->name}, your Fitness Certificate for vehicle {$fitness->vehicle->registration_no} is expiring on {$expiryDate}. Please renew it soon. - Citizen Hub";

                $service->sendTextMessage('91' . $citizen->mobile, $message);
            }
        }
    }
}
