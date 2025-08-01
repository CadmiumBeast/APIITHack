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
use App\Models\RoomBooking;
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

    public function manageClassrooms()
    {
        // Get all lecturers (users with type = 2 for 'lecturer')
        $lecturers = User::where('type', 2)->get();
        
        // Get all locations and rooms for filtering
        $locations = Location::all();
        $rooms = Room::with(['location', 'venueType'])->get();
        
        // Generate time slots from 7:30 AM to 7:30 PM (30-minute intervals)
        $timeSlots = [];
        $startTime = new \DateTime('07:30');
        $endTime = new \DateTime('19:30');
        
        while ($startTime <= $endTime) {
            $timeSlots[] = [
                'value' => $startTime->format('H:i'),
                'label' => $startTime->format('g:i A')
            ];
            $startTime->add(new \DateInterval('PT30M'));
        }
        
        return Inertia::render('ManageClassrooms', [
            'lecturers' => $lecturers->map(function ($lecturer) {
                return [
                    'id' => $lecturer->id,
                    'name' => $lecturer->name,
                    'email' => $lecturer->email,
                ];
            }),
            'locations' => $locations,
            'rooms' => $rooms->map(function ($room) {
                return [
                    'id' => $room->id,
                    'roomId' => $room->RoomID,
                    'building' => $room->location ? $room->location->name : 'Unknown Building',
                    'building_id' => $room->building_id,
                    'venueType' => $room->venueType ? $room->venueType->name : 'Unknown Type',
                    'level' => $room->level,
                    'capacity' => $room->capacity,
                ];
            }),
            'timeSlots' => $timeSlots,
            'debug_info' => [
                'total_lecturers' => $lecturers->count(),
                'total_locations' => $locations->count(),
                'total_rooms' => $rooms->count(),
                'controller_timestamp' => now()->toDateTimeString(),
            ]
        ]);
    }

    public function bookClassroom(Request $request)
    {
        $validated = $request->validate([
            'lecturer_id' => 'required|exists:users,id',
            'room_id' => 'required|exists:rooms,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'days_of_week' => 'required|array|min:1',
            'days_of_week.*' => 'in:monday,tuesday,wednesday,thursday,friday,saturday,sunday'
        ]);

        try {
            // Create date range
            $startDate = new \DateTime($validated['start_date']);
            $endDate = new \DateTime($validated['end_date']);
            $bookings = [];

            // Loop through each date in the range
            while ($startDate <= $endDate) {
                $dayOfWeek = strtolower($startDate->format('l'));
                
                // Check if this day is in the selected days of week
                if (in_array($dayOfWeek, $validated['days_of_week'])) {
                    // Check for existing bookings conflict
                    $existingBooking = RoomBooking::where('room_id', $validated['room_id'])
                        ->where('booking_date', $startDate->format('Y-m-d'))
                        ->where(function ($query) use ($validated) {
                            $query->where(function ($q) use ($validated) {
                                // New booking starts during existing booking
                                $q->where('start_time', '<=', $validated['start_time'])
                                  ->where('end_time', '>', $validated['start_time']);
                            })->orWhere(function ($q) use ($validated) {
                                // New booking ends during existing booking
                                $q->where('start_time', '<', $validated['end_time'])
                                  ->where('end_time', '>=', $validated['end_time']);
                            })->orWhere(function ($q) use ($validated) {
                                // New booking completely overlaps existing booking
                                $q->where('start_time', '>=', $validated['start_time'])
                                  ->where('end_time', '<=', $validated['end_time']);
                            });
                        })
                        ->first();

                    if ($existingBooking) {
                        return response()->json([
                            'success' => false,
                            'message' => "Booking conflict on {$startDate->format('Y-m-d')} ({$dayOfWeek}). Room is already booked during this time."
                        ], 422);
                    }

                    // Create the booking
                    $booking = RoomBooking::create([
                        'user_id' => $validated['lecturer_id'],
                        'room_id' => $validated['room_id'],
                        'booking_date' => $startDate->format('Y-m-d'),
                        'start_time' => $validated['start_time'],
                        'end_time' => $validated['end_time'],
                    ]);

                    $bookings[] = $booking;
                }
                
                $startDate->add(new \DateInterval('P1D'));
            }

            return response()->json([
                'success' => true,
                'message' => 'Classroom bookings created successfully!',
                'bookings_created' => count($bookings)
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while creating the booking: ' . $e->getMessage()
            ], 500);
        }
    }

    public function checkBookingConflicts(Request $request)
    {
        $validated = $request->validate([
            'room_id' => 'required|exists:rooms,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'days_of_week' => 'required|array|min:1',
            'days_of_week.*' => 'in:monday,tuesday,wednesday,thursday,friday,saturday,sunday'
        ]);

        try {
            $conflicts = [];
            $startDate = new \DateTime($validated['start_date']);
            $endDate = new \DateTime($validated['end_date']);

            // Loop through each date in the range
            while ($startDate <= $endDate) {
                $dayOfWeek = strtolower($startDate->format('l'));
                
                // Check if this day is in the selected days of week
                if (in_array($dayOfWeek, $validated['days_of_week'])) {
                    // Get all bookings for this room on this date
                    $dayBookings = RoomBooking::where('room_id', $validated['room_id'])
                        ->where('booking_date', $startDate->format('Y-m-d'))
                        ->with('user')
                        ->get();

                    if ($dayBookings->isNotEmpty()) {
                        $conflicts[$startDate->format('Y-m-d')] = $dayBookings->map(function ($booking) {
                            return [
                                'id' => $booking->id,
                                'start_time' => $booking->start_time,
                                'end_time' => $booking->end_time,
                                'lecturer_name' => $booking->user->name,
                                'lecturer_email' => $booking->user->email,
                            ];
                        })->toArray();
                    }
                }
                
                $startDate->add(new \DateInterval('P1D'));
            }

            return response()->json([
                'success' => true,
                'conflicts' => $conflicts
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while checking conflicts: ' . $e->getMessage()
            ], 500);
        }
    }
}
