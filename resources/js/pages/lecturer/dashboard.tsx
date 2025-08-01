import { Head, router, usePage } from '@inertiajs/react';
import { Calendar, Clock, MapPin, Users, Search, Plus, CalendarDays, BookOpen, GraduationCap, Building2, LogOut } from 'lucide-react';
import { useState } from 'react';
import { Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Lecturer Dashboard',
        href: '/lecturer/dashboard',
    },
];

interface DashboardStats {
    totalBookings: number;
    todayBookings: number;
    upcomingBookings: number;
    availableRooms: number;
}

interface TodayBooking {
    id: number;
    roomName: string;
    building: string;
    time: string;
    subject: string;
    status: string;
    start_time: string;
    end_time: string;
    booking_date: string;
}

interface LecturerUser {
    name: string;
    email: string;
}

interface Props {
    stats: DashboardStats;
    todayBookings: TodayBooking[];
    user: LecturerUser;
}

export default function LecturerDashboard({ stats, todayBookings, user }: Props) {
    const [activeTab, setActiveTab] = useState('overview');
    const [localStats, setLocalStats] = useState(stats);
    const [localTodayBookings, setLocalTodayBookings] = useState(todayBookings);

    const handleLogout = () => {
        router.post('/logout');
    };

    const handleCancelBooking = async (bookingId: number) => {
        if (confirm('Are you sure you want to cancel this booking?')) {
            try {
                const response = await fetch(`/lecturer/bookings/${bookingId}`, {
                    method: 'DELETE',
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                    }
                });

                const result = await response.json();
                if (result.success) {
                    // Update local state
                    setLocalTodayBookings(prev => prev.filter(booking => booking.id !== bookingId));
                    setLocalStats(prev => ({
                        ...prev,
                        totalBookings: prev.totalBookings - 1,
                        todayBookings: prev.todayBookings - 1
                    }));
                    alert('Booking cancelled successfully!');
                } else {
                    alert('Error cancelling booking: ' + result.message);
                }
            } catch (error) {
                console.error('Error cancelling booking:', error);
                alert('Error cancelling booking');
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <Head title="Lecturer Dashboard" />
            
            {/* Header */}
            <div className="bg-gradient-to-r from-[#00b2a7] to-[#019d95] text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="bg-white/20 rounded-lg p-3">
                                <GraduationCap className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">APIIT Classroom Booking System</h1>
                                <p className="text-blue-100 mt-1">Inspire love for learning</p>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3">
                            <Link href="/lecturer/room-search" className="w-full sm:w-auto">
                                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 w-full sm:w-auto">
                                    <Search className="h-4 w-4 mr-2" />
                                    <span className="hidden sm:inline">Find Rooms</span>
                                    <span className="sm:hidden">Rooms</span>
                                </Button>
                            </Link>
                            <Link href="/lecturer/create-booking" className="w-full sm:w-auto">
                                <Button className="bg-white text-[#00b2a7] hover:bg-gray-100 font-semibold w-full sm:w-auto">
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
                {/* Welcome Section */}
                <div className="mb-6 sm:mb-8">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Welcome back, {user.name}!</h2>
                    <p className="text-gray-600 text-sm sm:text-base">Manage your classroom bookings and inspire the next generation of learners.</p>
                </div>

                {/* Daily Booking Limit Alert */}
                {localStats.todayBookings >= 4 && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <p className="text-red-700 font-medium">Daily booking limit reached (4/4)</p>
                        </div>
                        <p className="text-red-600 text-sm mt-1">You have reached the maximum daily booking limit. Contact an administrator for additional bookings.</p>
                    </div>
                )}

                {localStats.todayBookings < 4 && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <p className="text-green-700 font-medium">Daily booking status: {localStats.todayBookings}/4</p>
                        </div>
                        <p className="text-green-600 text-sm mt-1">You have {4 - localStats.todayBookings} booking(s) remaining today.</p>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    <Card className="border-0 shadow-lg bg-white hover:shadow-xl transition-shadow duration-300">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-gray-600">Total Bookings</CardTitle>
                                <div className="bg-[#00b2a7]/10 p-2 rounded-lg">
                                    <Calendar className="h-5 w-5 text-[#00b2a7]" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-gray-900">{localStats.totalBookings}</div>
                            <p className="text-xs text-gray-500 mt-1">This semester</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-white hover:shadow-xl transition-shadow duration-300">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-gray-600">Today's Bookings</CardTitle>
                                <div className="bg-orange-100 p-2 rounded-lg">
                                    <Clock className="h-5 w-5 text-orange-600" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-gray-900">{localStats.todayBookings}</div>
                            <p className="text-xs text-gray-500 mt-1">Scheduled for today</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-white hover:shadow-xl transition-shadow duration-300">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-gray-600">Upcoming</CardTitle>
                                <div className="bg-blue-100 p-2 rounded-lg">
                                    <CalendarDays className="h-5 w-5 text-blue-600" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-gray-900">{localStats.upcomingBookings}</div>
                            <p className="text-xs text-gray-500 mt-1">Next 7 days</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-white hover:shadow-xl transition-shadow duration-300">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-gray-600">Available Rooms</CardTitle>
                                <div className="bg-green-100 p-2 rounded-lg">
                                    <Users className="h-5 w-5 text-green-600" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-gray-900">{localStats.availableRooms}</div>
                            <p className="text-xs text-gray-500 mt-1">Currently free</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Today's Schedule */}
                <Card className="border-0 shadow-lg bg-white mb-6 sm:mb-8">
                    <CardHeader className="border-b border-gray-100">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                            <div>
                                <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">Today's Schedule</CardTitle>
                                <CardDescription className="text-gray-600 text-sm">Your classroom bookings for today</CardDescription>
                            </div>
                            <Badge className="bg-[#00b2a7] text-white px-3 py-1 text-xs">
                                {localTodayBookings.length} Bookings
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                        <div className="space-y-3 sm:space-y-4">
                            {localTodayBookings.map((booking) => (
                                <div key={booking.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors gap-3 sm:gap-4">
                                    <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
                                        <div className="flex-shrink-0">
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#00b2a7] to-[#019d95] rounded-xl flex items-center justify-center shadow-lg">
                                                <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-900 text-sm sm:text-lg truncate">{booking.roomName}</h3>
                                            <p className="text-xs sm:text-sm text-gray-600 truncate">{booking.building}</p>
                                            <p className="text-xs sm:text-sm text-gray-500 font-medium truncate">{booking.subject}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                                        <div className="text-left sm:text-right w-full sm:w-auto">
                                            <p className="font-semibold text-gray-900">{booking.time}</p>
                                            <Badge 
                                                variant={booking.status === 'confirmed' ? 'default' : 'secondary'}
                                                className={booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                                            >
                                                {booking.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                                            </Badge>
                                        </div>
                                        <Button
                                            size="sm"
                                            onClick={() => handleCancelBooking(booking.id)}
                                            className="bg-red-600 hover:bg-red-700 text-white font-semibold"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Link href="/lecturer/room-search">
                        <Card className="border-0 shadow-lg bg-white hover:shadow-xl transition-all duration-300 cursor-pointer group">
                            <CardContent className="p-6">
                                <div className="flex items-center space-x-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-[#00b2a7] to-[#019d95] rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                                        <Search className="h-8 w-8 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg">Find Available Rooms</h3>
                                        <p className="text-gray-600">Search for free classrooms with advanced filters</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/lecturer/schedule">
                        <Card className="border-0 shadow-lg bg-white hover:shadow-xl transition-all duration-300 cursor-pointer group">
                            <CardContent className="p-6">
                                <div className="flex items-center space-x-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-[#00b2a7] to-[#019d95] rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                                        <Calendar className="h-8 w-8 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg">View Schedule</h3>
                                        <p className="text-gray-600">Check your bookings and manage schedule</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/lecturer/create-booking">
                        <Card className="border-0 shadow-lg bg-white hover:shadow-xl transition-all duration-300 cursor-pointer group">
                            <CardContent className="p-6">
                                <div className="flex items-center space-x-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-[#00b2a7] to-[#019d95] rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                                        <Plus className="h-8 w-8 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg">New Booking</h3>
                                        <p className="text-gray-600">Reserve a classroom for your lecture</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                </div>

                {/* Footer */}
                <div className="mt-12 text-center text-gray-500 text-sm">
                    <p>© 2025 APIIT IT Department. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
} 