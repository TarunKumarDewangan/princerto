<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('citizen_id')->constrained()->cascadeOnDelete();
            $table->string('registration_no')->unique(); // CG04AB1234
            $table->string('type')->nullable();          // LMV/MC etc.
            $table->string('make_model')->nullable();    // e.g., Maruti Swift
            $table->string('chassis_no')->nullable();
            $table->string('engine_no')->nullable();
            $table->timestamps();

            $table->index(['registration_no']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};
