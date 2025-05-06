import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, User, Search, Check, X } from 'lucide-react';
import { format, parseISO, isToday, isAfter, isBefore, addDays } from 'date-fns';
import { useVendorProfile } from '@/hooks/use-vendor-profile';
import { useVendorBookings, Booking } from '@/hooks/use-service-bookings';

const VendorBookings = () => {
  const { vendorProfile } = useVendorProfile();
  const { bookings, isLoading, updateBookingStatus } = useVendorBookings();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<string | null>(null);
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-artijam-purple border-t-transparent"></div>
          <p className="text-sm text-gray-500">Loading bookings...</p>
        </div>
      </div>
    );
  }
  
  // Filter and sort bookings
  const filteredBookings = (bookings || []).filter(booking => {
    // Status filter
    if (statusFilter && booking.status !== statusFilter) {
      return false;
    }
    
    // Date filter
    if (dateFilter) {
      const bookingDate = parseISO(booking.start_time);
      
      if (dateFilter === 'today' && !isToday(bookingDate)) {
        return false;
      } else if (dateFilter === 'upcoming' && !isAfter(bookingDate, new Date())) {
        return false;
      } else if (dateFilter === 'past' && !isBefore(bookingDate, new Date())) {
        return false;
      } else if (dateFilter === 'next7days' && !isAfter(bookingDate, new Date()) && !isBefore(bookingDate, addDays(new Date(), 7))) {
        return false;
      }
    }
    
    // Search filter - check customer name or booking reference
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const customerName = booking.customer?.full_name?.toLowerCase() || '';
      const bookingRef = booking.booking_reference?.toLowerCase() || '';
      
      if (!customerName.includes(searchLower) && !bookingRef.includes(searchLower)) {
        return false;
      }
    }
    
    return true;
  });
  
  // Sort by start time (newest first for upcoming, oldest first for past)
  filteredBookings.sort((a, b) => {
    const dateA = parseISO(a.start_time);
    const dateB = parseISO(b.start_time);
    
    // If both are in the past, sort oldest first
    if (isBefore(dateA, new Date()) && isBefore(dateB, new Date())) {
      return dateA.getTime() - dateB.getTime();
    }
    
    // If both are in the future, sort newest first
    return dateA.getTime() - dateB.getTime();
  });
  
  // Group bookings by status
  const upcomingBookings = filteredBookings.filter(
    booking => isAfter(parseISO(booking.start_time), new Date()) && 
    booking.status !== 'cancelled'
  );
  
  const todayBookings = filteredBookings.filter(
    booking => isToday(parseISO(booking.start_time)) && 
    booking.status !== 'cancelled' &&
    booking.status !== 'completed'
  );
  
  const pastBookings = filteredBookings.filter(
    booking => isBefore(parseISO(booking.start_time), new Date()) || 
    booking.status === 'cancelled' ||
    booking.status === 'completed'
  );
  
  const handleStatusUpdate = async (bookingId: string, status: Booking['status']) => {
    try {
      await updateBookingStatus.mutateAsync({ bookingId, status });
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };
  
  const renderBookingCard = (booking: Booking) => {
    return (
      <Card key={booking.id} className={booking.status === 'cancelled' ? "opacity-70" : ""}>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Badge 
                  className={
                    booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                    booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    booking.status === 'no-show' ? 'bg-amber-100 text-amber-800' :
                    'bg-gray-100 text-gray-800'
                  }
                >
                  {booking.status}
                </Badge>
                
                {booking.booking_reference && (
                  <span className="text-xs text-gray-500">
                    {booking.booking_reference}
                  </span>
                )}
              </div>
              
              <div className="flex items-center text-sm font-medium">
                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                {format(parseISO(booking.start_time), 'EEEE, MMM d, yyyy')}
              </div>
              
              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 mr-2 text-gray-500" />
                {format(parseISO(booking.start_time), 'h:mm a')} - 
                {format(parseISO(booking.end_time), ' h:mm a')}
              </div>
              
              <div className="flex items-center text-sm">
                <User className="h-4 w-4 mr-2 text-gray-500" />
                {booking.customer?.full_name || 'Anonymous Customer'}
              </div>
              
              {booking.special_requests && (
                <div className="text-sm border-l-2 border-gray-200 pl-2 mt-2 italic">
                  {booking.special_requests}
                </div>
              )}
            </div>
            
            <div className="mt-4 md:mt-0 flex flex-col md:items-end gap-2">
              {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                <>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleStatusUpdate(booking.id, 'completed')}
                  >
                    <Check className="mr-1 h-4 w-4" />
                    Mark Complete
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-amber-600 border-amber-300 hover:bg-amber-50"
                    onClick={() => handleStatusUpdate(booking.id, 'no-show')}
                  >
                    Mark No-Show
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-300 hover:bg-red-50"
                    onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                  >
                    <X className="mr-1 h-4 w-4" />
                    Cancel
                  </Button>
                </>
              )}
              
              {(booking.status === 'cancelled' || booking.status === 'no-show') && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                >
                  Restore
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  return (
    <div className="space-y-6">
      {(!bookings || bookings.length === 0) ? (
        <Card>
          <CardContent className="p-12 text-center">
            <h3 className="text-lg font-medium mb-3">No Bookings Yet</h3>
            <p className="text-gray-500 mb-6">
              You'll see customer bookings here once you receive them.
            </p>
            <p className="text-sm text-gray-500">
              Make sure you've added services and set your availability.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by customer name or booking reference..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2 w-full md:w-auto">
              <Select value={statusFilter || ""} onValueChange={(value) => setStatusFilter(value || null)}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Status: All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="no-show">No Show</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={dateFilter || ""} onValueChange={(value) => setDateFilter(value || null)}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Date: All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Dates</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="next7days">Next 7 Days</SelectItem>
                  <SelectItem value="past">Past</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Tabs defaultValue={todayBookings.length > 0 ? "today" : "upcoming"}>
            <TabsList className="mb-4">
              <TabsTrigger value="today">
                Today ({todayBookings.length})
              </TabsTrigger>
              <TabsTrigger value="upcoming">
                Upcoming ({upcomingBookings.length - todayBookings.length})
              </TabsTrigger>
              <TabsTrigger value="past">
                Past ({pastBookings.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="today" className="space-y-4">
              {todayBookings.length > 0 ? (
                todayBookings.map(renderBookingCard)
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-500">No bookings scheduled for today.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="upcoming" className="space-y-4">
              {upcomingBookings.filter(b => !isToday(parseISO(b.start_time))).length > 0 ? (
                upcomingBookings
                  .filter(b => !isToday(parseISO(b.start_time)))
                  .map(renderBookingCard)
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-500">No upcoming bookings.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="past" className="space-y-4">
              {pastBookings.length > 0 ? (
                pastBookings.map(renderBookingCard)
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-500">No past bookings.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default VendorBookings;
