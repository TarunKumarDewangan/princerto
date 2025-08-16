<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule; // Import the Rule class

class UpdateLearnerLicenseRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Authorization is handled by the RoleMiddleware in the controller.
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        // Get the ID of the learner license record from the route parameter.
        // e.g., from a route like /api/ll/{learnerLicense}
        $llId = $this->route('learnerLicense')->id;

        return [
            'citizen_id' => 'sometimes|required|exists:citizens,id',
            // THE FIX IS HERE:
            // This rule now checks for uniqueness but ignores the row with the ID of the
            // record we are currently editing.
            'll_no' => [
                'sometimes',
                'required',
                'string',
                'max:100',
                Rule::unique('learner_licenses', 'll_no')->ignore($llId)
            ],
            'application_no' => 'sometimes|nullable|string|max:150',
            'issue_date' => 'sometimes|nullable|date',
            'expiry_date' => 'sometimes|nullable|date|after_or_equal:issue_date',
            'vehicle_class' => 'sometimes|nullable|string|max:100',
            'office' => 'sometimes|nullable|string|max:150',
        ];
    }
}
