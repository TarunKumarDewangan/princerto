<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Citizen extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'relation_type',
        'relation_name',
        'mobile',
        'email',
        'dob',
        'address',
        'state',
        'city',
    ];

    protected $casts = [
        'dob' => 'date',
    ];

    protected $appends = [
        'age'
    ];

    public function getAgeAttribute()
    {
        if ($this->dob) {
            return Carbon::parse($this->dob)->age;
        }
        return null;
    }

    // --- START OF MODIFIED CODE ---
    /**
     * This relationship links a citizen profile to the USER who created it.
     * Renamed from user() to creator() for better code clarity.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
    // --- END OF MODIFIED CODE ---

    /**
     * Check if this Citizen profile is the primary profile for a User.
     */
    public function isPrimaryProfileForUser()
    {
        return $this->hasOne(User::class, 'citizen_id');
    }

    public function learnerLicenses()
    {
        return $this->hasMany(LearnerLicense::class);
    }

    public function drivingLicenses()
    {
        return $this->hasMany(DrivingLicense::class);
    }

    public function vehicles()
    {
        return $this->hasMany(Vehicle::class);
    }
}
