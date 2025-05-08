
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { BookingStatus } from "./use-vendor-bookings";

export type Booking = {
  id: string;
  created_at: string;
  service_id: string;
  service_name: string;
  vendor_id: string;
  vendor_name: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  price: number;
  notes?: string;
};

export const useCustomerBookings = (filters?: {
  status?: BookingStatus;
  startDate?: Date;
  endDate?: Date;
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  
  const fetchCustomerBookings = async (): Promise<Booking[]> => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      // First, fetch the basic booking information
      let query = supabase
        .from('service_bookings')
        .select('id, created_at, service_id, start_time, end_time, status, customer_notes')
        .eq('customer_id', user.user.id)
        .range((currentPage - 1) * pageSize, currentPage * pageSize - 1)
        .order('created_at', { ascending: false });
      
      // Apply filters if provided
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters?.startDate) {
        query = query.gte('start_time', filters.startDate.toISOString());
      }
      
      if (filters?.endDate) {
        query = query.lte('end_time', filters.endDate.toISOString());
      }
      
      const { data: bookingData, error: bookingError } = await query;
      
      if (bookingError) throw bookingError;
      if (!bookingData || bookingData.length === 0) return [];
      
      // Create a transformed array of bookings
      const bookings: Booking[] = [];
      
      // Fetch service information for each booking
      for (const booking of bookingData) {
        // Get service details
        const { data: serviceData, error: serviceError } = await supabase
          .from('services')
          .select('name, price, vendor_id')
          .eq('id', booking.service_id)
          .single();
        
        if (serviceError) {
          console.error("Error fetching service:", serviceError);
          continue;
        }
        
        // Get vendor details
        const { data: vendorData, error: vendorError } = await supabase
          .from('vendor_profiles')
          .select('business_name')
          .eq('id', serviceData.vendor_id)
          .single();
        
        if (vendorError) {
          console.error("Error fetching vendor:", vendorError);
          continue;
        }
        
        // Add the booking with all related information
        bookings.push({
          id: booking.id,
          created_at: booking.created_at,
          service_id: booking.service_id,
          service_name: serviceData?.name || 'Unknown Service',
          vendor_id: serviceData?.vendor_id || '',
          vendor_name: vendorData?.business_name || 'Unknown Vendor',
          start_time: booking.start_time,
          end_time: booking.end_time,
          status: booking.status as BookingStatus,
          price: serviceData?.price || 0,
          notes: booking.customer_notes
        });
      }
      
      return bookings;
    } catch (error: any) {
      console.error("Error fetching customer bookings:", error);
      toast.error("Failed to load bookings");
      return [] as Booking[];
    }
  };

  return {
    ...useQuery({
      queryKey: ["customer-bookings", filters?.status, filters?.startDate, filters?.endDate, currentPage, pageSize],
      queryFn: fetchCustomerBookings,
    }),
    currentPage,
    setCurrentPage,
    pageSize
  };
};
