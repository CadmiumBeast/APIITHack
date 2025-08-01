<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Location extends Model
{
    //
    protected $fillable = [
        'name',
        'levels',
    ];

    public function rooms()
    {
        return $this->hasMany(Room::class, 'building_id');
    }
    
       
    
}
