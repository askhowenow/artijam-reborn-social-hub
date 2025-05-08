
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

      // First get the vendor's services
      const { data: services, error: servicesError } = await supabase
        .from('services')
        .select('id, name, price')
        .eq('vendor_id', user.user.id);

      if (servicesError) throw servicesError;
      if (!services || services.length === 0) return [];

      // Get the service IDs
      const serviceIds = services.map(service => service.id);

      // Get bookings for these services
      let query = supabase
        .from('service_bookings')
        .select('id, created_at, service_id, customer_id, start_time, end_time, status, customer_notes')
        .in('service_id', serviceIds)
        .range((currentPage - 1) * pageSize, currentPage * pageSize - 1)
        .order('created_at', { ascending: false });
      
      // Apply filters
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters?.startDate) {
        query = query.gte('start_time', filters.startDate.toISOString());
      }
      
      if (filters?.endDate) {
        query = query.lte('end_time', filters.endDate.toISOString());
      }
      
      const { data: bookings, error: bookingsError } = await query;
      
      if (bookingsError) throw bookingsError;
      if (!bookings || bookings.length === 0) return [];
      
      // Create service lookup map for quick access
      const serviceMap = services.reduce((map, service) => {
        map[service.id] = { name: service.name, price: service.price };
        return map;
      }, {} as Record<string, { name: string; price: number }>);
      
      // Get customer details for each booking
      const customerIds = [...new Set(bookings.map(booking => booking.customer_id))];
      
      const { data: customers, error: customersError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url');
        
      if (customersError) {
        console.error("Error fetching customer details:", customersError);
      }
      
      // Create customer lookup map with fallback values
      const customerMap = (customers || []).reduce((map, customer) => {
        map[customer.id] = { 
          name: customer.username || 'Unknown Customer', 
          email: 'No email provided' 
        };
        return map;
      }, {} as Record<string, { name: string; email: string }>);
      
      // Transform the data to match VendorBooking type
      return bookings.map(booking => {
        const service = serviceMap[booking.service_id] || { name: 'Unknown Service', price: 0 };
        const customer = customerMap[booking.customer_id] || { 
          name: 'Unknown Customer', 
          email: 'No email provided' 
        };
        
        return {
          id: booking.id,
          created_at: booking.created_at,
          service_id: booking.service_id,
          service_name: service.name,
          customer_id: booking.customer_id,
          customer_name: customer.name,
          customer_email: customer.email,
          start_time: booking.start_time,
          end_time: booking.end_time,
          status: booking.status as BookingStatus,
          total_price: service.price,
          notes: booking.customer_notes
        };
      });
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
