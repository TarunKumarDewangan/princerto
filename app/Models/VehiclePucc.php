<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon; // --- FIX: Import the Carbon library ---

class VehiclePucc extends Model
{
    use HasFactory;

    protected $table = 'vehicle_puccs';

    protected $fillable = [
        'vehicle_id',
        'pucc_number',
        'valid_from',
        'valid_until',
        'status',
        'file_path',
    ];

    protected $casts = [
        'valid_from' => 'date',
        'valid_until' => 'date',
    ];

    // --- START OF THE FIX ---
    /**
     * Get the valid_from date in d-m-Y format for the API.
     */
    public function getValidFromAttribute($value)
    {
        return $value ? Carbon::parse($value)->format('d-m-Y') : null;
    }

    /**
     * Get the valid_until date in d-m-Y format for the API.
     */
    public function getValidUntilAttribute($value)
    {
        return $value ? Carbon::parse($value)->format('d-m-Y') : null;
    }
    // --- END OF THE FIX ---

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
}
