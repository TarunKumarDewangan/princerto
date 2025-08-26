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
        Schema::table('vehicle_taxes', function (Blueprint $table) {
            // We use decimal for financial values for better precision.
            // It can store numbers up to 99,999,999.99
            $table->decimal('amount', 10, 2)->nullable()->after('tax_upto');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vehicle_taxes', function (Blueprint $table) {
            $table->dropColumn('amount');
        });
    }
};
