<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('learner_licenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('citizen_id')->constrained()->cascadeOnDelete();
            $table->string('ll_no')->unique();
            $table->string('application_no')->nullable()->index();
            $table->date('issue_date')->nullable();
            $table->date('expiry_date')->nullable();
            $table->string('vehicle_class')->nullable(); // MCWG/LMV etc.
            $table->string('office')->nullable();        // issuing office
            $table->timestamps();

            $table->index(['ll_no']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('learner_licenses');
    }
};
