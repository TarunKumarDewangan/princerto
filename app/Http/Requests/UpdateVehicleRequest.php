<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule; // Import the Rule class

class UpdateVehicleRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        // Get the ID of the vehicle record from the route parameter.
        $vehicleId = $this->route('vehicle')->id;

        return [
            'citizen_id' => 'sometimes|required|exists:citizens,id',
            // THE FIX IS HERE: Ignore the current vehicle's ID during the unique check.
            'registration_no' => [
                'sometimes',
                'required',
                'string',
                'max:20',
                Rule::unique('vehicles', 'registration_no')->ignore($vehicleId)
            ],
            'type' => 'sometimes|nullable|string|max:100', // Increased max length
            'make_model' => 'sometimes|nullable|string|max:150',
            'chassis_no' => 'sometimes|nullable|string|max:150',
            'engine_no' => 'sometimes|nullable|string|max:150',
        ];
    }
}
