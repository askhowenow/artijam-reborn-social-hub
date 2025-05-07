
// This file serves as a barrel export for all booking-related hooks
export { useCustomerBookings } from './use-customer-bookings';
export { useVendorBookings } from './use-vendor-bookings';
export { useCreateBooking } from './use-create-booking';
export type { Booking, BookingService, BookingCustomer, ServiceBookingFormData } from '@/types/booking';

// Expose stream hooks
export { 
  useLiveStreams, 
  useStream, 
  useCreateStream, 
  useMyStreams,
  useUpdateStreamStatus,
  useDeleteStream
} from './use-streams';
export { default as useStreamChat } from './use-stream-chat';
export type { Stream, StreamChat, StreamReaction, StreamStatus } from '@/types/stream';
