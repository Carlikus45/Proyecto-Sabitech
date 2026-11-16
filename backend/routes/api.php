<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CharlaController;
use App\Http\Controllers\ReservaController;
use Illuminate\Support\Facades\Route;

Route::get('/charlas', [CharlaController::class, 'index']);
Route::get('/charlas/{slug}', [CharlaController::class, 'show'])->where('slug', '[a-z0-9-]+');

Route::post('/login', [AuthController::class, 'login']);
Route::get('/yo', [AuthController::class, 'yo'])->middleware('auth:sanctum');
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

Route::post('/reservas', [ReservaController::class, 'store'])->middleware('auth:sanctum');
Route::get('/mis-reservas', [ReservaController::class, 'misReservas'])->middleware('auth:sanctum');