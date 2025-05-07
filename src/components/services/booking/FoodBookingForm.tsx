
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

// Define the form schema with food-specific fields
const foodBookingSchema = z.object({
  reservationDate: z.date({
    required_error: "Reservation date is required",
  }),
  reservationTime: z.string().min(1, "Reservation time is required"),
  partySize: z.coerce.number().int().min(1, "At least 1 guest required").max(20, "Maximum 20 guests allowed"),
  dietaryRequirements: z.object({
    vegetarian: z.boolean().default(false),
    vegan: z.boolean().default(false),
    glutenFree: z.boolean().default(false),
    nutFree: z.boolean().default(false),
    dairyFree: z.boolean().default(false),
  }),
  specialRequests: z.string().optional(),
});

type FoodBookingFormValues = z.infer<typeof foodBookingSchema>;

interface FoodBookingFormProps {
  service: Service;
  onSubmit: (values: FoodBookingFormValues) => void;
  isSubmitting: boolean;
}

const FoodBookingForm: React.FC<FoodBookingFormProps> = ({ 
  service, 
  onSubmit, 
  isSubmitting 
}) => {
  const form = useForm<FoodBookingFormValues>({
    resolver: zodResolver(foodBookingSchema),
    defaultValues: {
      reservationDate: new Date(),
      reservationTime: "19:00",
      partySize: 2,
      dietaryRequirements: {
        vegetarian: false,
        vegan: false,
        glutenFree: false,
        nutFree: false,
        dairyFree: false,
      },
      specialRequests: "",
    },
  });

  const handleSubmit = (values: FoodBookingFormValues) => {
    onSubmit(values);
  };

  // Generate time options in 30-minute intervals
  const timeOptions = [];
  for (let i = 11; i < 23; i++) {  // Restaurant hours typically 11AM to 11PM
    for (let j = 0; j < 60; j += 30) {
      const hour = i.toString().padStart(2, '0');
      const minute = j.toString().padStart(2, '0');
      timeOptions.push(`${hour}:${minute}`);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Reservation Date */}
          <FormField
            control={form.control}
            name="reservationDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Reservation Date</FormLabel>
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
                          <span>Select reservation date</span>
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

          {/* Reservation Time */}
          <FormField
            control={form.control}
            name="reservationTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reservation Time</FormLabel>
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

          {/* Party Size */}
          <FormField
            control={form.control}
            name="partySize"
            render={({ field }) => (
              <FormItem className="col-span-1 md:col-span-2">
                <FormLabel>Party Size</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  defaultValue={field.value.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select party size" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 15, 20].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? 'Person' : 'People'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Dietary Requirements */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Dietary Requirements</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="dietaryRequirements.vegetarian"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Vegetarian</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dietaryRequirements.vegan"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Vegan</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dietaryRequirements.glutenFree"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Gluten Free</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dietaryRequirements.nutFree"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Nut Free</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dietaryRequirements.dairyFree"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Dairy Free</FormLabel>
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
                  placeholder="Any special requirements, preferences, or occasion details..."
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
          <h3 className="font-medium mb-2">Reservation Summary</h3>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span>{service.name}</span>
              <span>${service.price} per person</span>
            </div>
            <div className="flex justify-between">
              <span>Party size</span>
              <span>{form.watch('partySize')}</span>
            </div>
            <div className="border-t border-gray-200 mt-2 pt-2 font-medium flex justify-between">
              <span>Estimated Total</span>
              <span>${(service.price * form.watch('partySize')).toFixed(2)}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Final price may vary based on ordered items</p>
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full bg-artijam-purple hover:bg-artijam-purple/90"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Processing..." : "Reserve Table"}
        </Button>
      </form>
    </Form>
  );
};

export default FoodBookingForm;
