import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Ticket, TicketTier } from "@/types/event";
import { Trash2, Plus, QrCode, Mail } from "lucide-react";

interface TicketManagementProps {
  eventId: string;
  ticketTiers: TicketTier[];
  onAddTicketTier: (ticketTier: Omit<TicketTier, "id" | "quantityAvailable">) => Promise<void>;
  onDeleteTicketTier: (id: string) => Promise<void>;
}

// Validation schema for ticket tier form
const ticketTierSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  description: z.string().optional(),
  price: z.number().min(0, { message: "Price must be non-negative" }),
  currency: z.string().min(1, { message: "Currency is required" }).default("USD"),
  quantity: z.number().int().positive({ message: "Quantity must be positive" }),
  type: z.enum(["free", "paid", "donation", "reserved"]),
  salesStartDate: z.string().min(1, { message: "Sales start date is required" }),
  salesEndDate: z.string().min(1, { message: "Sales end date is required" }),
});

type TicketTierFormValues = z.infer<typeof ticketTierSchema>;

const TicketManagement: React.FC<TicketManagementProps> = ({
  eventId,
  ticketTiers,
  onAddTicketTier,
  onDeleteTicketTier,
}) => {
  const { toast } = useToast();
  const [isAddTicketTierDialogOpen, setIsAddTicketTierDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("tiers");
  
  // Form for adding ticket tier
  const ticketTierForm = useForm<TicketTierFormValues>({
    resolver: zodResolver(ticketTierSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      currency: "USD",
      quantity: 100,
      type: "paid",
      salesStartDate: new Date().toISOString().split("T")[0],
      salesEndDate: new Date().toISOString().split("T")[0],
    },
  });
  
  const handleAddTicketTier = async (data: TicketTierFormValues) => {
    try {
      // When adding a ticket tier, set quantityAvailable to equal the quantity (all tickets available)
      const ticketTierWithAvailability = {
        ...data,
        quantityAvailable: data.quantity
      };
      
      await onAddTicketTier(ticketTierWithAvailability);
      setIsAddTicketTierDialogOpen(false);
      ticketTierForm.reset();
      toast({
        title: "Success",
        description: "Ticket tier added successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add ticket tier",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Tickets</h2>
        <Button onClick={() => setIsAddTicketTierDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Ticket Type
        </Button>
      </div>
      
      <Tabs defaultValue="tiers" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="tiers">Ticket Types</TabsTrigger>
          <TabsTrigger value="sold">Sold Tickets</TabsTrigger>
          <TabsTrigger value="checkin">Check-in</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tiers" className="py-4">
          {ticketTiers.length === 0 ? (
            <div className="text-center py-10">
              <h3 className="text-xl font-medium">No ticket types yet</h3>
              <p className="text-gray-500 mt-1">
                Define ticket types to start selling tickets for your event.
              </p>
              <Button className="mt-4" onClick={() => setIsAddTicketTierDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Ticket Type
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ticketTiers.map((tier) => (
                <Card key={tier.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <div>
                        <CardTitle>{tier.name}</CardTitle>
                        <CardDescription>{tier.type}</CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">
                          {tier.price === 0 && tier.type === "free"
                            ? "Free"
                            : `${tier.price} ${tier.currency}`}
                        </div>
                        <div className="text-sm text-gray-500">
                          {tier.quantityAvailable} of {tier.quantity} available
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pb-2">
                    {tier.description && <p className="text-sm">{tier.description}</p>}
                    <div className="mt-2 text-sm text-gray-500">
                      Sales: {new Date(tier.salesStartDate).toLocaleDateString()} - {" "}
                      {new Date(tier.salesEndDate).toLocaleDateString()}
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onDeleteTicketTier(tier.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                    <Button size="sm">Edit</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="sold" className="py-4">
          <div className="text-center py-10">
            <h3 className="text-xl font-medium">No tickets sold yet</h3>
            <p className="text-gray-500 mt-1">
              Once tickets are purchased, they will appear here.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="checkin" className="py-4">
          <div className="text-center py-10">
            <h3 className="text-xl font-medium">Check-in Management</h3>
            <p className="text-gray-500 mt-1">
              Scan QR codes to validate tickets and check in attendees.
            </p>
            <Button className="mt-4">
              <QrCode className="mr-2 h-4 w-4" />
              Open QR Scanner
            </Button>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Add Ticket Tier Dialog */}
      <Dialog open={isAddTicketTierDialogOpen} onOpenChange={setIsAddTicketTierDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Ticket Type</DialogTitle>
            <DialogDescription>
              Create a new ticket type for your event. You can add multiple ticket types.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...ticketTierForm}>
            <form onSubmit={ticketTierForm.handleSubmit(handleAddTicketTier)} className="space-y-4">
              <FormField
                control={ticketTierForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., General Admission" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={ticketTierForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Optional description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={ticketTierForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ticket Type</FormLabel>
                      <FormControl>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          {...field}
                        >
                          <option value="free">Free</option>
                          <option value="paid">Paid</option>
                          <option value="donation">Donation</option>
                          <option value="reserved">Reserved</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={ticketTierForm.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Quantity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={ticketTierForm.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={ticketTierForm.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={ticketTierForm.control}
                  name="salesStartDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sales Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={ticketTierForm.control}
                  name="salesEndDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sales End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddTicketTierDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Add Ticket Type</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TicketManagement;
