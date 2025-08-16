<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('citizens', function (Blueprint $table) {
            // Add the user_id column to link a citizen to a user.
            if (!Schema::hasColumn('citizens', 'user_id')) {
                $table->foreignId('user_id')
                    ->nullable()
                    ->after('id')
                    ->constrained('users')
                    ->onDelete('set null'); // If user is deleted, keep citizen record
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('citizens', function (Blueprint $table) {
            if (Schema::hasColumn('citizens', 'user_id')) {
                // The dropForeign command uses the table name and column name convention.
                $table->dropForeign(['user_id']);
                $table->dropColumn('user_id');
            }
        });
    }
};
