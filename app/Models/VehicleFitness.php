<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon; // --- ADD THIS LINE ---

class VehicleFitness extends Model
{
    use HasFactory;

    protected $table = 'vehicle_fitnesses';

    protected $fillable = [
        'vehicle_id',
        'issue_date',
        'expiry_date',
        'certificate_number',
        'file_path',
    ];

    protected $casts = [
        'issue_date' => 'date',
        'expiry_date' => 'date',
    ];

    // --- START OF THE FIX ---
    /**
     * Get the issue_date in d-m-Y format.
     *
     * @param  string  $value
     * @return string|null
     */
    public function getIssueDateAttribute($value)
    {
        return $value ? Carbon::parse($value)->format('d-m-Y') : null;
    }

    /**
     * Get the expiry_date in d-m-Y format.
     *
     * @param  string  $value
     * @return string|null
     */
    public function getExpiryDateAttribute($value)
    {
        return $value ? Carbon::parse($value)->format('d-m-Y') : null;
    }
    // --- END OF THE FIX ---

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
}
