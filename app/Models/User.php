<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'role',
        'citizen_id',
        'branch_id', // --- ADD THIS LINE ---
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    /**
     * A User is linked to ONE primary citizen profile (their own identity).
     */
    public function primaryCitizen()
    {
        return $this->belongsTo(Citizen::class, 'citizen_id');
    }

    // --- START OF NEW CODE ---
    /**
     * A User can belong to one Branch. This is a new, additive relationship.
     */
    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }
    // --- END OF NEW CODE ---
}
