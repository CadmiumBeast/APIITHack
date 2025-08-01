<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use App\Models\Room;
use App\Models\User;
use App\Models\VenueType;
use App\Models\Location;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function index(){
        return Inertia::render('AdminDashboard');
    }

    public function manageRooms()
    {
        $rooms = Room::with(['location', 'venueType'])->get();
        $venueTypes = VenueType::all();
        $locations = Location::all();

        // Transform the data to include related information
        $transformedRooms = $rooms->map(function ($room) {
            return [
                'id' => $room->id,
                'roomId' => $room->RoomID,
                'building' => $room->location ? $room->location->name : 'Unknown Building',
                'venueType' => $room->venueType ? $room->venueType->name : 'Unknown Type',
                'level' => $room->level,
                'capacity' => $room->capacity,
                'created_at' => $room->created_at,
                'updated_at' => $room->updated_at,
                // Include raw data for debugging
                'raw_data' => [
                    'building_id' => $room->building_id,
                    'venue_type_id' => $room->venue_type_id,
                    'location_data' => $room->location,
                    'venue_type_data' => $room->venueType,
                ]
            ];
        });

        return Inertia::render('ManageRooms', [
            'rooms' => $transformedRooms,
            'debug_info' => [
                'total_rooms' => $rooms->count(),
                'raw_rooms' => $rooms->toArray(), // Raw database data
                'controller_timestamp' => now()->toDateTimeString(),
            ],
            'venueTypes' => $venueTypes,
            'locations' => $locations,
        ]);
    }
}
