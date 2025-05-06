
import React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Service, ServiceFormData } from '@/hooks/use-services';
import { Loader2 } from 'lucide-react';

// Define the form schema with validation
const serviceFormSchema = z.object({
  name: z.string().min(3, "Service name must be at least 3 characters"),
  description: z.string().optional(),
  price: z.coerce.number().positive("Price must be greater than 0"),
  currency: z.string().default("USD"),
  duration: z.coerce.number().int().positive("Duration must be a positive number"),
  category: z.string().optional(),
  location_type: z.enum(["in-person", "virtual", "both"]),
  preparation_time: z.coerce.number().int().min(0, "Preparation time cannot be negative").optional(),
  cleanup_time: z.coerce.number().int().min(0, "Cleanup time cannot be negative").optional(),
  is_available: z.boolean().default(true)
});

interface ServiceFormProps {
  initialData: Service | null;
  onSubmit: (formData: ServiceFormData & { id?: string }) => Promise<void>;
  isSubmitting: boolean;
}

const ServiceForm: React.FC<ServiceFormProps> = ({
  initialData,
  onSubmit,
  isSubmitting
}) => {
  // Set up the form with default values from initialData
  const form = useForm<z.infer<typeof serviceFormSchema>>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      price: initialData?.price || 0,
      currency: initialData?.currency || "USD",
      duration: initialData?.duration || 30,
      category: initialData?.category || "",
      location_type: (initialData?.location_type as "in-person" | "virtual" | "both") || "in-person",
      preparation_time: initialData?.preparation_time || 0,
      cleanup_time: initialData?.cleanup_time || 0,
      is_available: initialData?.is_available ?? true
    }
  });

  const handleSubmit = async (data: z.infer<typeof serviceFormSchema>) => {
    try {
      await onSubmit({
        ...data,
        id: initialData?.id
      });
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Service Name*</FormLabel>
                <FormControl>
                  <Input placeholder="Hair Cut" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Input placeholder="Beauty, Health, Education, etc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price*</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                    <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (minutes)*</FormLabel>
                <FormControl>
                  <Input type="number" min="5" step="5" {...field} />
                </FormControl>
                <FormDescription>
                  The length of the service in minutes
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="location_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location Type*</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="in-person">In Person</SelectItem>
                    <SelectItem value="virtual">Virtual</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="preparation_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preparation Time (minutes)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="5" {...field} />
                </FormControl>
                <FormDescription>
                  Time needed before the service starts
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="cleanup_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cleanup Time (minutes)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="5" {...field} />
                </FormControl>
                <FormDescription>
                  Time needed after the service ends
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe what this service includes..." 
                  className="h-24"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="is_available"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="h-4 w-4 rounded border-gray-300 text-artijam-purple focus:ring-artijam-purple"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Available for booking</FormLabel>
                <FormDescription>
                  Uncheck this to temporarily hide this service from customers
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-4">
          <Button 
            type="submit" 
            className="bg-artijam-purple hover:bg-artijam-purple/90"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? "Update Service" : "Create Service"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ServiceForm;
