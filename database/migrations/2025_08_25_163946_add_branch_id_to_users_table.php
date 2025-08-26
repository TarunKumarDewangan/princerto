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
        Schema::table('users', function (Blueprint $table) {
            // Add the new column after the 'role' column.
            // It's nullable because Super Admins and some Managers may not belong to a branch.
            // onDelete('set null') means if a branch is deleted, the user is not deleted,
            // their branch_id just becomes null.
            $table->foreignId('branch_id')
                ->nullable()
                ->after('role')
                ->constrained('branches')
                ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // This is the proper way to remove a foreign key in Laravel.
            $table->dropForeign(['branch_id']);
            $table->dropColumn('branch_id');
        });
    }
};
