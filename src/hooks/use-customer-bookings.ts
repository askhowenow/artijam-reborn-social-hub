
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
  customer_name?: string; // Added to match VendorBooking
  vendor_name?: string; // Added to match VendorBooking
  total_price?: number; // Added to match VendorBooking
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
      
      // Get all service IDs at once
      const serviceIds = [...new Set(bookingData.map(booking => booking.service_id))];
      
      // Fetch all services in one go
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('id, name, price, vendor_id')
        .in('id', serviceIds);
        
      if (servicesError) {
        console.error("Error fetching services:", servicesError);
        return [];
      }
      
      // Create a service lookup map
      const serviceMap = (servicesData || []).reduce((map, service) => {
        map[service.id] = {
          name: service.name,
          price: service.price,
          vendorId: service.vendor_id
        };
        return map;
      }, {} as Record<string, { name: string; price: number; vendorId: string }>);
      
      // Get all vendor IDs
      const vendorIds = [...new Set(servicesData.map(service => service.vendor_id))];
      
      // Fetch all vendors in one go
      const { data: vendorsData, error: vendorError } = await supabase
        .from('vendor_profiles')
        .select('id, business_name')
        .in('id', vendorIds);
        
      if (vendorError) {
        console.error("Error fetching vendors:", vendorError);
      }
      
      // Create vendor lookup map
      const vendorMap = (vendorsData || []).reduce((map, vendor) => {
        map[vendor.id] = vendor.business_name || 'Unknown Vendor';
        return map;
      }, {} as Record<string, string>);
      
      // Transform bookings with the joined data
      return bookingData.map(booking => {
        const service = serviceMap[booking.service_id] || { name: 'Unknown Service', price: 0, vendorId: '' };
        const vendorName = vendorMap[service.vendorId] || 'Unknown Vendor';
        
        return {
          id: booking.id,
          created_at: booking.created_at,
          service_id: booking.service_id,
          service_name: service.name,
          vendor_id: service.vendorId,
          vendor_name: vendorName,
          start_time: booking.start_time,
          end_time: booking.end_time,
          status: booking.status as BookingStatus,
          price: service.price,
          notes: booking.customer_notes,
          total_price: service.price // Added to match VendorBooking
        };
      });
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
