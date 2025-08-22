<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
        'file_path', // Add this
    ];

    protected $casts = [
        'valid_from' => 'date',
        'valid_until' => 'date',
    ];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
}
