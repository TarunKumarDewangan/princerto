<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        // RoleMiddleware guards the route; allow here.
        return true;
    }

    public function rules(): array
    {
        return [
            'role' => 'required|string|in:admin,manager,user',
        ];
    }
}
