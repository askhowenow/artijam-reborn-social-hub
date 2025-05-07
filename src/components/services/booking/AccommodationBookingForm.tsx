
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { addDays, format, isBefore } from 'date-fns';
import { Calendar } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';

import { Service } from '@/hooks/use-services';

// Define the form schema with accommodation-specific fields
const accommodationBookingSchema = z.object({
  checkInDate: z.date({
    required_error: "Check-in date is required",
  }),
  checkOutDate: z.date({
    required_error: "Check-out date is required",
  }),
  guests: z.coerce.number().int().min(1, "At least 1 guest required").max(10, "Maximum 10 guests allowed"),
  specialRequests: z.string().optional(),
}).refine(data => isBefore(data.checkInDate, data.checkOutDate), {
  message: "Check-out date must be after check-in date",
  path: ["checkOutDate"],
});

type AccommodationBookingFormValues = z.infer<typeof accommodationBookingSchema>;

interface AccommodationBookingFormProps {
  service: Service;
  onSubmit: (values: AccommodationBookingFormValues) => void;
  isSubmitting: boolean;
}

const AccommodationBookingForm: React.FC<AccommodationBookingFormProps> = ({ 
  service, 
  onSubmit, 
  isSubmitting 
}) => {
  const form = useForm<AccommodationBookingFormValues>({
    resolver: zodResolver(accommodationBookingSchema),
    defaultValues: {
      checkInDate: new Date(),
      checkOutDate: addDays(new Date(), 1),
      guests: 2,
      specialRequests: "",
    },
  });

  const nights = form.watch('checkInDate') && form.watch('checkOutDate') 
    ? Math.ceil((form.watch('checkOutDate').getTime() - form.watch('checkInDate').getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const handleSubmit = (values: AccommodationBookingFormValues) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Check-in Date */}
          <FormField
            control={form.control}
            name="checkInDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Check-in Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className="w-full pl-3 text-left font-normal"
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Select check-in date</span>
                        )}
                        <Calendar className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Check-out Date */}
          <FormField
            control={form.control}
            name="checkOutDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Check-out Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className="w-full pl-3 text-left font-normal"
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Select check-out date</span>
                        )}
                        <Calendar className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => 
                        date < form.getValues('checkInDate') || 
                        date < new Date()
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Number of Guests */}
          <FormField
            control={form.control}
            name="guests"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Guests</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  defaultValue={field.value.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select number of guests" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? 'Guest' : 'Guests'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Special Requests */}
        <FormField
          control={form.control}
          name="specialRequests"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Special Requests (optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any special requirements or requests..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Booking Summary */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="font-medium mb-2">Booking Summary</h3>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span>{service.name}</span>
              <span>${service.price} per night</span>
            </div>
            <div className="flex justify-between">
              <span>Number of nights</span>
              <span>{nights}</span>
            </div>
            <div className="border-t border-gray-200 mt-2 pt-2 font-medium flex justify-between">
              <span>Total</span>
              <span>${(service.price * nights).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full bg-artijam-purple hover:bg-artijam-purple/90"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Processing..." : "Book Now"}
        </Button>
      </form>
    </Form>
  );
};

export default AccommodationBookingForm;
