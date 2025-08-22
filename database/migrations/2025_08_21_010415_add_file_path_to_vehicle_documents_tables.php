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
            $table->string('file_path')->nullable()->after('tax_upto');
        });
        Schema::table('vehicle_insurances', function (Blueprint $table) {
            $table->string('file_path')->nullable()->after('status');
        });
        Schema::table('vehicle_puccs', function (Blueprint $table) {
            $table->string('file_path')->nullable()->after('status');
        });
        Schema::table('vehicle_fitnesses', function (Blueprint $table) {
            $table->string('file_path')->nullable()->after('certificate_number');
        });
        Schema::table('vehicle_permits', function (Blueprint $table) {
            $table->string('file_path')->nullable()->after('permit_number');
        });
        Schema::table('vehicle_vltds', function (Blueprint $table) {
            $table->string('file_path')->nullable()->after('certificate_number');
        });
        Schema::table('vehicle_speed_governors', function (Blueprint $table) {
            $table->string('file_path')->nullable()->after('certificate_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vehicle_taxes', function (Blueprint $table) {
            $table->dropColumn('file_path');
        });
        Schema::table('vehicle_insurances', function (Blueprint $table) {
            $table->dropColumn('file_path');
        });
        Schema::table('vehicle_puccs', function (Blueprint $table) {
            $table->dropColumn('file_path');
        });
        Schema::table('vehicle_fitnesses', function (Blueprint $table) {
            $table->dropColumn('file_path');
        });
        Schema::table('vehicle_permits', function (Blueprint $table) {
            $table->dropColumn('file_path');
        });
        Schema::table('vehicle_vltds', function (Blueprint $table) {
            $table->dropColumn('file_path');
        });
        Schema::table('vehicle_speed_governors', function (Blueprint $table) {
            $table->dropColumn('file_path');
        });
    }
};
