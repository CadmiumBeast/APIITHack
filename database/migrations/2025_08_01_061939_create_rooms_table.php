<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->string('RoomID');
            $table->foreignId('building_id')->constrained('locations')->onDelete('cascade'); // Foreign key to locations table
            $table->string('level')->default('1'); // Default level is 1
            $table->foreignId('venue_type_id')->constrained('venue_types')->onDelete('cascade'); // Foreign key to venue_types table
            $table->integer('capacity')->default(0); // Default capacity is 0
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rooms');
    }
};
