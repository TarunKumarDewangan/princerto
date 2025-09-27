<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Middleware\RoleMiddleware;
use App\Models\DocumentInquiry;
use App\Services\WhatsAppService; // --- ADD THIS IMPORT ---
use Illuminate\Http\Request;

class DocumentInquiryController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum')->only(['index', 'updateStatus']);
        $this->middleware(RoleMiddleware::class . ':admin,manager')->only(['index', 'updateStatus']);
    }

    public function index(Request $request)
    {
        // ... (this method remains unchanged)
        $status = $request->query('status');
        $query = DocumentInquiry::query()
            ->when($status, function ($query, $status) {
                return $query->where('status', $status);
            })
            ->orderBy('created_at', 'desc');
        return $query->paginate(15);
    }

    // --- START: MODIFIED STORE METHOD ---
    public function store(Request $request, WhatsAppService $whatsAppService) // Inject the WhatsAppService
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'document_type' => 'required|array',
            'document_type.*' => 'string|max:255',
            'vehicle_no' => 'nullable|string|max:20',
        ]);

        // First, create the inquiry and save it to the database
        $inquiry = DocumentInquiry::create($data);

        // Next, get the recipient number from the config file
        $recipient = config('services.inquiry.whatsapp_recipient');

        // Only proceed if a recipient number is configured
        if ($recipient) {
            // Convert the array of documents into a comma-separated string
            $documents = implode(', ', $inquiry->document_type);
            $vehicleNumber = $inquiry->vehicle_no ?: 'N/A'; // Use 'N/A' if vehicle number is not provided

            // Construct the notification message
            $message = "New Document Inquiry Received:\n\n" .
                "Name: " . $inquiry->name . "\n" .
                "Phone: " . $inquiry->phone . "\n" .
                "Vehicle No: " . $vehicleNumber . "\n" .
                "Documents: " . $documents;

            // Send the message using the service
            $whatsAppService->sendTextMessage($recipient, $message);
        }

        return response()->json($inquiry, 201);
    }
    // --- END: MODIFIED STORE METHOD ---

    public function updateStatus(Request $request, DocumentInquiry $inquiry)
    {
        // ... (this method remains unchanged)
        $data = $request->validate([
            'status' => 'required|string|in:new,contacted,resolved',
        ]);
        $inquiry->status = $data['status'];
        $inquiry->save();
        return response()->json($inquiry);
    }
}
