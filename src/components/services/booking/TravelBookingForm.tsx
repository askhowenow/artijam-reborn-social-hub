
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { Calendar, Clock, Users, Plane } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

import { Service } from '@/hooks/use-services';

// Define the form schema with travel-specific fields
const travelBookingSchema = z.object({
  departureDate: z.date({
    required_error: "Departure date is required",
  }),
  departureTime: z.string().min(1, "Departure time is required"),
  returnDate: z.date().optional(),
  passengers: z.coerce.number().int().min(1, "At least 1 passenger required").max(20, "Maximum 20 passengers allowed"),
  class: z.enum(["economy", "business", "first"], {
    required_error: "Travel class is required",
  }),
  specialRequests: z.string().optional(),
});

type TravelBookingFormValues = z.infer<typeof travelBookingSchema>;

interface TravelBookingFormProps {
  service: Service;
  onSubmit: (values: TravelBookingFormValues) => void;
  isSubmitting: boolean;
}

const TravelBookingForm: React.FC<TravelBookingFormProps> = ({ 
  service, 
  onSubmit, 
  isSubmitting 
}) => {
  const form = useForm<TravelBookingFormValues>({
    resolver: zodResolver(travelBookingSchema),
    defaultValues: {
      departureDate: new Date(),
      departureTime: "10:00",
      passengers: 1,
      class: "economy",
      specialRequests: "",
    },
  });

  const handleSubmit = (values: TravelBookingFormValues) => {
    onSubmit(values);
  };

  // Generate time options in 30-minute intervals
  const timeOptions = [];
  for (let i = 0; i < 24; i++) {
    for (let j = 0; j < 60; j += 30) {
      const hour = i.toString().padStart(2, '0');
      const minute = j.toString().padStart(2, '0');
      timeOptions.push(`${hour}:${minute}`);
    }
  }

  // Calculate pricing based on class and passengers
  const basePricePerPerson = service.price || 100;
  const getClassMultiplier = (travelClass: string) => {
    switch(travelClass) {
      case 'business': return 2.5;
      case 'first': return 4;
      default: return 1; // economy
    }
  };

  const classMultiplier = getClassMultiplier(form.watch('class'));
  const passengers = form.watch('passengers');
  const totalPrice = basePricePerPerson * classMultiplier * passengers;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Departure Date */}
          <FormField
            control={form.control}
            name="departureDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Departure Date</FormLabel>
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
                          <span>Select departure date</span>
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

          {/* Departure Time */}
          <FormField
            control={form.control}
            name="departureTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Departure Time</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {timeOptions.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Optional Return Date */}
          <FormField
            control={form.control}
            name="returnDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Return Date (Optional)</FormLabel>
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
                          <span>Select return date</span>
                        )}
                        <Calendar className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={field.value || undefined}
                      onSelect={field.onChange}
                      disabled={(date) => date < form.getValues('departureDate')}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Number of Passengers */}
          <FormField
            control={form.control}
            name="passengers"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Passengers</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  defaultValue={field.value.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select number of passengers" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? 'Passenger' : 'Passengers'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Travel Class */}
        <FormField
          control={form.control}
          name="class"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Travel Class</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="economy" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Economy - ${basePricePerPerson.toFixed(2)} per person
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="business" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Business - ${(basePricePerPerson * 2.5).toFixed(2)} per person
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="first" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      First Class - ${(basePricePerPerson * 4).toFixed(2)} per person
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Special Requests */}
        <FormField
          control={form.control}
          name="specialRequests"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Special Requests (optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any dietary requirements, assistance needs, or other requests..."
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
          <h3 className="font-medium mb-2">Trip Summary</h3>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span>{service.name}</span>
            </div>
            <div className="flex justify-between">
              <span>
                {passengers} {passengers === 1 ? 'passenger' : 'passengers'}, {form.watch('class')} class
              </span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-200 mt-2 pt-2 font-medium flex justify-between">
              <span>Total</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full bg-artijam-purple hover:bg-artijam-purple/90"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Processing..." : "Book Trip"}
        </Button>
      </form>
    </Form>
  );
};

export default TravelBookingForm;
