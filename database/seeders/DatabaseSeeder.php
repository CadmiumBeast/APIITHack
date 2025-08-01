<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Location;
use App\Models\Room;
use App\Models\VenueType;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        $users =[
            [
                'name' => 'Tharanga Peiris',
                'email' => 'tharanga@apiit.lk',
                'type' => 2,
                'password' => bcrypt('password'), // password
            ],
            [
                'name' => 'Musharraf Azhar',
                'email' => 'musharraf@apiit.lk',
                'type' => 2,
                'password' => bcrypt('password'), // password
            ],
            [
                'name' => 'Sajid Fayaz Haniff',
                'email' => 'sajid@apiit.lk',
                'type' => 2,
                'password' => bcrypt('password'), // password
            ],
            [
                'name' => 'Dulanga Senanayake',
                'email' => 'Dulanga@apiit.lk',
                'type' => 1,
                'password' => bcrypt('password'), // password
            ]
        ];

        foreach ($users as $user) {
            User::create($user);
        }

        $locations = [
            ['name' => 'City Campus', 'levels' => 5],
            ['name' => 'Law School', 'levels' => 3],
            ['name' => 'Kandy Campus', 'levels' => 2],
        ];

        foreach ($locations as $location) {
            Location::create($location);
        }

        $venueTypes = [
            ['name' => 'Lecture Hall'],
            ['name' => 'Computer Lab'],
            ['name' => 'Conference Room'],
            ['name' => 'Auditorium'],
        ];

        foreach ($venueTypes as $venueType) {
            VenueType::create($venueType);
        }

        $rooms = [
            ['RoomID' => 'LH101', 'building_id' => 1, 'level' => '1', 'venue_type_id' => 1, 'capacity' => 100],
            ['RoomID' => 'CL201', 'building_id' => 2, 'level' => '2', 'venue_type_id' => 2, 'capacity' => 50],
            ['RoomID' => 'CR301', 'building_id' => 3, 'level' => '3', 'venue_type_id' => 3, 'capacity' => 30],
            ['RoomID' => 'AU401', 'building_id' => 1, 'level' => '4', 'venue_type_id' => 4, 'capacity' => 200],
        ];

        foreach ($rooms as $room) {
            Room::create($room);
        }
    }
}
