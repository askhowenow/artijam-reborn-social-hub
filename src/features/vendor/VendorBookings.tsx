
import React, { useState } from "react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Check, X, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useVendorBookings, BookingStatus } from "@/hooks/use-vendor-bookings";

interface VendorBookingsProps {
  className?: string;
}

const VendorBookings: React.FC<VendorBookingsProps> = ({ className }) => {
  const [statusFilter, setStatusFilter] = useState<BookingStatus | undefined>(undefined);
  const { data: bookings, isLoading, refetch } = useVendorBookings({ status: statusFilter });
  
  const updateBookingStatus = async (bookingId: string, newStatus: BookingStatus) => {
    try {
      // Using the functions API with RPC call instead of direct table access
      const { error } = await supabase.functions.invoke('update_booking_status', { 
        body: { booking_id: bookingId, new_status: newStatus } 
      });
      
      if (error) throw error;
      
      toast.success(`Booking ${newStatus} successfully`);
      refetch();
    } catch (error: any) {
      console.error("Error updating booking status:", error);
      toast.error(error.message || "Failed to update booking status");
    }
  };
  
  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case "confirmed": return "text-green-500";
      case "cancelled": return "text-red-500";
      case "completed": return "text-blue-500";
      default: return "text-yellow-500";
    }
  };
  
  const getStatusIcon = (status: BookingStatus) => {
    switch (status) {
      case "confirmed": return <Check className="h-5 w-5 text-green-500" />;
      case "cancelled": return <X className="h-5 w-5 text-red-500" />;
      case "completed": return <Check className="h-5 w-5 text-blue-500" />;
      default: return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };
  
  const renderActionButtons = (booking: any) => {
    if (booking.status === "pending") {
      return (
        <div className="flex space-x-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="border-green-500 text-green-500 hover:bg-green-50"
            onClick={() => updateBookingStatus(booking.id, "confirmed")}
          >
            Confirm
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="border-red-500 text-red-500 hover:bg-red-50"
            onClick={() => updateBookingStatus(booking.id, "cancelled")}
          >
            Cancel
          </Button>
        </div>
      );
    }
    
    if (booking.status === "confirmed") {
      return (
        <Button 
          size="sm" 
          variant="outline" 
          className="border-blue-500 text-blue-500 hover:bg-blue-50"
          onClick={() => updateBookingStatus(booking.id, "completed")}
        >
          Mark Complete
        </Button>
      );
    }
    
    return null;
  };
  
  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Recent Bookings</h2>
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as BookingStatus || undefined)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-artijam-purple"></div>
        </div>
      ) : bookings && bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base sm:text-lg">{booking.service_name}</CardTitle>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{booking.customer_name} • {booking.customer_email}</p>
                  </div>
                  <div className="flex items-center">
                    {getStatusIcon(booking.status)}
                    <span className={`ml-1 text-sm font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <Calendar className="h-4 w-4 mr-2" />
                  <time>
                    {new Date(booking.start_time).toLocaleDateString()} • 
                    {new Date(booking.start_time).toLocaleTimeString(undefined, { 
                      hour: '2-digit', 
                      minute: '2-digit'
                    })}
                  </time>
                </div>
                
                <div className="flex justify-between items-center mt-4">
                  <p className="font-semibold">${booking.total_price.toFixed(2)}</p>
                  {renderActionButtons(booking)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-gray-50 dark:bg-gray-800 border border-dashed">
          <CardContent className="flex flex-col items-center justify-center h-48">
            <p className="text-gray-500 dark:text-gray-400 mb-2">No bookings found</p>
            {statusFilter && (
              <Button 
                variant="link" 
                onClick={() => setStatusFilter(undefined)}
              >
                View all bookings
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VendorBookings;
