<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon; // --- FIX: Import the Carbon library ---

class VehicleTax extends Model
{
    use HasFactory;

    protected $fillable = [
        'vehicle_id',
        'vehicle_type',
        'tax_mode',
        'tax_from',
        'tax_upto',
        'file_path',
        'amount',
    ];

    protected $casts = [
        'tax_from' => 'date',
        'tax_upto' => 'date',
        'amount' => 'decimal:2',
    ];

    // --- START OF THE FIX ---
    /**
     * Get the tax_from date in d-m-Y format for the API.
     */
    public function getTaxFromAttribute($value)
    {
        return $value ? Carbon::parse($value)->format('d-m-Y') : null;
    }

    /**
     * Get the tax_upto date in d-m-Y format for the API.
     */
    public function getTaxUptoAttribute($value)
    {
        return $value ? Carbon::parse($value)->format('d-m-Y') : null;
    }
    // --- END OF THE FIX ---

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
}
