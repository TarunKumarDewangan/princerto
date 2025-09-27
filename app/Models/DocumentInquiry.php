<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DocumentInquiry extends Model
{
    use HasFactory;

    protected $table = 'document_inquiries';

    protected $fillable = [
        'name', // This should be 'name'
        'phone', // This should be 'phone'
        'document_type',
        'status',
        'vehicle_no',
    ];

    protected $casts = [
        'document_type' => 'array',
    ];
}
