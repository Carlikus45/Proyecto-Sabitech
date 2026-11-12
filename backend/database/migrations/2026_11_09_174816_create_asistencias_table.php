<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('asistencias', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reserva_id')->unique()->constrained('reservas')->restrictOnDelete();
            $table->foreignId('registrada_por')->constrained('users')->restrictOnDelete();
            $table->enum('metodo', ['qr', 'manual'])->default('qr');
            $table->timestamp('registrada_at')->useCurrent();
            $table->string('observaciones')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asistencias');
    }
};