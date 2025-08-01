<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
    //
    protected $fillable = [
        'RoomID',
        'building_id', // Foreign key to locations table
        'level', // Default level is 1
        'venue_type_id', // Foreign key to venue_types table
        'capacity', // Default capacity is 0
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function room()
    {
        return $this->belongsTo(Location::class, 'building_id');
    }

    public function location()
    {
        return $this->belongsTo(Location::class, 'building_id');
    }
    public function venueType()
    {
        return $this->belongsTo(VenueType::class, 'venue_type_id');
    }

    public function RoomBookings()
    {
        return $this->hasMany(RoomBooking::class);
    }
}
