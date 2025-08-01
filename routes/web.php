<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

// Catch-all route for Admin SPA — serves AdminDashboard for any /admin/* route
Route::get('/admin/{any?}', function () {
    return Inertia::render('AdminDashboard');
})->where('any', '.*')->name('admin.dashboard');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
