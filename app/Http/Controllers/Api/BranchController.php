<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Middleware\RoleMiddleware;
use App\Models\Branch;
use Illuminate\Http\Request;

class BranchController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        // Only admins and managers can see the list of branches
        $this->middleware(RoleMiddleware::class . ':admin,manager');
    }

    /**
     * Return a list of all branches.
     */
    public function index()
    {
        return Branch::orderBy('name')->get();
    }
}
