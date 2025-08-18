<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;

class Authenticate extends Middleware
{
    /**
     * Get the path the user should be redirected to when they are not authenticated.
     */
    protected function redirectTo(Request $request): ?string
    {
        // THE FIX IS HERE: We check if the request expects a JSON response (all API calls do).
        // If it does, we return null, which tells Laravel to stop and just send a 401 error.
        // If it doesn't (e.g., a direct browser visit to an API endpoint), it will still try to redirect,
        // but this case is rare for an SPA.
        return $request->expectsJson() ? null : route('login');
    }
}
