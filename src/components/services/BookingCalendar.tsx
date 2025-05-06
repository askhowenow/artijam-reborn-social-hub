
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { format, addDays, isSameDay, getDay, parse, parseISO, isAfter, addMinutes } from 'date-fns';

import { Service } from '@/hooks/use-services';
import { ServiceAvailability } from '@/hooks/use-service-availability';
import { ServiceBookingFormData } from '@/hooks/use-service-bookings';

interface BookingCalendarProps {
  service: Service;
  availabilities: ServiceAvailability[];
  existingBookings: any[]; // Bookings that already exist for this service
  onBookingSubmit: (bookingData: ServiceBookingFormData) => void;
  isSubmitting: boolean;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({
  service,
  availabilities,
  existingBookings,
  onBookingSubmit,
  isSubmitting
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [availableSlots, setAvailableSlots] = useState<Date[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);
  const [notes, setNotes] = useState('');

  // Generate available time slots for the selected date
  useEffect(() => {
    if (!selectedDate || !service || !availabilities) return;

    // Get day of week for the selected date (0 = Sunday, 1 = Monday, etc.)
    const dayOfWeek = getDay(selectedDate);
    
    // Find availability for this day of week
    const dayAvailability = availabilities.filter(a => a.day_of_week === dayOfWeek);
    
    if (dayAvailability.length === 0) {
      setAvailableSlots([]);
      return;
    }

    const slots: Date[] = [];
    
    // For each availability period on this day
    dayAvailability.forEach(availability => {
      // Parse start and end time
      const startTimeParts = availability.start_time.split(':');
      const endTimeParts = availability.end_time.split(':');
      
      const slotDate = new Date(selectedDate);
      
      // Set start time
      slotDate.setHours(parseInt(startTimeParts[0], 10));
      slotDate.setMinutes(parseInt(startTimeParts[1], 10));
      slotDate.setSeconds(0);
      
      // Set end time
      const endTime = new Date(selectedDate);
      endTime.setHours(parseInt(endTimeParts[0], 10));
      endTime.setMinutes(parseInt(endTimeParts[1], 10));
      endTime.setSeconds(0);
      
      // Generate slots at fixed intervals (e.g., every 30 minutes)
      const slotInterval = service.duration;
      const totalServiceTime = service.duration + (service.preparation_time || 0) + (service.cleanup_time || 0);
      
      while (addMinutes(slotDate, totalServiceTime) <= endTime) {
        // Check if this slot overlaps with any existing bookings
        const slotEnd = addMinutes(slotDate, totalServiceTime);
        
        const isOverlapping = existingBookings.some(booking => {
          const bookingStart = new Date(booking.start_time);
          const bookingEnd = new Date(booking.end_time);
          
          // Check for any overlap
          return (
            (slotDate < bookingEnd && slotEnd > bookingStart) && 
            booking.status !== 'cancelled'
          );
        });
        
        // Only add the slot if it doesn't overlap and is in the future
        if (!isOverlapping && isAfter(slotDate, new Date())) {
          slots.push(new Date(slotDate));
        }
        
        // Move to the next slot
        slotDate.setMinutes(slotDate.getMinutes() + slotInterval);
      }
    });
    
    setAvailableSlots(slots);
    setSelectedSlot(null);
  }, [selectedDate, service, availabilities, existingBookings]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot: Date) => {
    setSelectedSlot(slot);
  };

  const handleSubmit = () => {
    if (!selectedSlot || !selectedDate || !service) return;
    
    const startTime = selectedSlot;
    const endTime = addMinutes(startTime, service.duration);
    
    const bookingData: ServiceBookingFormData = {
      service_id: service.id,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      status: 'confirmed',
      special_requests: notes,
      customer_notes: notes,
      payment_status: 'pending'
    };
    
    onBookingSubmit(bookingData);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Calendar */}
          <div>
            <h3 className="font-medium mb-4">Select Date</h3>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={{ before: new Date() }}
              className="rounded-md border"
            />
          </div>

          {/* Time Slots */}
          <div>
            <h3 className="font-medium mb-4">Available Time Slots</h3>
            {availableSlots.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {availableSlots.map((slot, index) => (
                  <Button
                    key={index}
                    variant={selectedSlot && isSameDay(selectedSlot, slot) && 
                      selectedSlot.getHours() === slot.getHours() && 
                      selectedSlot.getMinutes() === slot.getMinutes() 
                      ? "default" 
                      : "outline"}
                    className={`justify-start ${selectedSlot && isSameDay(selectedSlot, slot) && 
                      selectedSlot.getHours() === slot.getHours() && 
                      selectedSlot.getMinutes() === slot.getMinutes() 
                      ? "bg-artijam-purple hover:bg-artijam-purple/90" : ""}`}
                    onClick={() => handleSlotSelect(slot)}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    {format(slot, 'h:mm a')}
                  </Button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-md">
                <p>No available slots for this date.</p>
                <p className="text-sm mt-2">Try selecting a different date.</p>
              </div>
            )}
          </div>
        </div>

        {selectedSlot && (
          <div className="mt-6 space-y-4">
            <div className="bg-blue-50 p-4 rounded-md">
              <h4 className="font-medium mb-2">Booking Summary</h4>
              <p><strong>Date:</strong> {format(selectedSlot, 'MMMM d, yyyy')}</p>
              <p><strong>Time:</strong> {format(selectedSlot, 'h:mm a')} - {format(addMinutes(selectedSlot, service.duration), 'h:mm a')}</p>
              <p><strong>Service:</strong> {service.name}</p>
              <p><strong>Duration:</strong> {service.duration} minutes</p>
            </div>

            <div>
              <Label htmlFor="notes">Special Requests or Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add any special requests or notes for your booking..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="resize-none"
                rows={3}
              />
            </div>

            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting} 
              className="w-full bg-artijam-purple hover:bg-artijam-purple/90"
            >
              {isSubmitting ? 'Processing...' : 'Confirm Booking'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BookingCalendar;
