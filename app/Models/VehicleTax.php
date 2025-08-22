<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VehicleTax extends Model
{
    use HasFactory;

    // --- START OF MODIFIED CODE ---
    protected $fillable = [
        'vehicle_id',
        'vehicle_type',
        'tax_mode',
        'tax_from',
        'tax_upto',
        'file_path', // Add this line
    ];
    // --- END OF MODIFIED CODE ---

    protected $casts = [
        'tax_from' => 'date',
        'tax_upto' => 'date',
    ];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
}
