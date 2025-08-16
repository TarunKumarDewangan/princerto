<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreVehicleTaxRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'vehicle_type' => 'nullable|string|max:50',
            'tax_mode' => 'required|string|max:50',
            'tax_from' => 'required|date',
            'tax_upto' => 'required|date|after_or_equal:tax_from',
        ];
    }
}
