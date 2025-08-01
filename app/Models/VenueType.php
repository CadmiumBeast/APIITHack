<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VenueType extends Model
{
    //
    protected $fillable = [
        'name',
    ];

    
    public function venue()
    {
        return $this->hasMany(Room::class, 'venue_type_id');
    }

}
