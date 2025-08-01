import { Head, router, Link, usePage } from '@inertiajs/react';
import { Calendar, Clock, MapPin, Users, Building, AlertCircle, CheckCircle, Plus, GraduationCap, LogOut, Search } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Lecturer Dashboard',
        href: '/lecturer/dashboard',
    },
    {
        title: 'Create Booking',
        href: '/lecturer/create-booking',
    },
];

// Mock data
const buildings = [
    { id: 1, name: 'Colombo City Campus' },
    { id: 2, name: 'Foundation School' },
    { id: 3, name: 'Kandy Branch' },
];

const venueTypes = [
    { id: 'lecture_room', name: 'Lecture Room' },
    { id: 'lab', name: 'Laboratory' },
    { id: 'study_room', name: 'Study Room' },
    { id: 'auditorium', name: 'Auditorium' },
    { id: 'smart_classroom', name: 'Smart Classroom' },
];

const mockAvailableRooms = [
    {
        id: 1,
        roomId: 'LAB101',
        name: 'Lab 101',
        building: 'Colombo City Campus',
        venueType: 'Laboratory',
        level: '1st Floor',
        capacity: 30,
    },
    {
        id: 2,
        roomId: 'LEC201',
        name: 'Lecture Hall A',
        building: 'Foundation School',
        venueType: 'Lecture Room',
        level: '2nd Floor',
        capacity: 50,
    },
    {
        id: 3,
        roomId: 'SMART301',
        name: 'Smart Classroom 2',
        building: 'Kandy Branch',
        venueType: 'Smart Classroom',
        level: '3rd Floor',
        capacity: 25,
    },
];

export default function CreateBooking() {
    const { auth } = usePage().props as any;
    const lecturerName = auth?.user?.name || "Lecturer";
    
    const handleLogout = () => {
        router.post('/logout');
    };

    const [bookingData, setBookingData] = useState({
        date: '',
        startTime: '',
        endTime: '',
        building: '',
        venueType: '',
        capacity: '',
        roomId: '',
        subject: '',
        description: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [dailyBookingsCount, setDailyBookingsCount] = useState(3); // Mock count - should match dashboard

    const handleInputChange = (key: string, value: string) => {
        setBookingData(prev => ({ ...prev, [key]: value }));
        // Clear error when user starts typing
        if (errors[key]) {
            setErrors(prev => ({ ...prev, [key]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!bookingData.date) newErrors.date = 'Date is required';
        if (!bookingData.startTime) newErrors.startTime = 'Start time is required';
        if (!bookingData.endTime) newErrors.endTime = 'End time is required';
        if (!bookingData.roomId) newErrors.roomId = 'Please select a room';
        if (!bookingData.subject) newErrors.subject = 'Subject is required';

        // Validate time range
        if (bookingData.startTime && bookingData.endTime) {
            if (bookingData.startTime >= bookingData.endTime) {
                newErrors.endTime = 'End time must be after start time';
            }
        }

        // Validate daily booking limit
        if (dailyBookingsCount >= 4) {
            newErrors.general = 'You have reached the maximum daily booking limit (4 bookings per day)';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        
        try {
            // Mock API call - will be replaced with actual API
            await new Promise(resolve => setTimeout(resolve, 1500));
            console.log('Creating booking:', bookingData);
            
            // Success - show success message and redirect
            alert('Booking created successfully! Redirecting to dashboard...');
            router.visit('/lecturer/dashboard');
        } catch (error) {
            console.error('Error creating booking:', error);
            setErrors({ general: 'Failed to create booking. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRoomSelect = (roomId: string) => {
        setBookingData(prev => ({ ...prev, roomId }));
        if (errors.roomId) {
            setErrors(prev => ({ ...prev, roomId: '' }));
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <Head title="Create New Booking" />
            
            {/* Header */}
            <div className="bg-gradient-to-r from-[#00b2a7] to-[#019d95] text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="bg-white/20 rounded-lg p-3">
                                <Plus className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">Create New Booking</h1>
                                <p className="text-blue-100 mt-1">Reserve a classroom for your lecture</p>
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
                            <Link href="/lecturer/room-search" className="w-full sm:w-auto">
                                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 w-full sm:w-auto">
                                    <Search className="h-4 w-4 mr-2" />
                                    <span className="hidden sm:inline">Find Rooms</span>
                                    <span className="sm:hidden">Rooms</span>
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

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Daily Booking Limit Alert */}
                {dailyBookingsCount >= 4 && (
                    <Alert className="border-red-200 bg-red-50 mb-6">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-700">
                            You have reached the maximum daily booking limit (4 bookings per day). 
                            Please contact an administrator for additional bookings.
                        </AlertDescription>
                    </Alert>
                )}

                {dailyBookingsCount < 4 && (
                    <Alert className="border-green-200 bg-green-50 mb-6">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-700">
                            You have {4 - dailyBookingsCount} booking(s) remaining today. (Current: {dailyBookingsCount}/4)
                        </AlertDescription>
                    </Alert>
                )}

                {/* General Error */}
                {errors.general && (
                    <Alert className="border-red-200 bg-red-50 mb-6">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-700">
                            {errors.general}
                        </AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Booking Details */}
                    <Card className="border-0 shadow-lg bg-white">
                        <CardHeader className="border-b border-gray-100">
                            <div className="flex items-center space-x-3">
                                <div className="bg-[#00b2a7]/10 p-2 rounded-lg">
                                    <Calendar className="h-6 w-6 text-[#00b2a7]" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-bold text-gray-900">Booking Details</CardTitle>
                                    <CardDescription className="text-gray-600">Set the date and time for your booking</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
                                {/* Date */}
                                <div className="space-y-2">
                                    <Label htmlFor="date" className="text-gray-700 font-medium">Date *</Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="date"
                                            type="date"
                                            value={bookingData.date}
                                            onChange={(e) => handleInputChange('date', e.target.value)}
                                            className={`pl-10 border-gray-200 focus:border-[#00b2a7] focus:ring-[#00b2a7] text-gray-900 ${errors.date ? 'border-red-300' : ''}`}
                                        />
                                    </div>
                                    {errors.date && <p className="text-sm text-red-600">{errors.date}</p>}
                                </div>

                                {/* Start Time */}
                                <div className="space-y-2">
                                    <Label htmlFor="startTime" className="text-gray-700 font-medium">Start Time *</Label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="startTime"
                                            type="time"
                                            value={bookingData.startTime}
                                            onChange={(e) => handleInputChange('startTime', e.target.value)}
                                            className={`pl-10 border-gray-200 focus:border-[#00b2a7] focus:ring-[#00b2a7] text-gray-900 ${errors.startTime ? 'border-red-300' : ''}`}
                                        />
                                    </div>
                                    {errors.startTime && <p className="text-sm text-red-600">{errors.startTime}</p>}
                                </div>

                                {/* End Time */}
                                <div className="space-y-2">
                                    <Label htmlFor="endTime" className="text-gray-700 font-medium">End Time *</Label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="endTime"
                                            type="time"
                                            value={bookingData.endTime}
                                            onChange={(e) => handleInputChange('endTime', e.target.value)}
                                            className={`pl-10 border-gray-200 focus:border-[#00b2a7] focus:ring-[#00b2a7] text-gray-900 ${errors.endTime ? 'border-red-300' : ''}`}
                                        />
                                    </div>
                                    {errors.endTime && <p className="text-sm text-red-600">{errors.endTime}</p>}
                                </div>
                            </div>

                            {/* Subject */}
                            <div className="space-y-2 mb-6">
                                <Label htmlFor="subject" className="text-gray-700 font-medium">Subject/Course *</Label>
                                <Input
                                    id="subject"
                                    value={bookingData.subject}
                                    onChange={(e) => handleInputChange('subject', e.target.value)}
                                    placeholder="e.g., Web Development, Database Systems"
                                    className={`border-gray-200 focus:border-[#00b2a7] focus:ring-[#00b2a7] text-gray-900 ${errors.subject ? 'border-red-300' : ''}`}
                                />
                                {errors.subject && <p className="text-sm text-red-600">{errors.subject}</p>}
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-gray-700 font-medium">Description (Optional)</Label>
                                <Textarea
                                    id="description"
                                    value={bookingData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    placeholder="Additional details about your booking..."
                                    rows={3}
                                    className="border-gray-200 focus:border-[#00b2a7] focus:ring-[#00b2a7] text-gray-900"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Room Selection */}
                    <Card className="border-0 shadow-lg bg-white">
                        <CardHeader className="border-b border-gray-100">
                            <div className="flex items-center space-x-3">
                                <div className="bg-[#00b2a7]/10 p-2 rounded-lg">
                                    <Building className="h-6 w-6 text-[#00b2a7]" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-bold text-gray-900">Select Room</CardTitle>
                                    <CardDescription className="text-gray-600">Choose from available rooms</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {mockAvailableRooms.map((room) => (
                                    <Card 
                                        key={room.id} 
                                        className={`border-2 cursor-pointer transition-all duration-300 hover:shadow-lg transform hover:scale-105 ${
                                            bookingData.roomId === room.roomId 
                                                ? 'border-[#00b2a7] bg-[#00b2a7]/5 shadow-lg ring-2 ring-[#00b2a7]/20' 
                                                : 'border-gray-200 hover:border-[#00b2a7]/50'
                                        }`}
                                        onClick={() => handleRoomSelect(room.roomId)}
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="font-bold text-gray-900 text-sm sm:text-base">{room.name}</h3>
                                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                                    bookingData.roomId === room.roomId 
                                                        ? 'border-[#00b2a7] bg-[#00b2a7]' 
                                                        : 'border-gray-300'
                                                }`}>
                                                    {bookingData.roomId === room.roomId && (
                                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="space-y-2 text-xs sm:text-sm text-gray-600">
                                                <div className="flex items-center space-x-2">
                                                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-[#00b2a7] flex-shrink-0" />
                                                    <span className="truncate">{room.building}</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Building className="h-3 w-3 sm:h-4 sm:w-4 text-[#00b2a7] flex-shrink-0" />
                                                    <span className="truncate">{room.venueType} • {room.level}</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Users className="h-3 w-3 sm:h-4 sm:w-4 text-[#00b2a7] flex-shrink-0" />
                                                    <span>Capacity: {room.capacity}</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                            {errors.roomId && <p className="text-sm text-red-600 mt-2">{errors.roomId}</p>}
                        </CardContent>
                    </Card>

                    {/* Submit Button */}
                    <div className="flex justify-end space-x-4">
                        <Button 
                            type="button" 
                            variant="outline"
                            onClick={() => window.history.back()}
                            className="border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit"
                            disabled={isSubmitting || dailyBookingsCount >= 4}
                            className="bg-gradient-to-r from-[#00b2a7] to-[#019d95] hover:from-[#019d95] hover:to-[#018f87] text-white font-semibold px-8 py-3 rounded-lg shadow-lg"
                        >
                            {isSubmitting ? 'Creating Booking...' : 'Create Booking'}
                        </Button>
                    </div>
                </form>

                {/* Footer */}
                <div className="mt-12 text-center text-gray-500 text-sm">
                    <p>© 2025 APIIT IT Department. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
} 