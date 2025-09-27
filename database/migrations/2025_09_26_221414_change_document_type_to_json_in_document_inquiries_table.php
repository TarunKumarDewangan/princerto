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
            // Change the column to JSON to store an array of selected documents
            $table->json('document_type')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('document_inquiries', function (Blueprint $table) {
            // Revert back to a string if we ever need to undo this
            $table->string('document_type')->change();
        });
    }
};
