
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed';

// API response types with snake_case properties
export interface ApiBookingCustomer {
  id: string;
  email: string;
  full_name?: string;
}

export interface ApiBookingService {
  id: string;
  name: string;
  vendor_id: string;
}

export interface ApiBooking {
  id: string;
  service_id: string;
  customer_id: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  payment_status: PaymentStatus;
  special_requests?: string;
  customer_notes?: string;
  booking_reference?: string;
  qr_code?: string;
  created_at: string;
  service?: ApiBookingService;
  customer?: ApiBookingCustomer;
}

// Frontend types with camelCase properties
export interface BookingCustomer {
  id: string;
  email: string;
  fullName?: string;
}

export interface BookingService {
  id: string;
  name: string;
  vendorId: string;
}

export interface Booking {
  id: string;
  serviceId: string;
  customerId: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  specialRequests?: string;
  customerNotes?: string;
  bookingReference?: string;
  qrCode?: string;
  createdAt: string;
  service?: BookingService;
  customer?: BookingCustomer;
}

// Specific form data types for different booking categories
export interface AccommodationBookingFormValues {
  checkInDate: Date;
  checkOutDate: Date;
  guests: number;
  specialRequests?: string;
}

export interface FoodBookingFormValues {
  reservationDate: Date;
  reservationTime: string;
  partySize: number;
  dietaryRequirements?: {
    vegetarian: boolean;
    vegan: boolean;
    glutenFree: boolean;
    nutFree: boolean;
    dairyFree: boolean;
  };
  specialRequests?: string;
}

export interface AttractionBookingFormValues {
  visitDate: Date;
  visitTime: string;
  tickets: number;
  ticketTypes: {
    adult: number;
    child: number;
    senior: number;
  };
  addons?: {
    guidedTour: boolean;
    fastPass: boolean;
    photoPackage: boolean;
  };
  specialRequests?: string;
}

export interface TravelBookingFormValues {
  departureDate: Date;
  departureTime: string;
  returnDate?: Date;
  passengers: number;
  class: string;
  specialRequests?: string;
}

// General booking form data for API requests
export interface ServiceBookingFormData {
  serviceId: string;
  startTime: string;
  endTime: string;
  additionalData?: any;
  specialRequests?: string;
}
