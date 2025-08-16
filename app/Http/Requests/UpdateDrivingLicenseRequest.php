<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule; // Import the Rule class

class UpdateDrivingLicenseRequest extends FormRequest
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
        // Get the ID of the driving license record from the route parameter.
        $dlId = $this->route('drivingLicense')->id;

        return [
            'citizen_id' => 'sometimes|required|exists:citizens,id',
            // THE FIX IS HERE: Ignore the current record's ID during unique check
            'dl_no' => [
                'sometimes',
                'required',
                'string',
                'max:100',
                Rule::unique('driving_licenses', 'dl_no')->ignore($dlId)
            ],
            'application_no' => 'sometimes|nullable|string|max:150',
            'issue_date' => 'sometimes|nullable|date',
            'expiry_date' => 'sometimes|nullable|date|after_or_equal:issue_date',
            'vehicle_class' => 'sometimes|nullable|string|max:255', // Increased max length
            'office' => 'sometimes|nullable|string|max:150',
        ];
    }
}
