
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { Calendar, Clock, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

import { Service } from '@/hooks/use-services';

// Define the form schema with attraction-specific fields
const attractionBookingSchema = z.object({
  visitDate: z.date({
    required_error: "Visit date is required",
  }),
  visitTime: z.string().min(1, "Visit time is required"),
  tickets: z.coerce.number().int().min(1, "At least 1 ticket required").max(20, "Maximum 20 tickets allowed"),
  ticketTypes: z.object({
    adult: z.coerce.number().int().min(0).default(1),
    child: z.coerce.number().int().min(0).default(0),
    senior: z.coerce.number().int().min(0).default(0),
  }),
  addons: z.object({
    guidedTour: z.boolean().default(false),
    fastPass: z.boolean().default(false),
    photoPackage: z.boolean().default(false),
  }),
  specialRequests: z.string().optional(),
}).refine((data) => {
  const totalTickets = data.ticketTypes.adult + data.ticketTypes.child + data.ticketTypes.senior;
  return totalTickets === data.tickets;
}, {
  message: "The sum of ticket types must equal the total number of tickets",
  path: ["ticketTypes"],
});

type AttractionBookingFormValues = z.infer<typeof attractionBookingSchema>;

interface AttractionBookingFormProps {
  service: Service;
  onSubmit: (values: AttractionBookingFormValues) => void;
  isSubmitting: boolean;
}

const AttractionBookingForm: React.FC<AttractionBookingFormProps> = ({ 
  service, 
  onSubmit, 
  isSubmitting 
}) => {
  const form = useForm<AttractionBookingFormValues>({
    resolver: zodResolver(attractionBookingSchema),
    defaultValues: {
      visitDate: new Date(),
      visitTime: "10:00",
      tickets: 1,
      ticketTypes: {
        adult: 1,
        child: 0,
        senior: 0,
      },
      addons: {
        guidedTour: false,
        fastPass: false,
        photoPackage: false,
      },
      specialRequests: "",
    },
  });

  // Watch form values for reactive calculations
  const totalTickets = form.watch('tickets');
  const adultTickets = form.watch('ticketTypes.adult');
  const childTickets = form.watch('ticketTypes.child');
  const seniorTickets = form.watch('ticketTypes.senior');
  
  // Update total tickets when ticket types change
  React.useEffect(() => {
    const sum = adultTickets + childTickets + seniorTickets;
    if (sum !== totalTickets) {
      form.setValue('tickets', sum);
    }
  }, [adultTickets, childTickets, seniorTickets]);

  const handleSubmit = (values: AttractionBookingFormValues) => {
    onSubmit(values);
  };

  // Generate time options in 30-minute intervals
  const timeOptions = [];
  for (let i = 9; i < 18; i++) {  // Attraction hours typically 9AM to 6PM
    for (let j = 0; j < 60; j += 30) {
      const hour = i.toString().padStart(2, '0');
      const minute = j.toString().padStart(2, '0');
      timeOptions.push(`${hour}:${minute}`);
    }
  }

  // Calculate pricing
  const basePrice = service.price || 0;
  const childPrice = basePrice * 0.6;  // 40% discount for children
  const seniorPrice = basePrice * 0.8;  // 20% discount for seniors
  const guidedTourPrice = 15;
  const fastPassPrice = 25;
  const photoPackagePrice = 20;
  
  const totalPrice = 
    (adultTickets * basePrice) + 
    (childTickets * childPrice) + 
    (seniorTickets * seniorPrice) + 
    (form.watch('addons.guidedTour') ? guidedTourPrice : 0) +
    (form.watch('addons.fastPass') ? fastPassPrice : 0) +
    (form.watch('addons.photoPackage') ? photoPackagePrice : 0);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Visit Date */}
          <FormField
            control={form.control}
            name="visitDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Visit Date</FormLabel>
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
                          <span>Select visit date</span>
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

          {/* Visit Time */}
          <FormField
            control={form.control}
            name="visitTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Visit Time</FormLabel>
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
        </div>

        {/* Ticket Information */}
        <div>
          <h3 className="text-sm font-medium mb-2">Ticket Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="ticketTypes.adult"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adult Tickets</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    defaultValue={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select number" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <SelectItem key={`adult-${num}`} value={num.toString()}>
                          {num}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">${basePrice.toFixed(2)} per ticket</p>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ticketTypes.child"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Child Tickets (under 12)</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    defaultValue={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select number" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <SelectItem key={`child-${num}`} value={num.toString()}>
                          {num}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">${childPrice.toFixed(2)} per ticket</p>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ticketTypes.senior"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senior Tickets (65+)</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    defaultValue={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select number" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <SelectItem key={`senior-${num}`} value={num.toString()}>
                          {num}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">${seniorPrice.toFixed(2)} per ticket</p>
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Add-ons */}
        <div>
          <h3 className="text-sm font-medium mb-2">Add-ons</h3>
          <div className="space-y-2">
            <FormField
              control={form.control}
              name="addons.guidedTour"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="flex items-center">
                      <span>Guided Tour</span>
                      <span className="ml-2 text-xs text-gray-500">(+${guidedTourPrice.toFixed(2)})</span>
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="addons.fastPass"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="flex items-center">
                      <span>Fast Pass (Skip the Line)</span>
                      <span className="ml-2 text-xs text-gray-500">(+${fastPassPrice.toFixed(2)})</span>
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="addons.photoPackage"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="flex items-center">
                      <span>Photo Package</span>
                      <span className="ml-2 text-xs text-gray-500">(+${photoPackagePrice.toFixed(2)})</span>
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div>
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
                  placeholder="Any accessibility needs, special circumstances, etc..."
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
              <span>Adult Tickets ({adultTickets})</span>
              <span>${(adultTickets * basePrice).toFixed(2)}</span>
            </div>
            {childTickets > 0 && (
              <div className="flex justify-between">
                <span>Child Tickets ({childTickets})</span>
                <span>${(childTickets * childPrice).toFixed(2)}</span>
              </div>
            )}
            {seniorTickets > 0 && (
              <div className="flex justify-between">
                <span>Senior Tickets ({seniorTickets})</span>
                <span>${(seniorTickets * seniorPrice).toFixed(2)}</span>
              </div>
            )}
            {form.watch('addons.guidedTour') && (
              <div className="flex justify-between">
                <span>Guided Tour</span>
                <span>${guidedTourPrice.toFixed(2)}</span>
              </div>
            )}
            {form.watch('addons.fastPass') && (
              <div className="flex justify-between">
                <span>Fast Pass</span>
                <span>${fastPassPrice.toFixed(2)}</span>
              </div>
            )}
            {form.watch('addons.photoPackage') && (
              <div className="flex justify-between">
                <span>Photo Package</span>
                <span>${photoPackagePrice.toFixed(2)}</span>
              </div>
            )}
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
          {isSubmitting ? "Processing..." : "Book Tickets"}
        </Button>
      </form>
    </Form>
  );
};

export default AttractionBookingForm;
