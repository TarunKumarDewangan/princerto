<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon; // --- FIX: Import the Carbon library ---

class LearnerLicense extends Model
{
    use HasFactory;

    protected $fillable = [
        'citizen_id',
        'll_no',
        'application_no',
        'issue_date',
        'expiry_date',
        'vehicle_class',
        'office',
        'file_path',
    ];

    protected $casts = [
        'issue_date' => 'date',
        'expiry_date' => 'date',
    ];

    // --- START OF THE FIX ---
    /**
     * Get the issue_date in d-m-Y format for the API.
     */
    public function getIssueDateAttribute($value)
    {
        return $value ? Carbon::parse($value)->format('d-m-Y') : null;
    }

    /**
     * Get the expiry_date in d-m-Y format for the API.
     */
    public function getExpiryDateAttribute($value)
    {
        return $value ? Carbon::parse($value)->format('d-m-Y') : null;
    }
    // --- END OF THE FIX ---

    public function citizen()
    {
        return $this->belongsTo(Citizen::class);
    }
}
