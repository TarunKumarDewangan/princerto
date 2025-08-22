<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Middleware\RoleMiddleware;
use App\Services\DatabaseExporter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DatabaseBackupController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        $this->middleware(RoleMiddleware::class . ':admin');
    }

    /**
     * Create a new database backup, save both .sql and .zip to storage, and stream the .zip for download.
     */
    public function download(DatabaseExporter $exporter)
    {
        // Define the storage disk and directory
        $disk = 'local'; // Corresponds to storage/app
        $backupDir = 'backups';

        try {
            // 1. Generate the SQL content
            $sqlContent = $exporter->export();
            $baseName = 'backup-' . now()->format('Y-m-d_H-i-s');
            $sqlFileName = $baseName . '.sql';
            $zipFileName = $baseName . '.zip';

            // Ensure the final backup directory exists
            if (!Storage::disk($disk)->exists($backupDir)) {
                Storage::disk($disk)->makeDirectory($backupDir);
            }

            // --- START OF MODIFIED CODE ---
            // 2. Save the .sql file directly to the final backup directory.
            Storage::disk($disk)->put("{$backupDir}/{$sqlFileName}", $sqlContent);
            $sqlFilePath = Storage::disk($disk)->path("{$backupDir}/{$sqlFileName}");

            // 3. Create the .zip archive in the same directory.
            $zip = new \ZipArchive();
            $zipFilePath = Storage::disk($disk)->path("{$backupDir}/{$zipFileName}");

            if ($zip->open($zipFilePath, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) !== TRUE) {
                throw new \Exception("Cannot open zip file for writing: {$zipFilePath}");
            }

            // 4. Add the newly saved .sql file to the .zip archive.
            $zip->addFile($sqlFilePath, $sqlFileName);
            $zip->close();
            // --- END OF MODIFIED CODE ---

            // 5. Send the newly created .zip file to the browser for download.
            return Storage::disk($disk)->download("{$backupDir}/{$zipFileName}");

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('PHP-based sql/zip backup failed: ' . $e->getMessage());

            // Clean up any partial files in case of an error
            if (isset($sqlFileName)) {
                Storage::disk($disk)->delete("{$backupDir}/{$sqlFileName}");
            }
            if (isset($zipFileName)) {
                Storage::disk($disk)->delete("{$backupDir}/{$zipFileName}");
            }

            return response()->json(['message' => 'Failed to create backup files. Please check the server logs.'], 500);
        }
    }
}
