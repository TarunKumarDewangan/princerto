<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    protected string $apiKey;
    protected string $apiEndpoint;

    public function __construct()
    {
        // --- START OF THE FIX ---
        // Add a fallback to an empty string ('') to prevent TypeError if config is not loaded.
        $host = config('services.conic.host', '');
        $this->apiKey = config('services.conic.key', '');
        // --- END OF THE FIX ---

        $this->apiEndpoint = "https://{$host}/wapp/api/send/json";
    }

    /**
     * Sends a plain text message via the Conic Solution JSON API.
     */
    public function sendTextMessage(string $phoneNumber, string $message): bool
    {
        if (!$this->apiKey || empty(config('services.conic.host'))) {
            Log::error('Conic Solution WhatsApp API credentials are not configured or found.');
            return false;
        }

        try {
            $response = Http::withHeaders([
                'X-API-KEY' => $this->apiKey,
                'Content-Type' => 'application/json',
            ])->post($this->apiEndpoint, [
                        'mobile' => $phoneNumber,
                        'msg' => $message,
                    ]);

            $responseData = $response->json();

            if ($response->successful() && isset($responseData['status']) && $responseData['status'] !== 'ERROR') {
                Log::info("Successfully sent WhatsApp notification to {$phoneNumber}.", $responseData);
                return true;
            } else {
                Log::error("Failed to send WhatsApp notification to {$phoneNumber}. Status: " . $response->status(), $responseData);
                return false;
            }
        } catch (\Exception $e) {
            Log::error("Exception while sending WhatsApp notification: " . $e->getMessage());
            return false;
        }
    }
}
