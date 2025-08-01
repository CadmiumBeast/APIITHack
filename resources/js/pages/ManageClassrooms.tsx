import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '../layouts/AdminLayout';
import * as Select from '@radix-ui/react-select';
import * as Dialog from '@radix-ui/react-dialog';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

interface Lecturer {
    id: number;
    name: string;
    email: string;
}

interface Location {
    id: number;
    name: string;
}

interface Room {
    id: number;
    roomId: string;
    building: string;
    building_id: number;
    venueType: string;
    level: string;
    capacity: number;
}

interface TimeSlot {
    value: string;
    label: string;
}

interface Props {
    lecturers: Lecturer[];
    locations: Location[];
    rooms: Room[];
    timeSlots: TimeSlot[];
    debug_info: {
        total_lecturers: number;
        total_locations: number;
        total_rooms: number;
        controller_timestamp: string;
    };
}

export default function ManageClassrooms({ lecturers, locations, rooms, timeSlots, debug_info }: Props) {
    // Step 1: Lecturer selection
    const [selectedLecturer, setSelectedLecturer] = useState<Lecturer | null>(null);
    
    // Step 2: Date range selection
    const [dateRange, setDateRange] = useState<{start: Date | null, end: Date | null}>({
        start: null,
        end: null
    });
    
    // Step 3: Time range selection (7:30 AM to 7:30 PM) and day of week
    const [timeRange, setTimeRange] = useState<{start: string, end: string}>({
        start: '',
        end: ''
    });
    
    // Day of week selection
    const [selectedDaysOfWeek, setSelectedDaysOfWeek] = useState<string[]>([]);
    
    const daysOfWeek = [
        { value: 'monday', label: 'Monday' },
        { value: 'tuesday', label: 'Tuesday' },
        { value: 'wednesday', label: 'Wednesday' },
        { value: 'thursday', label: 'Thursday' },
        { value: 'friday', label: 'Friday' },
        { value: 'saturday', label: 'Saturday' },
        { value: 'sunday', label: 'Sunday' }
    ];
    
    // Additional filters
    const [selectedLocation, setSelectedLocation] = useState<string>('all');
    const [filteredRooms, setFilteredRooms] = useState<Room[]>(rooms);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    
    // Booking state
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [bookingStatus, setBookingStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    
    // Conflict checking state
    const [conflicts, setConflicts] = useState<{[date: string]: any[]}>({});
    const [checkingConflicts, setCheckingConflicts] = useState(false);

    // Filter rooms based on selected location
    useEffect(() => {
        if (selectedLocation === 'all') {
            setFilteredRooms(rooms);
        } else {
            const filtered = rooms.filter(room => room.building_id === parseInt(selectedLocation));
            setFilteredRooms(filtered);
        }
        setSelectedRoom(null); // Reset room selection when location changes
    }, [selectedLocation, rooms]);

    // Check if we can proceed to next step
    const canSelectDateRange = selectedLecturer !== null;
    const canSelectTimeRange = canSelectDateRange && dateRange.start !== null && dateRange.end !== null;
    const canBookRoom = canSelectTimeRange && timeRange.start !== '' && timeRange.end !== '' && selectedDaysOfWeek.length > 0;

    // Handle lecturer search
    const [lecturerSearch, setLecturerSearch] = useState('');
    const filteredLecturers = lecturers.filter(lecturer => 
        lecturer.name.toLowerCase().includes(lecturerSearch.toLowerCase()) ||
        lecturer.email.toLowerCase().includes(lecturerSearch.toLowerCase())
    );

    // Handle day of week selection
    const toggleDayOfWeek = (day: string) => {
        setSelectedDaysOfWeek(prev => {
            if (prev.includes(day)) {
                return prev.filter(d => d !== day);
            } else {
                return [...prev, day];
            }
        });
    };

    // Check for booking conflicts
    const checkConflicts = async () => {
        if (!selectedRoom || !dateRange.start || !dateRange.end || selectedDaysOfWeek.length === 0) {
            setConflicts({});
            return;
        }

        setCheckingConflicts(true);
        
        const conflictData = {
            room_id: selectedRoom.id,
            start_date: dateRange.start.toISOString().split('T')[0],
            end_date: dateRange.end.toISOString().split('T')[0],
            days_of_week: selectedDaysOfWeek
        };

        try {
            const response = await fetch('/admin/classrooms/check-conflicts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify(conflictData)
            });

            const result = await response.json();
            if (result.success) {
                setConflicts(result.conflicts);
            }
        } catch (error) {
            console.error('Error checking conflicts:', error);
        } finally {
            setCheckingConflicts(false);
        }
    };

    // Check conflicts when room, dates, or days change
    useEffect(() => {
        checkConflicts();
    }, [selectedRoom, dateRange.start, dateRange.end, selectedDaysOfWeek]);

    // Function to check if a time slot conflicts with existing bookings
    const isTimeSlotConflicted = (timeValue: string, isEndTime = false) => {
        if (Object.keys(conflicts).length === 0) return false;
        
        // Check if any booking conflicts with this time slot
        for (const dateConflicts of Object.values(conflicts)) {
            for (const booking of dateConflicts) {
                const bookingStart = booking.start_time;
                const bookingEnd = booking.end_time;
                
                if (isEndTime) {
                    // For end time, check if it would overlap with any booking
                    if (timeValue > bookingStart && timeValue <= bookingEnd) {
                        return true;
                    }
                } else {
                    // For start time, check if it would overlap with any booking
                    if (timeValue >= bookingStart && timeValue < bookingEnd) {
                        return true;
                    }
                }
            }
        }
        return false;
    };

    // Handle booking
    const handleBookRoom = async () => {
        if (!selectedLecturer || !dateRange.start || !dateRange.end || !timeRange.start || !timeRange.end || selectedDaysOfWeek.length === 0 || !selectedRoom) {
            alert('Please complete all booking steps including selecting days of the week');
            return;
        }

        // Check if selected time range would conflict with existing bookings
        const hasConflict = isTimeSlotConflicted(timeRange.start, false) || 
                           isTimeSlotConflicted(timeRange.end, true) ||
                           // Check if any time in between conflicts
                           getAvailableTimeSlots()
                               .filter(slot => slot.value > timeRange.start && slot.value < timeRange.end)
                               .some(slot => isTimeSlotConflicted(slot.value, false));

        if (hasConflict) {
            const confirmed = confirm(
                'Warning: Your selected time range conflicts with existing bookings. ' +
                'This may cause booking conflicts. Do you want to proceed anyway?'
            );
            if (!confirmed) {
                return;
            }
        }

        setIsBookingModalOpen(true);
    };

    const confirmBooking = async () => {
        setBookingStatus('loading');
        
        const bookingData = {
            lecturer_id: selectedLecturer!.id,
            room_id: selectedRoom!.id,
            start_date: dateRange.start!.toISOString().split('T')[0], // Format as YYYY-MM-DD
            end_date: dateRange.end!.toISOString().split('T')[0], // Format as YYYY-MM-DD
            start_time: timeRange.start,
            end_time: timeRange.end,
            days_of_week: selectedDaysOfWeek
        };

        try {
            router.post('/admin/classrooms/book', bookingData, {
                onSuccess: (page) => {
                    setBookingStatus('success');
                    setTimeout(() => {
                        setIsBookingModalOpen(false);
                        setBookingStatus('idle');
                        // Reset form
                        setSelectedLecturer(null);
                        setDateRange({ start: null, end: null });
                        setTimeRange({ start: '', end: '' });
                        setSelectedDaysOfWeek([]);
                        setSelectedRoom(null);
                        setSelectedLocation('all');
                    }, 2000);
                },
                onError: (errors) => {
                    setBookingStatus('error');
                    console.error('Booking failed:', errors);
                }
            });
        } catch (error) {
            setBookingStatus('error');
            console.error('Booking failed:', error);
        }
    };

    // Get available time slots (7:30 AM to 7:30 PM)
    const getAvailableTimeSlots = () => {
        return timeSlots.filter(slot => {
            const time = slot.value;
            return time >= '07:30' && time <= '19:30';
        });
    };

    return (
        <AdminLayout>
            <Head title="Manage Classrooms" />
            
            <div className="space-y-8">
                <div className="flex justify-between items-center m-6">
                    <h1 className="text-3xl font-bold text-gray-900">Classroom Booking System</h1>
                </div>

                <div className="bg-white shadow-lg rounded-lg p-6">
                    <div className="space-y-8">
                        <div className="border-b pb-6">                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Select Lecturer by Name or Email
                                    </label>
                                    <input
                                        type="text"
                                        value={lecturerSearch}
                                        onChange={(e) => setLecturerSearch(e.target.value)}
                                        placeholder="Type to filter lecturers (e.g., 'lecturer', 'lecturer@apiit.lk')..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Showing {filteredLecturers.length} of {lecturers.length} lecturers
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-3">
                                        Select a lecturer from below:
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-4">
                                        {filteredLecturers.length > 0 ? (
                                            filteredLecturers.map((lecturer) => (
                                                <div
                                                    key={lecturer.id}
                                                    onClick={() => setSelectedLecturer(lecturer)}
                                                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                                        selectedLecturer?.id === lecturer.id
                                                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <h3 className="font-medium text-gray-900">{lecturer.name}</h3>
                                                    <p className="text-sm text-gray-600">{lecturer.email}</p>
                                                    {selectedLecturer?.id === lecturer.id && (
                                                        <div className="mt-2 text-blue-600 text-sm font-medium">
                                                            ✓ Selected
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="col-span-full text-center py-8 text-gray-500">
                                                <p>No lecturers found matching your search criteria.</p>
                                                <p className="text-sm mt-1">Try adjusting your search filter.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* {selectedLecturer && (
                                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                                        <p className="text-green-800">
                                            <strong>✓ Selected Lecturer:</strong> {selectedLecturer.name} ({selectedLecturer.email})
                                        </p>
                                        <p className="text-green-700 text-sm mt-1">
                                            You can now proceed to Step 2 - Date Range Selection
                                        </p>
                                    </div>
                                )} */}
                            </div>
                        </div>

                        <div className={`border-b pb-6 ${!canSelectDateRange ? 'opacity-50' : ''}`}>
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">
                                Select Date Range
                                {dateRange.start && dateRange.end && <span className="text-green-600 ml-2">✓</span>}
                            </h2>
                            
                            {!canSelectDateRange && (
                                <p className="text-gray-500 mb-4">Please select a lecturer first</p>
                            )}
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Start Date
                                    </label>
                                    <DatePicker
                                        selected={dateRange.start}
                                        onChange={(date) => setDateRange(prev => ({ ...prev, start: date }))}
                                        minDate={new Date()}
                                        disabled={!canSelectDateRange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholderText="Select start date"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        End Date
                                    </label>
                                    <DatePicker
                                        selected={dateRange.end}
                                        onChange={(date) => setDateRange(prev => ({ ...prev, end: date }))}
                                        minDate={dateRange.start || new Date()}
                                        disabled={!canSelectDateRange || !dateRange.start}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholderText="Select end date"
                                    />
                                </div>
                            </div>

                            {dateRange.start && dateRange.end && (
                                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <p className="text-green-800">
                                        <strong>Selected Date Range:</strong> {dateRange.start.toLocaleDateString()} to {dateRange.end.toLocaleDateString()}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Step 3: Select Time Range and Days of Week */}
                        <div className={`border-b pb-6 ${!canSelectTimeRange ? 'opacity-50' : ''}`}>
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">
                                Step 3: Select Time Range & Days of Week
                                {timeRange.start && timeRange.end && selectedDaysOfWeek.length > 0 && <span className="text-green-600 ml-2">✓</span>}
                            </h2>
                            
                            {!canSelectTimeRange && (
                                <p className="text-gray-500 mb-4">Please complete date range selection first</p>
                            )}
                            
                            <div className="space-y-6">
                                {/* Time Range Selection */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-700 mb-3">Select Time Range (7:30 AM - 7:30 PM)</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Start Time
                                            </label>
                                            <Select.Root 
                                                value={timeRange.start} 
                                                onValueChange={(value) => setTimeRange(prev => ({ ...prev, start: value }))}
                                                disabled={!canSelectTimeRange}
                                            >
                                                <Select.Trigger className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                                                    <Select.Value placeholder="Select start time" />
                                                    <Select.Icon className="ml-auto">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </Select.Icon>
                                                </Select.Trigger>
                                                <Select.Portal>
                                                    <Select.Content className="bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto z-50">
                                                        <Select.ScrollUpButton className="flex items-center justify-center h-6 text-gray-600">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                            </svg>
                                                        </Select.ScrollUpButton>
                                                        <Select.Viewport className="p-1">
                                                            {getAvailableTimeSlots().map((slot) => {
                                                                const isConflicted = isTimeSlotConflicted(slot.value, false);
                                                                return (
                                                                    <Select.Item
                                                                        key={slot.value}
                                                                        value={slot.value}
                                                                        disabled={isConflicted}
                                                                        className={`relative select-none px-3 py-2 text-sm rounded cursor-pointer outline-none ${
                                                                            isConflicted 
                                                                                ? 'bg-red-50 text-red-400 cursor-not-allowed opacity-50' 
                                                                                : 'hover:bg-blue-50 focus:bg-blue-50'
                                                                        }`}
                                                                    >
                                                                        <Select.ItemText>
                                                                            {slot.label} {isConflicted && '(Booked)'}
                                                                        </Select.ItemText>
                                                                    </Select.Item>
                                                                );
                                                            })}
                                                        </Select.Viewport>
                                                        <Select.ScrollDownButton className="flex items-center justify-center h-6 text-gray-600">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                            </svg>
                                                        </Select.ScrollDownButton>
                                                    </Select.Content>
                                                </Select.Portal>
                                            </Select.Root>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                End Time
                                            </label>
                                            <Select.Root 
                                                value={timeRange.end} 
                                                onValueChange={(value) => setTimeRange(prev => ({ ...prev, end: value }))}
                                                disabled={!canSelectTimeRange || !timeRange.start}
                                            >
                                                <Select.Trigger className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                                                    <Select.Value placeholder="Select end time" />
                                                    <Select.Icon className="ml-auto">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </Select.Icon>
                                                </Select.Trigger>
                                                <Select.Portal>
                                                    <Select.Content className="bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto z-50">
                                                        <Select.ScrollUpButton className="flex items-center justify-center h-6 text-gray-600">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                            </svg>
                                                        </Select.ScrollUpButton>
                                                        <Select.Viewport className="p-1">
                                                            {getAvailableTimeSlots()
                                                                .filter(slot => !timeRange.start || slot.value > timeRange.start)
                                                                .map((slot) => {
                                                                    const isConflicted = isTimeSlotConflicted(slot.value, true);
                                                                    return (
                                                                        <Select.Item
                                                                            key={slot.value}
                                                                            value={slot.value}
                                                                            disabled={isConflicted}
                                                                            className={`relative select-none px-3 py-2 text-sm rounded cursor-pointer outline-none ${
                                                                                isConflicted 
                                                                                    ? 'bg-red-50 text-red-400 cursor-not-allowed opacity-50' 
                                                                                    : 'hover:bg-blue-50 focus:bg-blue-50'
                                                                            }`}
                                                                        >
                                                                            <Select.ItemText>
                                                                                {slot.label} {isConflicted && '(Booked)'}
                                                                            </Select.ItemText>
                                                                        </Select.Item>
                                                                    );
                                                                })}
                                                        </Select.Viewport>
                                                        <Select.ScrollDownButton className="flex items-center justify-center h-6 text-gray-600">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                            </svg>
                                                        </Select.ScrollDownButton>
                                                    </Select.Content>
                                                </Select.Portal>
                                            </Select.Root>
                                        </div>
                                    </div>
                                </div>

                                {/* Days of Week Selection */}
                                <div className={`${!timeRange.start || !timeRange.end ? 'opacity-50' : ''}`}>
                                    <h3 className="text-lg font-medium text-gray-700 mb-3">Select Days of Week</h3>
                                    <p className="text-sm text-gray-600 mb-3">Choose which days of the week this booking applies to:</p>
                                    
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                                        {daysOfWeek.map((day) => (
                                            <button
                                                key={day.value}
                                                type="button"
                                                onClick={() => (!timeRange.start || !timeRange.end) ? null : toggleDayOfWeek(day.value)}
                                                disabled={!timeRange.start || !timeRange.end}
                                                className={`px-4 py-3 text-sm font-medium rounded-lg border transition-colors ${
                                                    selectedDaysOfWeek.includes(day.value)
                                                        ? 'bg-blue-500 text-white border-blue-500'
                                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                                } ${(!timeRange.start || !timeRange.end) ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                            >
                                                {day.label}
                                            </button>
                                        ))}
                                    </div>
                                    
                                    {/* {selectedDaysOfWeek.length > 0 && (
                                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                            <p className="text-blue-800 text-sm">
                                                <strong>Selected Days:</strong> {selectedDaysOfWeek.map(day => 
                                                    daysOfWeek.find(d => d.value === day)?.label
                                                ).join(', ')}
                                            </p>
                                        </div>
                                    )} */}
                                    
                                    {!timeRange.start || !timeRange.end ? (
                                        <p className="text-gray-500 text-sm mt-3">Please select both start and end time first</p>
                                    ) : null}
                                </div>
                            </div>

                            {timeRange.start && timeRange.end && selectedDaysOfWeek.length > 0 && (
                                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <p className="text-green-800">
                                        <strong>Selected Schedule:</strong><br />
                                        <span className="text-sm">
                                            Time: {timeSlots.find(slot => slot.value === timeRange.start)?.label} to {timeSlots.find(slot => slot.value === timeRange.end)?.label}<br />
                                            Days: {selectedDaysOfWeek.map(day => daysOfWeek.find(d => d.value === day)?.label).join(', ')}
                                        </span>
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Step 4: Select Room and Book */}
                        <div className={`${!canBookRoom ? 'opacity-50' : ''}`}>
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">
                                Select Location
                            </h2>
                            
                            {!canBookRoom && (
                                <p className="text-gray-500 mb-4">Please complete time range and days of week selection first</p>
                            )}
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Filter by Location
                                    </label>
                                    <Select.Root 
                                        value={selectedLocation} 
                                        onValueChange={setSelectedLocation}
                                        disabled={!canBookRoom}
                                    >
                                        <Select.Trigger className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                                            <Select.Value />
                                            <Select.Icon className="ml-auto">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </Select.Icon>
                                        </Select.Trigger>
                                        <Select.Portal>
                                            <Select.Content className="bg-white border border-gray-300 rounded-md shadow-lg z-50">
                                                <Select.Viewport className="p-1">
                                                    <Select.Item value="all" className="relative select-none px-3 py-2 text-sm rounded cursor-pointer hover:bg-blue-50 focus:bg-blue-50 outline-none">
                                                        <Select.ItemText>All Locations</Select.ItemText>
                                                    </Select.Item>
                                                    {locations.map((location) => (
                                                        <Select.Item
                                                            key={location.id}
                                                            value={location.id.toString()}
                                                            className="relative select-none px-3 py-2 text-sm rounded cursor-pointer hover:bg-blue-50 focus:bg-blue-50 outline-none"
                                                        >
                                                            <Select.ItemText>{location.name}</Select.ItemText>
                                                        </Select.Item>
                                                    ))}
                                                </Select.Viewport>
                                            </Select.Content>
                                        </Select.Portal>
                                    </Select.Root>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                                    {filteredRooms.map((room) => (
                                        <div
                                            key={room.id}
                                            onClick={() => canBookRoom && setSelectedRoom(room)}
                                            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                                selectedRoom?.id === room.id
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            } ${!canBookRoom ? 'cursor-not-allowed' : ''}`}
                                        >
                                            <h3 className="font-medium text-gray-900">{room.roomId}</h3>
                                            <p className="text-sm text-gray-600">{room.building}</p>
                                            <p className="text-sm text-gray-600">Level: {room.level}</p>
                                            <p className="text-sm text-gray-600">Type: {room.venueType}</p>
                                            <p className="text-sm text-gray-600">Capacity: {room.capacity}</p>
                                        </div>
                                    ))}
                                </div>

                                {selectedRoom && (
                                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                                        <p className="text-green-800">
                                            <strong>Selected Room:</strong> {selectedRoom.roomId} - {selectedRoom.building}, Level {selectedRoom.level}
                                        </p>
                                    </div>
                                )}

                                {/* Display Booking Conflicts */}
                                {selectedRoom && Object.keys(conflicts).length > 0 && (
                                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <h4 className="font-medium text-yellow-800 mb-3">⚠️ Existing Bookings for Selected Room</h4>
                                        <div className="space-y-2">
                                            {Object.entries(conflicts).map(([date, bookings]) => (
                                                <div key={date} className="text-sm">
                                                    <p className="font-medium text-yellow-700">
                                                        {new Date(date).toLocaleDateString('en-US', { 
                                                            weekday: 'long', 
                                                            year: 'numeric', 
                                                            month: 'long', 
                                                            day: 'numeric' 
                                                        })}:
                                                    </p>
                                                    <ul className="ml-4 space-y-1">
                                                        {bookings.map((booking, index) => (
                                                            <li key={index} className="text-yellow-600">
                                                                • {booking.start_time} - {booking.end_time} 
                                                                <span className="text-yellow-500"> (Lecturer: {booking.lecturer_name})</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-yellow-700 text-xs mt-3">
                                            Conflicting time slots are disabled and marked as "(Booked)" in the time selection above.
                                        </p>
                                    </div>
                                )}

                                {checkingConflicts && (
                                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                        <div className="flex items-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                                            <p className="text-blue-800 text-sm">Checking for booking conflicts...</p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-center mt-6">
                                    <button
                                        onClick={handleBookRoom}
                                        disabled={!canBookRoom || !selectedRoom}
                                        className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Book Classroom
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Booking Confirmation Modal */}
                <Dialog.Root open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
                    <Dialog.Portal>
                        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 z-50" />
                        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-xl z-50 max-w-md w-full mx-4">
                            <Dialog.Title className="text-xl font-semibold text-gray-900 mb-4">
                                Confirm Booking
                            </Dialog.Title>
                            
                            {bookingStatus === 'idle' && (
                                <>
                                    <div className="space-y-3 mb-6">
                                        <p><strong>Lecturer:</strong> {selectedLecturer?.name}</p>
                                        <p><strong>Date Range:</strong> {dateRange.start?.toLocaleDateString()} to {dateRange.end?.toLocaleDateString()}</p>
                                        <p><strong>Time Range:</strong> {timeSlots.find(slot => slot.value === timeRange.start)?.label} to {timeSlots.find(slot => slot.value === timeRange.end)?.label}</p>
                                        <p><strong>Days of Week:</strong> {selectedDaysOfWeek.map(day => daysOfWeek.find(d => d.value === day)?.label).join(', ')}</p>
                                        <p><strong>Room:</strong> {selectedRoom?.roomId} - {selectedRoom?.building}</p>
                                    </div>
                                    
                                    <div className="flex space-x-3">
                                        <button
                                            onClick={confirmBooking}
                                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                        >
                                            Confirm Booking
                                        </button>
                                        <button
                                            onClick={() => setIsBookingModalOpen(false)}
                                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </>
                            )}
                            
                            {bookingStatus === 'loading' && (
                                <div className="text-center py-4">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                    <p>Processing booking...</p>
                                </div>
                            )}
                            
                            {bookingStatus === 'success' && (
                                <div className="text-center py-4">
                                    <div className="text-green-600 text-5xl mb-4">✓</div>
                                    <p className="text-green-800 font-semibold">Booking Confirmed!</p>
                                    <p className="text-gray-600 mt-2">Your classroom has been successfully booked.</p>
                                </div>
                            )}
                            
                            {bookingStatus === 'error' && (
                                <div className="text-center py-4">
                                    <div className="text-red-600 text-5xl mb-4">✗</div>
                                    <p className="text-red-800 font-semibold">Booking Failed!</p>
                                    <p className="text-gray-600 mt-2">There was an error processing your booking. Please try again.</p>
                                    <div className="flex justify-center mt-4">
                                        <button
                                            onClick={() => setBookingStatus('idle')}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                        >
                                            Try Again
                                        </button>
                                    </div>
                                </div>
                            )}
                        </Dialog.Content>
                    </Dialog.Portal>
                </Dialog.Root>

                {/* Debug Information */}
                <div className="bg-gray-50 p-4 rounded-lg text-sm">
                    <h3 className="font-semibold text-gray-700 mb-2">Debug Information:</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <span className="font-medium">Total Lecturers:</span> {debug_info.total_lecturers}
                        </div>
                        <div>
                            <span className="font-medium">Total Locations:</span> {debug_info.total_locations}
                        </div>
                        <div>
                            <span className="font-medium">Total Rooms:</span> {debug_info.total_rooms}
                        </div>
                        <div>
                            <span className="font-medium">Time Slots:</span> {timeSlots.length}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
