<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// THE FIX IS HERE: We are adding the proper class definition that Laravel expects.
class AddCitizenIdToUsersTable extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // This column will link a user to their own primary citizen profile.
            $table->foreignId('citizen_id')
                ->nullable()
                ->after('id')
                ->constrained('citizens')
                ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['citizen_id']);
            $table->dropColumn('citizen_id');
        });
    }
}
;
