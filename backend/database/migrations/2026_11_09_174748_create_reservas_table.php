<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reservas', function (Blueprint $table) {
            $table->id();
            $table->string('codigo', 12)->unique();
            $table->foreignId('user_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('charla_id')->constrained('charlas')->restrictOnDelete();
            $table->enum('estado', ['confirmada', 'cancelada'])->default('confirmada');
            $table->string('qr_secreto', 64);
            $table->timestamp('cancelada_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'charla_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reservas');
    }
};