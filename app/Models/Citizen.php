<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon; // Import Carbon for date handling

class Citizen extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'user_id',
        'name',
        'relation_type',    // New
        'relation_name',    // Renamed from father_name
        'mobile',
        'email',
        'dob',
        'address',
        'state',            // New
        'city',             // New
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'dob' => 'date',
    ];

    /**
     * The accessors to append to the model's array form.
     * This makes the 'age' available when the model is converted to JSON.
     *
     * @var array
     */
    protected $appends = ['age'];

    /**
     * Accessor to calculate the age from the date of birth.
     *
     * @return int|null
     */
    public function getAgeAttribute()
    {
        if ($this->dob) {
            return Carbon::parse($this->dob)->age;
        }
        return null;
    }

    /**
     * Get the user that owns the citizen record.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
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
