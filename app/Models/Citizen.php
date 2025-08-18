<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Citizen extends Model
{
    use HasFactory;

    // REVERTED: 'created_by_id' is removed from the fillable array.
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

    protected $casts = ['dob' => 'date',];
    protected $appends = ['age'];

    public function getAgeAttribute()
    {
        if ($this->dob) {
            return Carbon::parse($this->dob)->age;
        }
        return null;
    }

    // This relationship links a citizen profile to its OWNER (if they have a login)
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // REVERTED: The 'creator' relationship has been removed.

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
