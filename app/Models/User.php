<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'role',
        'citizen_id', // THE FIX IS HERE: Add citizen_id to fillable
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    /**
     * THE FIX IS HERE: A User is linked to ONE primary citizen profile.
     * This represents the user's own identity.
     */
    public function primaryCitizen()
    {
        return $this->belongsTo(Citizen::class, 'citizen_id');
    }

    /**
     * THE FIX IS HERE: A User can create and manage MANY citizen profiles.
     * This is the core of the new feature.
     */
    public function createdCitizens()
    {
        return $this->hasMany(Citizen::class, 'user_id');
    }
}
