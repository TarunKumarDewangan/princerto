<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DrivingLicense extends Model
{
    use HasFactory;

    protected $fillable = [
        'citizen_id',
        'dl_no',
        'application_no',
        'issue_date',
        'expiry_date',
        'vehicle_class',
        'office'
    ];

    protected $casts = [
        'issue_date' => 'date',
        'expiry_date' => 'date',
    ];

    public function citizen()
    {
        return $this->belongsTo(Citizen::class);
    }
}
