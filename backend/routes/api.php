<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CharlaController;
use Illuminate\Support\Facades\Route;

Route::get('/charlas', [CharlaController::class, 'index']);
Route::get('/charlas/{slug}', [CharlaController::class, 'show'])->where('slug', '[a-z0-9-]+');

Route::post('/login', [AuthController::class, 'login']);
Route::get('/yo', [AuthController::class, 'yo'])->middleware('auth:sanctum');
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');