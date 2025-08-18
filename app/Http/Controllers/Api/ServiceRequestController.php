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
        // The 'store' method is now public.
        // We only protect the routes that absolutely require a logged-in user.
        $this->middleware('auth:sanctum')->only(['myRequests', 'index', 'updateStatus']);
        $this->middleware(RoleMiddleware::class . ':admin,manager')->only(['index', 'updateStatus']);
    }

    public function index(Request $request)
    {
        $status = $request->query('status');
        $requests = ServiceRequest::with('user:id,name,phone')
            ->when($status, function ($query, $status) {
                return $query->where('status', $status);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(15);
        return $requests;
    }

    public function updateStatus(Request $request, ServiceRequest $serviceRequest)
    {
        $data = $request->validate(['status' => 'required|string|in:pending,contacted,completed',]);
        $serviceRequest->status = $data['status'];
        $serviceRequest->save();
        return response()->json($serviceRequest->fresh()->load('user:id,name,phone'));
    }

    public function myRequests(Request $request)
    {
        $requests = ServiceRequest::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->paginate(15);
        return $requests;
    }

    /**
     * Store a newly created resource in storage.
     * This method is now PUBLIC and handles both authenticated and guest users.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'contact_name' => 'required|string|max:255',
            'contact_phone' => 'required|string|max:20',
            'category' => 'required|string|in:dl,vehicle,other',
            'services' => 'nullable|array',
            'query' => 'nullable|string',
        ]);

        // Check if a user is authenticated via Sanctum.
        $userId = auth('sanctum')->id(); // This will be the user's ID or null if they are a guest.

        $serviceRequest = ServiceRequest::create([
            'user_id' => $userId, // This can now safely be null.
            'contact_name' => $data['contact_name'],
            'contact_phone' => $data['contact_phone'],
            'category' => $data['category'],
            'services' => $data['services'] ?? [],
            'query' => $data['query'] ?? null,
            'status' => 'pending',
        ]);

        return response()->json($serviceRequest, 201);
    }
}
