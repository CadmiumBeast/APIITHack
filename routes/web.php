<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\AdminController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    


});

Route::middleware(['auth', 'user-access:admin'])->group(function () {

    Route::get('/admin/dashboard', [AdminController::class, 'index'])->name('admin.dashboard');

    Route::get('/admin/rooms', [AdminController::class, 'manageRooms'])->name('admin.rooms');
    Route::get('/admin/bookings', [AdminController::class, 'manageBookings'])->name('admin.bookings');
    Route::get('/admin/classroom', [AdminController::class, 'manageClassrooms'])->name('admin.classroom');
    Route::get('/admin/classrooms', [AdminController::class, 'manageClassrooms'])->name('admin.classrooms');
    Route::post('/admin/classrooms/book', [AdminController::class, 'bookClassroom'])->name('admin.classrooms.book');
    Route::post('/admin/classrooms/check-conflicts', [AdminController::class, 'checkBookingConflicts'])->name('admin.classrooms.check-conflicts');
    Route::post('/admin/bookings/by-date-location', [AdminController::class, 'getBookingsByDateAndLocation'])->name('admin.bookings.by-date-location');
    Route::delete('/admin/bookings/{id}', [AdminController::class, 'deleteBooking'])->name('admin.bookings.delete');

    Route::get('/admin/reports', [AdminController::class, 'manageReports'])->name('admin.reports');

    Route::get('/admin/logs', function () {
        return Inertia::render('admin/Logs');
    })->name('admin.logs');
    
    Route::get('/admin/settings', function () {
        return Inertia::render('admin/Settings');
    })->name('admin.settings');
    
    Route::post('/admin/logout', [\App\Http\Controllers\Auth\AuthenticatedSessionController::class, 'destroy'])
        ->name('admin.logout');
});

Route::middleware(['auth', 'user-access:lecturer'])->group(function () {
    Route::get('lecturer/dashboard', function () {
        return Inertia::render('lecturer/dashboard');
    })->name('lecturer.dashboard');
});

// Catch-all route for Admin SPA — serves AdminDashboard for any /admin/* route


require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
