<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServiceRequest;
use Illuminate\Http\Request;
use App\Http\Middleware\RoleMiddleware;

class ServiceRequestController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        // Protect the admin/manager methods
        $this->middleware(RoleMiddleware::class . ':admin,manager')->only(['index', 'updateStatus']);
    }

    /**
     * Display a listing of the service requests for admins/managers.
     * GET /api/service-requests?status=pending
     */
    public function index(Request $request)
    {
        $status = $request->query('status');

        $requests = ServiceRequest::with('user:id,name,phone')
            // Add filtering logic
            ->when($status, function ($query, $status) {
                return $query->where('status', $status);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return $requests;
    }

    /**
     * START: New Method to update the status of a request.
     * PATCH /api/service-requests/{serviceRequest}/status
     */
    public function updateStatus(Request $request, ServiceRequest $serviceRequest)
    {
        $data = $request->validate([
            'status' => 'required|string|in:pending,contacted,completed',
        ]);

        $serviceRequest->status = $data['status'];
        $serviceRequest->save();

        // Return the updated request with the user details
        return response()->json($serviceRequest->fresh()->load('user:id,name,phone'));
    }
    /**
     * END: New Method
     */

    /**
     * Display a listing of the resource for the authenticated user.
     * GET /api/my-service-requests
     */
    public function myRequests(Request $request)
    {
        $requests = ServiceRequest::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return $requests;
    }

    /**
     * Store a newly created resource in storage.
     * POST /api/service-requests
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'category' => 'required|string|in:dl,vehicle,other',
            'services' => 'nullable|array',
            'query' => 'nullable|string',
        ]);

        $serviceRequest = ServiceRequest::create([
            'user_id' => $request->user()->id,
            'category' => $data['category'],
            'services' => $data['services'] ?? [],
            'query' => $data['query'] ?? null,
            'status' => 'pending', // Default status
        ]);

        return response()->json($serviceRequest, 201);
    }
}
