<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Middleware\RoleMiddleware;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class DataExportController extends Controller
{
    public function __construct()
    {
        // Protect all actions
        $this->middleware('auth:sanctum');
        $this->middleware(RoleMiddleware::class . ':admin');
    }

    /**
     * Return a list of exportable table names.
     */
    public function index()
    {
        $allTables = array_map('current', DB::select('SHOW TABLES'));
        $skip = ['migrations', 'password_reset_tokens', 'failed_jobs', 'personal_access_tokens'];
        $tables = array_values(array_diff($allTables, $skip));

        return response()->json($tables);
    }

    /**
     * Export a single table as CSV (downloads a CSV file).
     */
    public function exportTable(string $tableName)
    {
        $allTables = array_map('current', DB::select('SHOW TABLES'));
        if (!in_array($tableName, $allTables, true)) {
            abort(404, 'Table not found.');
        }

        $rows = DB::table($tableName)->get();
        $headers = Schema::getColumnListing($tableName);

        $h = fopen('php://temp', 'w+');
        fputcsv($h, $headers);

        foreach ($rows as $row) {
            $line = [];
            foreach ($headers as $col) {
                $line[] = data_get($row, $col);
            }
            fputcsv($h, $line);
        }

        rewind($h);
        $csv = stream_get_contents($h);
        fclose($h);

        $fileName = $tableName . '-' . now()->format('Y-m-d') . '.csv';

        return response($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $fileName . '"',
            'Cache-Control' => 'no-store, no-cache',
        ]);
    }

    /**
     * Export ALL tables to a single ZIP and stream it for download.
     * This uses a real temp file + streamDownload to avoid Windows file locks.
     */
    public function exportAllAsZip()
    {
        if (!class_exists(\ZipArchive::class)) {
            \Log::error('ZipArchive not available. Enable extension=zip in php.ini');
            return response()->json(['message' => 'ZIP extension not enabled on server.'], 500);
        }

        $tmpZip = tempnam(sys_get_temp_dir(), 'export_');
        $zip = new \ZipArchive;

        if ($zip->open($tmpZip, \ZipArchive::OVERWRITE) !== true) {
            return response()->json(['message' => 'Unable to create ZIP archive.'], 500);
        }

        try {
            $allTables = array_map('current', DB::select('SHOW TABLES'));
            $skip = ['migrations', 'password_reset_tokens', 'failed_jobs', 'personal_access_tokens'];

            foreach ($allTables as $table) {
                if (in_array($table, $skip, true))
                    continue;

                $rows = DB::table($table)->get();
                $headers = Schema::getColumnListing($table);

                $h = fopen('php://temp', 'w+');
                fputcsv($h, $headers);

                foreach ($rows as $row) {
                    $line = [];
                    foreach ($headers as $col) {
                        $line[] = data_get($row, $col);
                    }
                    fputcsv($h, $line);
                }

                rewind($h);
                $csv = stream_get_contents($h);
                fclose($h);

                $zip->addFromString($table . '.csv', $csv);
            }
        } catch (\Throwable $e) {
            \Log::error('Export ZIP failed: ' . $e->getMessage());
            $zip->close();
            @unlink($tmpZip);
            return response()->json(['message' => 'Failed to export data as ZIP. Check logs.'], 500);
        }

        $zip->close();

        $downloadName = 'full-data-export-' . now()->format('Y-m-d_H-i-s') . '.zip';

        return response()->streamDownload(function () use ($tmpZip) {
            $stream = fopen($tmpZip, 'rb');
            if ($stream) {
                while (!feof($stream)) {
                    echo fread($stream, 1024 * 1024);
                    @ob_flush();
                    flush();
                }
                fclose($stream);
            }
            @unlink($tmpZip);
        }, $downloadName, [
            'Content-Type' => 'application/zip',
            'Cache-Control' => 'no-store, no-cache',
        ]);
    }
}
