<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
        'file_path', // Add this
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
}
