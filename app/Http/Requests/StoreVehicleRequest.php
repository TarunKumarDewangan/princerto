<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreVehicleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // 'citizen_id' RULE IS REMOVED FROM HERE
            'registration_no' => 'required|string|max:20|unique:vehicles,registration_no',
            'type' => 'nullable|string|max:50',
            'make_model' => 'nullable|string|max:150',
            'chassis_no' => 'nullable|string|max:150',
            'engine_no' => 'nullable|string|max:150',
        ];
    }
}
