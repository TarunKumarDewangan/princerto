<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCitizenRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // handled by RoleMiddleware
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'relation_type' => 'nullable|string|in:Son of,Wife of,Daughter of',
            'relation_name' => 'nullable|string|max:255',
            'mobile' => 'required|string|max:15',
            'email' => 'nullable|email|max:255',
            'dob' => 'nullable|date',
            'address' => 'nullable|string|max:500',
            'state' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
        ];
    }
}
