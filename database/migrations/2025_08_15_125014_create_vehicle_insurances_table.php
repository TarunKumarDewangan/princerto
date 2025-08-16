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
        Schema::create('vehicle_insurances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')->constrained('vehicles')->onDelete('cascade');
            $table->string('vehicle_class_snapshot')->nullable(); // To store the vehicle type at the time of insurance
            $table->string('insurance_type'); // e.g., Comprehensive, Third Party
            $table->string('company_name');
            $table->string('policy_number')->unique();
            $table->date('start_date');
            $table->date('end_date');
            $table->string('status')->default('active'); // e.g., active, expired
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicle_insurances');
    }
};
