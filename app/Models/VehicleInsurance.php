<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon; // --- FIX: Import the Carbon library ---

class VehicleInsurance extends Model
{
    use HasFactory;

    protected $table = 'vehicle_insurances';

    protected $fillable = [
        'vehicle_id',
        'vehicle_class_snapshot',
        'insurance_type',
        'company_name',
        'policy_number',
        'start_date',
        'end_date',
        'status',
        'file_path',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    // --- START OF THE FIX ---
    /**
     * Get the start_date in d-m-Y format for the API.
     */
    public function getStartDateAttribute($value)
    {
        return $value ? Carbon::parse($value)->format('d-m-Y') : null;
    }

    /**
     * Get the end_date in d-m-Y format for the API.
     */
    public function getEndDateAttribute($value)
    {
        return $value ? Carbon::parse($value)->format('d-m-Y') : null;
    }
    // --- END OF THE FIX ---

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
}
