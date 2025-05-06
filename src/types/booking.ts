
// Define the booking-related types
export interface BookingService {
  id: string;
  name: string;
  vendorId: string;
}

export interface BookingCustomer {
  id: string;
  email: string;
  fullName?: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';
export type PaymentStatus = 'pending' | 'paid' | 'refunded';

export interface Booking {
  id: string;
  serviceId: string;
  customerId: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  specialRequests?: string;
  customerNotes?: string;
  paymentStatus: PaymentStatus;
  bookingReference?: string;
  qrCode?: string;
  createdAt: string;
  service?: BookingService;
  customer?: BookingCustomer;
}

export interface ServiceBookingFormData {
  serviceId: string;
  startTime: string;
  endTime: string;
  specialRequests?: string;
  customerNotes?: string;
  status?: BookingStatus;
  paymentStatus?: PaymentStatus;
}

// API response interfaces with snake_case
export interface ApiBookingService {
  id: string;
  name: string;
  vendor_id: string;
}

export interface ApiBookingCustomer {
  id: string;
  email: string;
  full_name?: string;
}

export interface ApiBooking {
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
  service?: ApiBookingService;
  customer?: ApiBookingCustomer;
}
