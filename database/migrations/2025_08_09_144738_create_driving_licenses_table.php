<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('driving_licenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('citizen_id')->constrained()->cascadeOnDelete();
            $table->string('dl_no')->unique();
            $table->string('application_no')->nullable()->index();
            $table->date('issue_date')->nullable();
            $table->date('expiry_date')->nullable();
            $table->string('vehicle_class')->nullable();
            $table->string('office')->nullable();
            $table->timestamps();

            $table->index(['dl_no']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('driving_licenses');
    }
};
