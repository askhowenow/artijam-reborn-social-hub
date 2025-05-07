
/**
 * Utility functions for transforming data between frontend and backend formats
 */

import { Booking, ApiBooking, ApiBookingService, ApiBookingCustomer, BookingService, BookingCustomer } from '@/types/booking';

/**
 * Transforms camelCase booking data to snake_case format for the API
 */
export function transformBookingDataForApi(bookingData: {
  serviceId: string;
  startTime: string;
  endTime: string;
  specialRequests?: string;
  customerNotes?: string;
  status?: string;
  paymentStatus?: string;
}) {
  return {
    service_id: bookingData.serviceId,
    start_time: bookingData.startTime,
    end_time: bookingData.endTime,
    special_requests: bookingData.specialRequests,
    customer_notes: bookingData.customerNotes,
    status: bookingData.status || 'confirmed',
    payment_status: bookingData.paymentStatus || 'pending',
  };
}

/**
 * Transforms snake_case booking data from API to camelCase format for the frontend
 */
export function transformBookingFromApi(apiBooking: ApiBooking): Booking {
  if (!apiBooking) return null as unknown as Booking;
  
  // Create the transformed booking with camelCase properties
  const transformed: Booking = {
    id: apiBooking.id,
    serviceId: apiBooking.service_id,
    customerId: apiBooking.customer_id,
    startTime: apiBooking.start_time,
    endTime: apiBooking.end_time,
    status: apiBooking.status,
    specialRequests: apiBooking.special_requests,
    customerNotes: apiBooking.customer_notes,
    paymentStatus: apiBooking.payment_status,
    bookingReference: apiBooking.booking_reference,
    qrCode: apiBooking.qr_code,
    createdAt: apiBooking.created_at,
    service: undefined,
    customer: undefined
  };

  // Handle nested service object if it exists
  if (apiBooking.service) {
    transformed.service = {
      id: apiBooking.service.id,
      name: apiBooking.service.name,
      vendorId: apiBooking.service.vendor_id,
    };
  }

  // Handle nested customer object if it exists
  if (apiBooking.customer) {
    transformed.customer = {
      id: apiBooking.customer.id,
      email: apiBooking.customer.email,
      fullName: apiBooking.customer.full_name,
    };
  }

  return transformed;
}
