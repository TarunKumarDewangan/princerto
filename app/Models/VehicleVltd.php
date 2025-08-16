<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VehicleVltd extends Model
{
    use HasFactory;
    protected $table = 'vehicle_vltds';
    protected $fillable = ['vehicle_id', 'issue_date', 'expiry_date', 'certificate_number'];
    protected $casts = ['issue_date' => 'date', 'expiry_date' => 'date'];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
}
