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
            // THE FIX IS HERE: We drop the old column and add the new one.
            $table->dropColumn('father_name');
            $table->string('relation_name')->nullable()->after('name');

            // Add other new columns
            $table->string('relation_type')->nullable()->after('name');
            $table->string('state')->nullable()->after('address');
            $table->string('city')->nullable()->after('state');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('citizens', function (Blueprint $table) {
            // Revert the changes
            $table->dropColumn(['relation_name', 'relation_type', 'state', 'city']);
            $table->string('father_name')->nullable()->after('name');
        });
    }
};
