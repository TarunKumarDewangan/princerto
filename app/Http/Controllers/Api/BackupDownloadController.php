<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use App\Http\Middleware\RoleMiddleware;
use Illuminate\Support\Facades\Storage;
use Spatie\Backup\BackupDestination\Backup;
use Spatie\Backup\BackupDestination\BackupDestination;
use Spatie\Backup\Tasks\Monitor\BackupDestinationStatus;
use Spatie\Backup\Tasks\Monitor\BackupDestinationStatusFactory;

class DatabaseBackupController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        $this->middleware(RoleMiddleware::class . ':admin');
    }

    /**
     * Get a list of all existing database backups.
     */
    public function index()
    {
        $backupDestination = BackupDestinationStatusFactory::createForNotification();

        $files = $backupDestination->backups()->map(function (Backup $backup) {
            return [
                'path' => $backup->path(),
                'date' => $backup->date()->format('Y-m-d H:i:s'),
                'size' => $backup->sizeInBytes(),
            ];
        })->toArray();

        return response()->json($files);
    }

    /**
     * Trigger a new database backup.
     */
    public function store(Request $request)
    {
        try {
            Artisan::call('db:backup');
            return response()->json(['message' => 'Database backup process has been started successfully.']);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Backup initiation failed: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to start the backup process. Please check the server logs.'], 500);
        }
    }

    /**
     * Download a specific backup file.
     */
    public function show(Request $request)
    {
        $path = $request->query('path');

        if (!$path || !Storage::disk(config('backup.backup.destination.disks')[0])->exists($path)) {
            abort(404, 'Backup file not found.');
        }

        return Storage::disk(config('backup.backup.destination.disks')[0])->download($path);
    }
}
