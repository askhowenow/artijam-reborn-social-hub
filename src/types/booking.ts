
// Define the booking-related types
export interface BookingService {
  id: string;
  name: string;
  vendor_id: string;
}

export interface BookingCustomer {
  id: string;
  email: string;
  full_name?: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';
export type PaymentStatus = 'pending' | 'paid' | 'refunded';

export interface Booking {
  id: string;
  service_id: string;
  customer_id: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  special_requests?: string;
  customer_notes?: string;
  payment_status: PaymentStatus;
  booking_reference?: string;
  qr_code?: string;
  created_at: string;
  service?: BookingService;
  customer?: BookingCustomer;
}

export interface ServiceBookingFormData {
  serviceId: string;
  startTime: string;
  endTime: string;
  specialRequests?: string;
}
