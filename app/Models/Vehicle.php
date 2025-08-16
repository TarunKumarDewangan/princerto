<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    use HasFactory;

    protected $fillable = [
        'citizen_id',
        'registration_no',
        'type',
        'make_model',
        'chassis_no',
        'engine_no'
    ];

    public function citizen()
    {
        return $this->belongsTo(Citizen::class);
    }

    public function taxes()
    {
        return $this->hasMany(VehicleTax::class);
    }

    public function insurances()
    {
        return $this->hasMany(VehicleInsurance::class);
    }

    public function puccs()
    {
        return $this->hasMany(VehiclePucc::class);
    }

    /**
     * START: New Relationships
     */
    public function fitnesses()
    {
        return $this->hasMany(VehicleFitness::class);
    }

    public function vltds()
    {
        return $this->hasMany(VehicleVltd::class);
    }

    public function permits()
    {
        return $this->hasMany(VehiclePermit::class);
    }

    public function speedGovernors()
    {
        return $this->hasMany(VehicleSpeedGovernor::class);
    }
    /**
     * END: New Relationships
     */
}
