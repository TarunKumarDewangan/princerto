<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCitizenRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // handled by RoleMiddleware
    }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|required|string|max:255',
            'relation_type' => 'sometimes|nullable|string|in:Son of,Wife of,Daughter of',
            'relation_name' => 'sometimes|nullable|string|max:255',
            'mobile' => 'sometimes|required|string|max:15',
            'email' => 'sometimes|nullable|email|max:255',
            'dob' => 'sometimes|nullable|date',
            'address' => 'sometimes|nullable|string|max:500',
            'state' => 'sometimes|nullable|string|max:255',
            'city' => 'sometimes|nullable|string|max:255',
        ];
    }
}
