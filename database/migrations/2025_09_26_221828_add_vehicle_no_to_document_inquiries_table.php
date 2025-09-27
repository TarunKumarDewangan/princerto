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
        Schema::table('document_inquiries', function (Blueprint $table) {
            // Add the new column after 'document_type'. It's nullable because it's optional.
            $table->string('vehicle_no')->nullable()->after('document_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('document_inquiries', function (Blueprint $table) {
            $table->dropColumn('vehicle_no');
        });
    }
};
