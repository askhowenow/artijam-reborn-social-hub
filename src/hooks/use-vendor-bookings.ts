
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

export type VendorBooking = {
  id: string;
  created_at: string;
  service_id: string;
  service_name: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  total_price: number;
  notes?: string;
};

export const useVendorBookings = (filters?: {
  status?: BookingStatus;
  startDate?: Date;
  endDate?: Date;
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  
  const fetchVendorBookings = async (): Promise<VendorBooking[]> => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      // Query service_bookings table directly instead of using RPC
      let query = supabase
        .from('service_bookings')
        .select(`
          id,
          created_at,
          service_id,
          services:service_id (name),
          customer_id,
          profiles:customer_id (full_name, avatar_url, email),
          start_time,
          end_time,
          status,
          customer_notes
        `)
        .eq('services.vendor_id', user.user.id)
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
      
      // Transform the data to match VendorBooking type
      const bookings: VendorBooking[] = data.map(booking => ({
        id: booking.id,
        created_at: booking.created_at,
        service_id: booking.service_id,
        service_name: booking.services?.name || 'Unknown Service',
        customer_id: booking.customer_id,
        customer_name: booking.profiles?.full_name || 'Unknown Customer',
        customer_email: booking.profiles?.email || 'No email provided',
        start_time: booking.start_time,
        end_time: booking.end_time,
        status: booking.status as BookingStatus,
        total_price: 0, // We'll need to fetch this separately or calculate it
        notes: booking.customer_notes
      }));
      
      return bookings;
    } catch (error: any) {
      console.error("Error fetching vendor bookings:", error);
      toast.error("Failed to load bookings");
      return [] as VendorBooking[];
    }
  };

  return {
    ...useQuery({
      queryKey: ["vendor-bookings", filters?.status, filters?.startDate, filters?.endDate, currentPage, pageSize],
      queryFn: fetchVendorBookings,
    }),
    currentPage,
    setCurrentPage,
    pageSize
  };
};
