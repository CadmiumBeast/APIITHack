import { Head, router, Link, usePage } from '@inertiajs/react';
import { Search, Filter, Calendar, Clock, MapPin, Users, Building, CalendarDays, GraduationCap, LogOut, Plus } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Lecturer Dashboard',
        href: '/lecturer/dashboard',
    },
    {
        title: 'Find Rooms',
        href: '/lecturer/room-search',
    },
];

interface Location {
    id: number;
    name: string;
}

interface VenueType {
    id: number;
    name: string;
}

interface Room {
    id: number;
    roomId: string;
    name: string;
    building: string;
    buildingId: number;
    venueType: string;
    venueTypeId: number;
    level: string;
    capacity: number;
    isAvailable?: boolean;
    existingBookings?: Booking[];
}

interface Booking {
    id: number;
    start_time: string;
    end_time: string;
    lecturer_name: string;
    lecturer_email: string;
}

interface Props {
    locations: Location[];
    venueTypes: VenueType[];
    rooms: Room[];
}

export default function RoomSearch({ locations, venueTypes, rooms }: Props) {
    
    const handleLogout = () => {
        router.post('/logout');
    };

    const [filters, setFilters] = useState({
        date: '',
        startTime: '',
        endTime: '',
        building: '',
        venueType: '',
        capacity: '',
    });

    const [searchResults, setSearchResults] = useState<Room[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleSearch = async () => {
        // Validate required fields
        if (!filters.date || !filters.startTime || !filters.endTime) {
            alert('Please fill in date, start time, and end time to search for available rooms.');
            return;
        }

        setIsSearching(true);
        setHasSearched(true);
        
        try {
            const response = await fetch('/lecturer/search-available-rooms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({
                    date: filters.date,
                    start_time: filters.startTime,
                    end_time: filters.endTime,
                    building_id: filters.building === 'all' || filters.building === '' ? null : filters.building,
                    venue_type_id: filters.venueType === 'all' || filters.venueType === '' ? null : filters.venueType,
                    min_capacity: filters.capacity || null
                })
            });

            const result = await response.json();
            if (result.success) {
                setSearchResults(result.rooms);
            } else {
                alert('Error searching rooms: ' + result.message);
            }
        } catch (error) {
            console.error('Search error:', error);
            alert('Error searching for available rooms');
        } finally {
            setIsSearching(false);
        }
    };

    const handleBookRoom = (roomId: string) => {
        // Navigate to create booking with pre-filled room data
        const selectedRoom = searchResults.find(room => room.roomId === roomId);
        if (selectedRoom) {
            // Store the booking data in session storage to pre-fill the form
            sessionStorage.setItem('prebookingData', JSON.stringify({
                roomId: selectedRoom.id,
                roomName: selectedRoom.name,
                date: filters.date,
                startTime: filters.startTime,
                endTime: filters.endTime
            }));
            router.visit('/lecturer/create-booking');
        }
    };

    const formatTime = (timeString: string) => {
        return new Date(`2000-01-01 ${timeString}`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <Head title="Find Available Rooms" />
            
            {/* Header */}
            <div className="bg-gradient-to-r from-[#00b2a7] to-[#019d95] text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="bg-white/20 rounded-lg p-3">
                                <Search className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">Find Available Rooms</h1>
                                <p className="text-blue-100 mt-1">Search and filter available classrooms</p>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3">
                            <Link href="/lecturer/dashboard" className="w-full sm:w-auto">
                                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 w-full sm:w-auto">
                                    <GraduationCap className="h-4 w-4 mr-2" />
                                    <span className="hidden sm:inline">Dashboard</span>
                                    <span className="sm:hidden">Home</span>
                                </Button>
                            </Link>
                            <Link href="/lecturer/create-booking" className="w-full sm:w-auto">
                                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 w-full sm:w-auto">
                                    <Plus className="h-4 w-4 mr-2" />
                                    <span className="hidden sm:inline">New Booking</span>
                                    <span className="sm:hidden">Book</span>
                                </Button>
                            </Link>
                            <Button 
                                onClick={handleLogout}
                                className="bg-red-600 hover:bg-red-700 text-white font-semibold w-full sm:w-auto"
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Search Filters */}
                <Card className="border-0 shadow-lg bg-white mb-8">
                    <CardHeader className="border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                            <div className="bg-[#00b2a7]/10 p-2 rounded-lg">
                                <Filter className="h-6 w-6 text-[#00b2a7]" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-bold text-gray-900">Search Filters</CardTitle>
                                <CardDescription className="text-gray-600">Set your criteria to find the perfect classroom</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {/* Date */}
                            <div className="space-y-2">
                                <Label htmlFor="date" className="text-gray-700 font-medium">Date</Label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="date"
                                        type="date"
                                        value={filters.date}
                                        onChange={(e) => handleFilterChange('date', e.target.value)}
                                        className="pl-10 border-gray-200 focus:border-[#00b2a7] focus:ring-[#00b2a7] text-gray-900"
                                    />
                                </div>
                            </div>

                            {/* Start Time */}
                            <div className="space-y-2">
                                <Label htmlFor="startTime" className="text-gray-700 font-medium">Start Time</Label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="startTime"
                                        type="time"
                                        value={filters.startTime}
                                        onChange={(e) => handleFilterChange('startTime', e.target.value)}
                                        className="pl-10 border-gray-200 focus:border-[#00b2a7] focus:ring-[#00b2a7] text-gray-900"
                                    />
                                </div>
                            </div>

                            {/* End Time */}
                            <div className="space-y-2">
                                <Label htmlFor="endTime" className="text-gray-700 font-medium">End Time</Label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="endTime"
                                        type="time"
                                        value={filters.endTime}
                                        onChange={(e) => handleFilterChange('endTime', e.target.value)}
                                        className="pl-10 border-gray-200 focus:border-[#00b2a7] focus:ring-[#00b2a7] text-gray-900"
                                    />
                                </div>
                            </div>

                            {/* Building */}
                            <div className="space-y-2">
                                <Label htmlFor="building" className="text-gray-700 font-medium">Building</Label>
                                <div className="relative">
                                    <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Select value={filters.building} onValueChange={(value) => handleFilterChange('building', value)}>
                                        <SelectTrigger id="building" className="pl-10 border-gray-200 focus:border-[#00b2a7] focus:ring-[#00b2a7]">
                                            <SelectValue placeholder="Select building" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Buildings</SelectItem>
                                            {locations.map((location) => (
                                                <SelectItem key={location.id} value={location.id.toString()}>
                                                    {location.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Venue Type */}
                            <div className="space-y-2">
                                <Label htmlFor="venueType" className="text-gray-700 font-medium">Venue Type</Label>
                                <Select value={filters.venueType} onValueChange={(value) => handleFilterChange('venueType', value)}>
                                    <SelectTrigger id="venueType" className="border-gray-200 focus:border-[#00b2a7] focus:ring-[#00b2a7]">
                                        <SelectValue placeholder="Select venue type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        {venueTypes.map((type) => (
                                            <SelectItem key={type.id} value={type.id.toString()}>
                                                {type.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Capacity */}
                            <div className="space-y-2">
                                <Label htmlFor="capacity" className="text-gray-700 font-medium">Minimum Capacity</Label>
                                <div className="relative">
                                    <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="capacity"
                                        type="number"
                                        placeholder="e.g., 20"
                                        value={filters.capacity}
                                        onChange={(e) => handleFilterChange('capacity', e.target.value)}
                                        className="pl-10 border-gray-200 focus:border-[#00b2a7] focus:ring-[#00b2a7] text-gray-900"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end mt-6">
                            <Button 
                                onClick={handleSearch}
                                disabled={isSearching}
                                className="bg-gradient-to-r from-[#00b2a7] to-[#019d95] hover:from-[#019d95] hover:to-[#018f87] text-white font-semibold px-8 py-3 rounded-lg shadow-lg disabled:opacity-50"
                            >
                                {isSearching ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Searching...
                                    </>
                                ) : (
                                    <>
                                        <Search className="h-5 w-5 mr-2" />
                                        Search Rooms
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Search Results */}
                <Card className="border-0 shadow-lg bg-white">
                    <CardHeader className="border-b border-gray-100">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="bg-[#00b2a7]/10 p-2 rounded-lg">
                                    <Building className="h-6 w-6 text-[#00b2a7]" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-bold text-gray-900">Available Rooms</CardTitle>
                                    <CardDescription className="text-gray-600">{searchResults.length} rooms found</CardDescription>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        {!hasSearched ? (
                            <div className="text-center py-12">
                                <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                    <Search className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Search for Available Rooms</h3>
                                <p className="text-gray-600">Enter your date and time requirements to find available classrooms</p>
                            </div>
                        ) : searchResults.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                    <MapPin className="h-8 w-8 text-red-500" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Available Rooms</h3>
                                <p className="text-gray-600">No rooms found matching your criteria. Try adjusting your search filters.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                {searchResults.map((room) => (
                                    <Card key={room.id} className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${!room.isAvailable ? 'opacity-75' : ''}`}>
                                        <CardHeader className="pb-4">
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-lg font-bold text-gray-900">{room.name}</CardTitle>
                                                <Badge 
                                                    variant={room.isAvailable ? 'default' : 'secondary'}
                                                    className={room.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-600'}
                                                >
                                                    {room.isAvailable ? 'Available' : 'Occupied'}
                                                </Badge>
                                            </div>
                                            <CardDescription className="text-sm text-gray-600">
                                                Room ID: {room.roomId}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex items-center space-x-3 text-sm">
                                                <div className="bg-[#00b2a7]/10 p-2 rounded-lg">
                                                    <MapPin className="h-4 w-4 text-[#00b2a7]" />
                                                </div>
                                                <span className="text-gray-700 font-medium">{room.building}</span>
                                            </div>
                                            <div className="flex items-center space-x-3 text-sm">
                                                <div className="bg-blue-100 p-2 rounded-lg">
                                                    <Building className="h-4 w-4 text-blue-600" />
                                                </div>
                                                <span className="text-gray-700">{room.venueType} • {room.level}</span>
                                            </div>
                                            <div className="flex items-center space-x-3 text-sm">
                                                <div className="bg-green-100 p-2 rounded-lg">
                                                    <Users className="h-4 w-4 text-green-600" />
                                                </div>
                                                <span className="text-gray-700 font-medium">Capacity: {room.capacity} students</span>
                                            </div>
                                            
                                            {/* Show existing bookings for this date */}
                                            {room.existingBookings && room.existingBookings.length > 0 && (
                                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                                    <h4 className="text-sm font-semibold text-yellow-800 mb-2">Existing Bookings Today:</h4>
                                                    <div className="space-y-1">
                                                        {room.existingBookings.map((booking, index) => (
                                                            <div key={index} className="text-xs text-yellow-700">
                                                                {formatTime(booking.start_time)} - {formatTime(booking.end_time)} ({booking.lecturer_name})
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {room.isAvailable ? (
                                                <Button 
                                                    onClick={() => handleBookRoom(room.roomId)}
                                                    className="w-full bg-gradient-to-r from-[#00b2a7] to-[#019d95] hover:from-[#019d95] hover:to-[#018f87] text-white font-semibold py-3 rounded-lg shadow-lg"
                                                >
                                                    Book This Room
                                                </Button>
                                            ) : (
                                                <Button 
                                                    disabled
                                                    className="w-full bg-gray-300 text-gray-500 font-semibold py-3 rounded-lg cursor-not-allowed"
                                                >
                                                    Not Available
                                                </Button>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Footer */}
                <div className="mt-12 text-center text-gray-500 text-sm">
                    <p>© 2025 APIIT IT Department. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
} 