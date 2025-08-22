<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use ZipArchive;

class CsvExporterService
{
    public function exportToZip(): string
    {
        $tempDir = 'temp_csv_export_' . uniqid();
        Storage::disk('local')->makeDirectory($tempDir);

        $tables = array_map('current', DB::select('SHOW TABLES'));

        foreach ($tables as $tableName) {
            if ($tableName === 'migrations') {
                continue;
            }
            $this->createCsvForTable($tableName, $tempDir);
        }

        $zipFileName = 'full-export-' . now()->format('Y-m-d_H-i-s') . '.zip';
        $zipFilePath = Storage::disk('local')->path($zipFileName);
        $tempPath = Storage::disk('local')->path($tempDir);

        $zip = new ZipArchive;
        if ($zip->open($zipFilePath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            throw new \Exception("Cannot create zip archive at {$zipFilePath}");
        }

        $files = File::allFiles($tempPath);
        foreach ($files as $file) {
            $zip->addFile($file->getPathname(), $file->getFilename());
        }
        $zip->close();

        Storage::disk('local')->deleteDirectory($tempDir);

        return $zipFileName;
    }

    private function createCsvForTable(string $tableName, string $directory): void
    {
        $rows = DB::table($tableName)->get();

        if ($rows->isEmpty()) {
            $columns = Schema::getColumnListing($tableName);
            $handle = fopen('php://memory', 'w');
            fputcsv($handle, $columns);
            rewind($handle);
            $csv = stream_get_contents($handle);
            fclose($handle);
            Storage::disk('local')->put("{$directory}/{$tableName}.csv", $csv);
            return;
        }

        $headers = array_keys((array) $rows->first());
        $handle = fopen('php://memory', 'w');
        fputcsv($handle, $headers);
        foreach ($rows as $row) {
            fputcsv($handle, (array) $row);
        }
        rewind($handle);
        $csv = stream_get_contents($handle);
        fclose($handle);

        Storage::disk('local')->put("{$directory}/{$tableName}.csv", $csv);
    }
}
