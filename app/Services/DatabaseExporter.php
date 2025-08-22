<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class DatabaseExporter
{
    /**
     * The content of the SQL backup file.
     * @var string
     */
    protected $sqlContent = "";

    /**
     * Generate the SQL content for a full database backup.
     * @return string
     */
    public function export()
    {
        $tables = $this->getTables();

        foreach ($tables as $table) {
            $this->addCreateTableSql($table);
            $this->addInsertSql($table);
        }

        return $this->sqlContent;
    }

    /**
     * Get a list of all tables in the database.
     * @return array
     */
    protected function getTables()
    {
        return array_map('current', DB::select('SHOW TABLES'));
    }

    /**
     * Add the 'CREATE TABLE' SQL statement for a given table.
     * @param string $tableName
     */
    protected function addCreateTableSql($tableName)
    {
        $createTableResult = DB::selectOne("SHOW CREATE TABLE `{$tableName}`");
        $sql = $createTableResult->{'Create Table'} ?? '';

        $this->sqlContent .= "\n\n-- --------------------------------------------------------\n";
        $this->sqlContent .= "-- Table structure for table `{$tableName}`\n";
        $this->sqlContent .= "-- --------------------------------------------------------\n\n";
        $this->sqlContent .= "DROP TABLE IF EXISTS `{$tableName}`;\n";
        $this->sqlContent .= $sql . ";\n\n";
    }

    /**
     * Add the 'INSERT INTO' SQL statements for a given table.
     * @param string $tableName
     */
    protected function addInsertSql($tableName)
    {
        $this->sqlContent .= "--\n-- Dumping data for table `{$tableName}`\n--\n\n";

        $rows = DB::table($tableName)->get();

        if ($rows->isEmpty()) {
            return;
        }

        foreach ($rows as $row) {
            $values = [];
            foreach ((array) $row as $value) {
                if (is_null($value)) {
                    $values[] = "NULL";
                } else {
                    // Escape special characters
                    $value = addslashes($value);
                    $values[] = "'{$value}'";
                }
            }
            $this->sqlContent .= "INSERT INTO `{$tableName}` VALUES (" . implode(', ', $values) . ");\n";
        }
    }
}
