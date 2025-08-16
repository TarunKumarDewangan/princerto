<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PasswordResetController extends Controller
{
    /**
     * This feature is disabled because authentication is now mobile-based.
     */
    public function requestLink(Request $request)
    {
        return response()->json([
            'message' => 'Password reset via email is not supported in this version.'
        ], 403); // 403 Forbidden
    }

    /**
     * This feature is disabled because authentication is now mobile-based.
     */
    public function resetPassword(Request $request)
    {
        return response()->json([
            'message' => 'Password reset via email is not supported in this version.'
        ], 403); // 403 Forbidden
    }
}
