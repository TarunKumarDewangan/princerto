<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('vehicle_taxes', function (Blueprint $t) {
            $t->id();
            $t->foreignId('vehicle_id')->constrained()->cascadeOnDelete();
            $t->string('vehicle_type')->nullable(); // snapshot (LMV/MC), optional
            $t->string('tax_mode');                 // e.g., Quarterly / Yearly / OneTime
            $t->date('tax_from');
            $t->date('tax_upto');
            $t->timestamps();
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('vehicle_taxes');
    }
};
