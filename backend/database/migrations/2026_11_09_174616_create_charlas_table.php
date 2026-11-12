<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('charlas', function (Blueprint $table) {
            $table->id();
            $table->string('titulo', 150);
            $table->string('slug', 170)->unique();
            $table->text('descripcion');
            $table->foreignId('ponente_id')->constrained('ponentes')->restrictOnDelete();
            $table->foreignId('sala_id')->constrained('salas')->restrictOnDelete();
            $table->date('fecha');
            $table->time('hora_inicio');
            $table->time('hora_fin');
            $table->unsignedSmallInteger('aforo');
            $table->enum('estado', ['borrador', 'publicada', 'cancelada'])->default('publicada');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('charlas');
    }
};