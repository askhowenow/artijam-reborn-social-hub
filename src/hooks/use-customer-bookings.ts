
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

      // Query service_bookings table directly
      let query = supabase
        .from('service_bookings')
        .select(`
          id,
          created_at,
          service_id,
          services:service_id (name, price, vendor_id),
          vendor:services.vendor_id (business_name),
          start_time,
          end_time,
          status,
          customer_notes
        `)
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
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Transform the data to match Booking type
      const bookings: Booking[] = data.map(booking => ({
        id: booking.id,
        created_at: booking.created_at,
        service_id: booking.service_id,
        service_name: booking.services?.name || 'Unknown Service',
        vendor_id: booking.services?.vendor_id || '',
        vendor_name: booking.vendor?.business_name || 'Unknown Vendor',
        start_time: booking.start_time,
        end_time: booking.end_time,
        status: booking.status as BookingStatus,
        price: booking.services?.price || 0,
        notes: booking.customer_notes
      }));
      
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
