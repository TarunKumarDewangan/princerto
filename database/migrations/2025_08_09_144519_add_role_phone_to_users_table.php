<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Add a unique index to the email column.
            // It was made nullable in the previous migration.
            if (Schema::hasColumn('users', 'email')) {
                $table->unique('email');
            }

            if (!Schema::hasColumn('users', 'role')) {
                // New users registering should have the 'user' role by default.
                $table->string('role')->default('user')->after('email');
            }
            if (!Schema::hasColumn('users', 'phone')) {
                // Phone is the new login identifier. It must be unique but can be null.
                $table->string('phone')->nullable()->unique()->after('role');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'phone')) {
                $table->dropColumn('phone');
            }
            if (Schema::hasColumn('users', 'role')) {
                $table->dropColumn('role');
            }
            // This reverses the unique constraint added in the up() method.
            $table->dropUnique('users_email_unique');
        });
    }
};
