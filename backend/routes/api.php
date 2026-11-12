<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

use App\Http\Controllers\CharlaController;

Route::get('/charlas', [CharlaController::class, 'index']);
Route::get('/charlas/{slug}', [CharlaController::class, 'show'])->where('slug', '[a-z0-9-]+');
