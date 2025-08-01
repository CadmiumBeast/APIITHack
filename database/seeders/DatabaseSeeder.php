<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

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
    }
}
