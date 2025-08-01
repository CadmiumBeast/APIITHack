<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\RoomBooking;
use App\Models\Room;
use App\Models\User;
use App\Models\Location;
use App\Models\VenueType;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class LecturerController extends Controller
{
    public function dashboard()
    {
        $user = Auth::user();
        
        // Get real statistics for the lecturer
        $totalBookings = RoomBooking::where('user_id', $user->id)->count();
        
        $todayBookings = RoomBooking::where('user_id', $user->id)
                                  ->whereDate('booking_date', today())
                                  ->count();
        
        $upcomingBookings = RoomBooking::where('user_id', $user->id)
                                     ->whereBetween('booking_date', [
                                         today()->addDay(),
                                         today()->addDays(7)
                                     ])
                                     ->count();
        
        // Get available rooms (total rooms minus booked rooms for current time)
        $totalRooms = Room::count();
        $currentTime = now()->format('H:i');
        $bookedRoomsNow = RoomBooking::whereDate('booking_date', today())
                                   ->where('start_time', '<=', $currentTime)
                                   ->where('end_time', '>=', $currentTime)
                                   ->distinct('room_id')
                                   ->count();
        $availableRooms = $totalRooms - $bookedRoomsNow;
        
        // Get today's detailed bookings for the lecturer
        $todayDetailedBookings = RoomBooking::where('user_id', $user->id)
                                           ->whereDate('booking_date', today())
                                           ->with(['room.location', 'room.venueType'])
                                           ->orderBy('start_time')
                                           ->get();
        
        $formattedTodayBookings = $todayDetailedBookings->map(function ($booking) {
            return [
                'id' => $booking->id,
                'roomName' => $booking->room->RoomID,
                'building' => $booking->room->location ? $booking->room->location->name : 'Unknown Building',
                'time' => date('H:i', strtotime($booking->start_time)) . ' - ' . date('H:i', strtotime($booking->end_time)),
                'subject' => 'Lecture', // You can add a subject field to the bookings table if needed
                'status' => 'confirmed', // You can add a status field to the bookings table if needed
                'start_time' => $booking->start_time,
                'end_time' => $booking->end_time,
                'booking_date' => $booking->booking_date,
            ];
        });
        
        return Inertia::render('lecturer/dashboard', [
            'stats' => [
                'totalBookings' => $totalBookings,
                'todayBookings' => $todayBookings,
                'upcomingBookings' => $upcomingBookings,
                'availableRooms' => $availableRooms,
            ],
            'todayBookings' => $formattedTodayBookings,
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
            ]
        ]);
    }
    
    public function cancelBooking(Request $request, $id)
    {
        $user = Auth::user();
        
        try {
            $booking = RoomBooking::where('id', $id)
                                 ->where('user_id', $user->id)
                                 ->firstOrFail();
            
            // Check if booking is for today or future
            if ($booking->booking_date < today()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot cancel past bookings'
                ], 422);
            }
            
            // Check if booking is within 2 hours (optional business rule)
            $bookingDateTime = \Carbon\Carbon::parse($booking->booking_date . ' ' . $booking->start_time);
            if ($bookingDateTime->diffInHours(now()) < 2) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot cancel bookings within 2 hours of start time'
                ], 422);
            }
            
            $booking->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Booking cancelled successfully'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error cancelling booking: ' . $e->getMessage()
            ], 500);
        }
    }
    
    public function roomSearch(Request $request)
    {
        // Get all locations and venue types for filters
        $locations = Location::all();
        $venueTypes = VenueType::all();
        
        // Get all rooms with their relationships
        $rooms = Room::with(['location', 'venueType'])->get();
        
        return Inertia::render('lecturer/room-search', [
            'locations' => $locations,
            'venueTypes' => $venueTypes,
            'rooms' => $rooms->map(function ($room) {
                return [
                    'id' => $room->id,
                    'roomId' => $room->RoomID,
                    'name' => $room->RoomID,
                    'building' => $room->location ? $room->location->name : 'Unknown Building',
                    'buildingId' => $room->building_id,
                    'venueType' => $room->venueType ? $room->venueType->name : 'Unknown Type',
                    'venueTypeId' => $room->venue_type_id,
                    'level' => $room->level,
                    'capacity' => $room->capacity,
                ];
            })
        ]);
    }
    
    public function searchAvailableRooms(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date|after_or_equal:today',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'building_id' => 'nullable|exists:locations,id',
            'venue_type_id' => 'nullable|exists:venue_types,id',
            'min_capacity' => 'nullable|integer|min:1'
        ]);

        try {
            // Build the base query for rooms
            $roomsQuery = Room::with(['location', 'venueType']);

            // Apply filters
            if (!empty($validated['building_id'])) {
                $roomsQuery->where('building_id', $validated['building_id']);
            }

            if (!empty($validated['venue_type_id'])) {
                $roomsQuery->where('venue_type_id', $validated['venue_type_id']);
            }

            if (!empty($validated['min_capacity'])) {
                $roomsQuery->where('capacity', '>=', $validated['min_capacity']);
            }

            $allRooms = $roomsQuery->get();

            // Check availability for each room
            $availableRooms = [];
            foreach ($allRooms as $room) {
                // Check if room is booked during the requested time slot
                $conflictingBooking = RoomBooking::where('room_id', $room->id)
                    ->where('booking_date', $validated['date'])
                    ->where(function ($query) use ($validated) {
                        $query->where(function ($q) use ($validated) {
                            // New time slot starts during existing booking
                            $q->where('start_time', '<=', $validated['start_time'])
                              ->where('end_time', '>', $validated['start_time']);
                        })->orWhere(function ($q) use ($validated) {
                            // New time slot ends during existing booking
                            $q->where('start_time', '<', $validated['end_time'])
                              ->where('end_time', '>=', $validated['end_time']);
                        })->orWhere(function ($q) use ($validated) {
                            // New time slot completely overlaps existing booking
                            $q->where('start_time', '>=', $validated['start_time'])
                              ->where('end_time', '<=', $validated['end_time']);
                        });
                    })
                    ->exists();

                $isAvailable = !$conflictingBooking;

                // Get existing bookings for this room on this date (for display)
                $existingBookings = RoomBooking::where('room_id', $room->id)
                    ->where('booking_date', $validated['date'])
                    ->with('user')
                    ->orderBy('start_time')
                    ->get();

                $availableRooms[] = [
                    'id' => $room->id,
                    'roomId' => $room->RoomID,
                    'name' => $room->RoomID,
                    'building' => $room->location ? $room->location->name : 'Unknown Building',
                    'buildingId' => $room->building_id,
                    'venueType' => $room->venueType ? $room->venueType->name : 'Unknown Type',
                    'venueTypeId' => $room->venue_type_id,
                    'level' => $room->level,
                    'capacity' => $room->capacity,
                    'isAvailable' => $isAvailable,
                    'existingBookings' => $existingBookings->map(function ($booking) {
                        return [
                            'id' => $booking->id,
                            'start_time' => $booking->start_time,
                            'end_time' => $booking->end_time,
                            'lecturer_name' => $booking->user->name,
                            'lecturer_email' => $booking->user->email,
                        ];
                    })
                ];
            }

            return response()->json([
                'success' => true,
                'rooms' => $availableRooms,
                'search_criteria' => $validated
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error searching for available rooms: ' . $e->getMessage()
            ], 500);
        }
    }
    
    public function createBooking()
    {
        // Get all locations and venue types for filters
        $locations = Location::all();
        $venueTypes = VenueType::all();
        
        // Get all rooms with their relationships
        $rooms = Room::with(['location', 'venueType'])->get();
        
        // Get user's today bookings count for daily limit
        $user = Auth::user();
        $todayBookingsCount = RoomBooking::where('user_id', $user->id)
                                        ->whereDate('booking_date', today())
                                        ->count();
        
        return Inertia::render('lecturer/create-booking', [
            'locations' => $locations,
            'venueTypes' => $venueTypes,
            'rooms' => $rooms->map(function ($room) {
                return [
                    'id' => $room->id,
                    'roomId' => $room->RoomID,
                    'name' => $room->RoomID,
                    'building' => $room->location ? $room->location->name : 'Unknown Building',
                    'buildingId' => $room->building_id,
                    'venueType' => $room->venueType ? $room->venueType->name : 'Unknown Type',
                    'venueTypeId' => $room->venue_type_id,
                    'level' => $room->level,
                    'capacity' => $room->capacity,
                ];
            }),
            'todayBookingsCount' => $todayBookingsCount,
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
            ]
        ]);
    }
    
    public function storeBooking(Request $request)
    {
        $user = Auth::user();
        
        $validated = $request->validate([
            'date' => 'required|date|after_or_equal:today',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'room_id' => 'required|exists:rooms,id',
        ]);

        try {
            // Check daily booking limit (4 bookings per day)
            $todayBookingsCount = RoomBooking::where('user_id', $user->id)
                                            ->whereDate('booking_date', today())
                                            ->count();
            
            if ($todayBookingsCount >= 4) {
                return response()->json([
                    'success' => false,
                    'message' => 'You have reached the maximum daily booking limit (4 bookings per day).'
                ], 422);
            }

            // Check for conflicts with existing bookings
            $conflictingBooking = RoomBooking::where('room_id', $validated['room_id'])
                ->where('booking_date', $validated['date'])
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
                ->exists();

            if ($conflictingBooking) {
                return response()->json([
                    'success' => false,
                    'message' => 'This room is already booked during the selected time slot. Please choose a different time or room.'
                ], 422);
            }

            // Create the booking
            $booking = RoomBooking::create([
                'user_id' => $user->id,
                'room_id' => $validated['room_id'],
                'booking_date' => $validated['date'],
                'start_time' => $validated['start_time'],
                'end_time' => $validated['end_time'],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Booking created successfully!',
                'booking' => $booking
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error creating booking: ' . $e->getMessage()
            ], 500);
        }
    }
    
    public function checkRoomAvailability(Request $request)
    {
        $validated = $request->validate([
            'room_id' => 'required|exists:rooms,id',
            'date' => 'required|date|after_or_equal:today',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
        ]);

        try {
            // Check for conflicts with existing bookings
            $conflictingBookings = RoomBooking::where('room_id', $validated['room_id'])
                ->where('booking_date', $validated['date'])
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
                ->with('user')
                ->get();

            $isAvailable = $conflictingBookings->isEmpty();

            return response()->json([
                'success' => true,
                'available' => $isAvailable,
                'conflicts' => $conflictingBookings->map(function ($booking) {
                    return [
                        'start_time' => $booking->start_time,
                        'end_time' => $booking->end_time,
                        'lecturer_name' => $booking->user->name,
                    ];
                })
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error checking availability: ' . $e->getMessage()
            ], 500);
        }
    }

    public function schedule()
    {
        $user = Auth::user();
        
        // Get all bookings for the authenticated lecturer
        $bookings = RoomBooking::where('user_id', $user->id)
                              ->with(['room.location', 'room.venueType'])
                              ->orderBy('booking_date', 'desc')
                              ->orderBy('start_time', 'desc')
                              ->get()
                              ->map(function ($booking) {
                                  $bookingDate = \Carbon\Carbon::parse($booking->booking_date);
                                  $now = \Carbon\Carbon::now();
                                  $bookingStart = \Carbon\Carbon::parse($booking->booking_date . ' ' . $booking->start_time);
                                  
                                  // Check if booking is in the past
                                  $isPast = $bookingStart->isPast();
                                  
                                  // Check if booking can be cancelled (at least 1 hour before start time)
                                  $canCancel = $bookingStart->diffInHours($now) >= 1 && !$isPast;
                                  
                                  return [
                                      'id' => $booking->id,
                                      'roomName' => $booking->room->RoomID,
                                      'building' => $booking->room->location->name,
                                      'venueType' => $booking->room->venueType->name,
                                      'capacity' => $booking->room->capacity,
                                      'level' => $booking->room->level,
                                      'date' => $booking->booking_date,
                                      'startTime' => $booking->start_time,
                                      'endTime' => $booking->end_time,
                                      'purpose' => 'Room Booking', // Default purpose since description field doesn't exist
                                      'status' => 'confirmed', // All stored bookings are confirmed
                                      'canCancel' => $canCancel,
                                      'isPast' => $isPast,
                                  ];
                              });

        return Inertia::render('lecturer/schedule', [
            'bookings' => $bookings,
        ]);
    }
}
