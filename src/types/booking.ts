
// Define booking-related types
export type BookingService = {
  id: string;
  name: string;
  vendor_id: string;
};

export type BookingCustomer = {
  id: string;
  email: string;
  full_name?: string;
};

export type Booking = {
  id: string;
  service_id: string;
  customer_id: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';
  special_requests?: string;
  customer_notes?: string;
  payment_status: 'pending' | 'paid' | 'refunded';
  booking_reference?: string;
  qr_code?: string;
  created_at: string;
  service?: BookingService;
  customer?: BookingCustomer;
};

export type ServiceBookingFormData = {
  service_id: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';
  special_requests?: string;
  customer_notes?: string;
  payment_status: 'pending' | 'paid' | 'refunded';
};
