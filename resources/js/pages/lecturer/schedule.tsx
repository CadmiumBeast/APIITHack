import { Head, Link, router, usePage } from '@inertiajs/react';
import { Calendar, Clock, MapPin, Users, Building, Trash2, Edit, AlertCircle, GraduationCap, LogOut } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

// Mock data

// Mock data
const mockBookings = [
    {
        id: 1,
        roomName: 'Lab 101',
        building: 'Colombo City Campus',
        date: '2024-01-15',
        startTime: '09:00',
        endTime: '11:00',
        subject: 'Web Development',
        status: 'confirmed',
        canCancel: true,
        isPast: false,
    },
    {
        id: 2,
        roomName: 'Lecture Hall A',
        building: 'Foundation School',
        date: '2024-01-15',
        startTime: '14:00',
        endTime: '16:00',
        subject: 'Database Systems',
        status: 'confirmed',
        canCancel: false, // Less than 1 hour before
        isPast: false,
    },
    {
        id: 3,
        roomName: 'Smart Classroom 2',
        building: 'Kandy Branch',
        date: '2024-01-16',
        startTime: '10:00',
        endTime: '12:00',
        subject: 'Software Engineering',
        status: 'pending',
        canCancel: true,
        isPast: false,
    },
    {
        id: 4,
        roomName: 'Main Auditorium',
        building: 'Colombo City Campus',
        date: '2024-01-14',
        startTime: '16:00',
        endTime: '18:00',
        subject: 'Computer Networks',
        status: 'confirmed',
        canCancel: false,
        isPast: true,
    },
];

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Schedule() {
    const { auth } = usePage().props as any;
    const lecturerName = auth?.user?.name || "Lecturer";
    
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
    const [bookingToCancel, setBookingToCancel] = useState<number | null>(null);
    const [isCancelling, setIsCancelling] = useState(false);

    const getBookingsForDate = (date: Date) => {
        const dateStr = date.toISOString().split('T')[0];
        return mockBookings.filter(booking => booking.date === dateStr);
    };

    const handleCancelBooking = async (bookingId: number) => {
        setIsCancelling(true);
        try {
            // Mock API call - will be replaced with actual API
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log('Cancelling booking:', bookingId);
            
            // Success - update local state or refresh data
            alert('Booking cancelled successfully!');
            setBookingToCancel(null);
        } catch (error) {
            console.error('Error cancelling booking:', error);
            alert('Failed to cancel booking. Please try again.');
        } finally {
            setIsCancelling(false);
        }
    };

    const getCalendarDays = () => {
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        const days = [];
        const currentDate = new Date(startDate);
        
        while (currentDate.getMonth() <= month && days.length < 42) {
            days.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        return days;
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
        });
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const isSelectedMonth = (date: Date) => {
        return date.getMonth() === selectedDate.getMonth();
    };

    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <Head title="My Schedule" />
            
            {/* Header */}
            <div className="bg-gradient-to-r from-[#00b2a7] to-[#019d95] text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="bg-white/20 rounded-lg p-3">
                                <Calendar className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">My Schedule</h1>
                                <p className="text-blue-100 mt-1">View and manage your classroom bookings</p>
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
                                    <MapPin className="h-4 w-4 mr-2" />
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

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* View Mode Toggle */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Schedule Overview</h2>
                        <p className="text-gray-600 text-sm sm:text-base">Manage your classroom bookings</p>
                    </div>
                    <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                        <Button 
                            variant={viewMode === 'calendar' ? 'default' : 'outline'}
                            onClick={() => setViewMode('calendar')}
                            className={`flex-1 sm:flex-none ${viewMode === 'calendar' ? 'bg-[#00b2a7] hover:bg-[#019d95] text-white' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                        >
                            <Calendar className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Calendar</span>
                            <span className="sm:hidden">Cal</span>
                        </Button>
                        <Button 
                            variant={viewMode === 'list' ? 'default' : 'outline'}
                            onClick={() => setViewMode('list')}
                            className={`flex-1 sm:flex-none ${viewMode === 'list' ? 'bg-[#00b2a7] hover:bg-[#019d95] text-white' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                        >
                            <Clock className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">List</span>
                            <span className="sm:hidden">List</span>
                        </Button>
                    </div>
                </div>

                {/* Cancellation Policy Alert */}
                <Alert className="border-[#00b2a7] bg-blue-50">
                    <AlertCircle className="h-4 w-4 text-[#00b2a7]" />
                    <AlertDescription className="text-[#00b2a7]">
                        <strong>Cancellation Policy:</strong> Bookings can only be cancelled at least 1 hour before the scheduled time.
                    </AlertDescription>
                </Alert>

                {viewMode === 'calendar' ? (
                    /* Calendar View */
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-gray-900">
                                    {selectedDate.toLocaleDateString('en-US', { 
                                        month: 'long', 
                                        year: 'numeric' 
                                    })}
                                </CardTitle>
                                <div className="flex gap-2">
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => {
                                            const prevMonth = new Date(selectedDate);
                                            prevMonth.setMonth(prevMonth.getMonth() - 1);
                                            setSelectedDate(prevMonth);
                                        }}
                                    >
                                        Previous
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => setSelectedDate(new Date())}
                                    >
                                        Today
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => {
                                            const nextMonth = new Date(selectedDate);
                                            nextMonth.setMonth(nextMonth.getMonth() + 1);
                                            setSelectedDate(nextMonth);
                                        }}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {/* Calendar Grid */}
                            <div className="grid grid-cols-7 gap-1">
                                {/* Day Headers */}
                                {daysOfWeek.map(day => (
                                    <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                                        {day}
                                    </div>
                                ))}
                                
                                {/* Calendar Days */}
                                {getCalendarDays().map((date, index) => {
                                    const dayBookings = getBookingsForDate(date);
                                    return (
                                        <div 
                                            key={index}
                                            className={`min-h-[100px] p-2 border border-gray-200 ${
                                                isToday(date) ? 'bg-[#00b2a7]/10 border-[#00b2a7]' : ''
                                            } ${!isSelectedMonth(date) ? 'bg-gray-50 text-gray-400' : ''}`}
                                        >
                                            <div className={`text-sm font-medium mb-1 ${
                                                isToday(date) ? 'text-[#00b2a7]' : ''
                                            }`}>
                                                {date.getDate()}
                                            </div>
                                            <div className="space-y-1">
                                                {dayBookings.map(booking => (
                                                    <div 
                                                        key={booking.id}
                                                        className="text-xs p-1 bg-[#00b2a7] text-white rounded cursor-pointer hover:bg-[#019d95]"
                                                        title={`${booking.subject} - ${booking.startTime}-${booking.endTime}`}
                                                    >
                                                        {booking.subject}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    /* List View */
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-gray-900">All Bookings</CardTitle>
                            <CardDescription>Your classroom reservations</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {mockBookings.map((booking) => (
                                    <div key={booking.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors gap-4">
                                        <div className="flex items-center space-x-4 w-full sm:w-auto">
                                            <div className="flex-shrink-0">
                                                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center ${
                                                    booking.isPast ? 'bg-gray-400' : 'bg-[#00b2a7]'
                                                }`}>
                                                    <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{booking.roomName}</h3>
                                                <p className="text-xs sm:text-sm text-gray-600 truncate">{booking.building}</p>
                                                <p className="text-xs sm:text-sm text-gray-500 truncate">{booking.subject}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                                            <div className="text-left sm:text-right w-full sm:w-auto">
                                                <p className="font-medium text-gray-900 text-xs sm:text-sm">
                                                    {new Date(booking.date).toLocaleDateString()} • {booking.startTime}-{booking.endTime}
                                                </p>
                                                <Badge 
                                                    variant={booking.status === 'confirmed' ? 'default' : 'secondary'}
                                                    className={`text-xs ${booking.status === 'confirmed' ? 'bg-[#00b2a7] text-white' : 'bg-yellow-100 text-yellow-800'}`}
                                                >
                                                    {booking.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                                                </Badge>
                                            </div>
                                            <div className="flex gap-2 w-full sm:w-auto justify-end">
                                                <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                {booking.canCancel && !booking.isPast && (
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button 
                                                                variant="outline" 
                                                                size="sm"
                                                                className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader>
                                                                <DialogTitle>Cancel Booking</DialogTitle>
                                                                <DialogDescription>
                                                                    Are you sure you want to cancel your booking for {booking.roomName} on {new Date(booking.date).toLocaleDateString()} at {booking.startTime}?
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <DialogFooter>
                                                                <Button variant="outline" onClick={() => setBookingToCancel(null)}>
                                                                    Keep Booking
                                                                </Button>
                                                                <Button 
                                                                    onClick={() => handleCancelBooking(booking.id)}
                                                                    disabled={isCancelling}
                                                                    className="bg-red-600 hover:bg-red-700 text-white font-semibold"
                                                                >
                                                                    {isCancelling ? 'Cancelling...' : 'Cancel Booking'}
                                                                </Button>
                                                            </DialogFooter>
                                                        </DialogContent>
                                                    </Dialog>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
} 