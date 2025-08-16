<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServiceRequest extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'category',
        'services',
        'query',
        'status',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        // This automatically converts the 'services' column from JSON in the database
        // to a PHP array when we access it in our code, and vice-versa.
        'services' => 'array',
    ];

    /**
     * Get the user who submitted the service request.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
