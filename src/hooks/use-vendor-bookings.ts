
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

      // Using the RPC function instead of direct table access to avoid TypeScript issues
      const { data, error } = await supabase
        .rpc('get_vendor_bookings', { 
          vendor_id_param: user.user.id,
          status_filter: filters?.status,
          start_date_filter: filters?.startDate?.toISOString(),
          end_date_filter: filters?.endDate?.toISOString(),
          page_number: currentPage,
          items_per_page: pageSize
        });

      if (error) throw error;
      
      return (data as unknown) as VendorBooking[];
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
