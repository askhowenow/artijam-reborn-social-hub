
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
  
  const fetchVendorBookings = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      let query = supabase
        .from("vendor_bookings_view")
        .select("*")
        .eq("vendor_id", user.user.id);

      // Apply filters if provided
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }

      if (filters?.startDate) {
        query = query.gte("start_time", filters.startDate.toISOString());
      }

      if (filters?.endDate) {
        query = query.lte("start_time", filters.endDate.toISOString());
      }

      // Add pagination
      const from = (currentPage - 1) * pageSize;
      query = query.range(from, from + pageSize - 1);

      const { data, error } = await query.order("start_time", { ascending: true });

      if (error) throw error;
      
      return data as VendorBooking[];
    } catch (error: any) {
      console.error("Error fetching vendor bookings:", error);
      toast.error("Failed to load bookings");
      return [] as VendorBooking[];
    }
  };

  return useQuery({
    queryKey: ["vendor-bookings", filters?.status, filters?.startDate, filters?.endDate, currentPage, pageSize],
    queryFn: fetchVendorBookings,
  });
};
