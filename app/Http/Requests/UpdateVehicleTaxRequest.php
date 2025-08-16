<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateVehicleTaxRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'vehicle_type' => 'sometimes|nullable|string|max:50',
            'tax_mode' => 'sometimes|required|string|max:50',
            'tax_from' => 'sometimes|required|date',
            'tax_upto' => 'sometimes|required|date|after_or_equal:tax_from',
        ];
    }
}
