
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Edit,
  Trash2,
  Share2,
  QrCode,
  Mail,
  Ticket as TicketIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Event, Ticket, TicketTier } from "@/types/event";
import { useEvents } from "@/hooks/use-events";
import { useTickets } from "@/hooks/use-tickets";
import TicketManagement from "./TicketManagement";
import QRCodeGenerator from "./QRCodeGenerator";
import EventLocationMap from "./EventLocationMap";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

interface EventDetailProps {
  event?: Event;
}

const EventDetail: React.FC<EventDetailProps> = ({ event }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const navigate = useNavigate();
  
  const { updateEvent, cancelEvent } = useEvents();
  const { sendTicketByEmail } = useTickets({ eventId: event?.id });
  
  // If no event is provided, show a placeholder
  if (!event) {
    return (
      <div className="container mx-auto py-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="animate-pulse">
            <div className="h-48 bg-gray-200 rounded mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-32 bg-gray-200 rounded mb-4"></div>
          </div>
        </div>
      </div>
    );
  }
  
  const handleAddTicketTier = async (ticketTier: Omit<TicketTier, "id" | "quantityAvailable">) => {
    try {
      // In a real implementation, you would use the Supabase client to insert a new ticket tier
      await updateEvent(event.id, {
        // This would be handled differently in a real app
        // We'd directly insert into the ticket_tiers table
      });
      return Promise.resolve();
    } catch (error) {
      console.error("Error adding ticket tier:", error);
      return Promise.reject(error);
    }
  };
  
  const handleDeleteTicketTier = async (id: string) => {
    try {
      // In a real implementation, you would use the Supabase client to delete the ticket tier
      // await supabase.from('ticket_tiers').delete().eq('id', id);
      return Promise.resolve();
    } catch (error) {
      console.error("Error deleting ticket tier:", error);
      return Promise.reject(error);
    }
  };
  
  const handleSendTicketEmail = async (email: string) => {
    try {
      // Use our useTickets hook's sendTicketByEmail function
      await sendTicketByEmail("sample-ticket-123", email);
      return Promise.resolve();
    } catch (error) {
      console.error("Error sending ticket email:", error);
      return Promise.reject(error);
    }
  };
  
  const handleCancelEvent = async () => {
    try {
      await cancelEvent(event.id);
      setIsCancelDialogOpen(false);
      navigate("/events");
    } catch (error) {
      console.error("Error canceling event:", error);
    }
  };
  
  // Function to get the status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "published": return "bg-green-500";
      case "draft": return "bg-yellow-500";
      case "canceled": return "bg-red-500";
      case "completed": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };
  
  return (
    <div className="container mx-auto py-6">
      {/* Event Header */}
      <div className="bg-white rounded-lg shadow-sm border mb-6 overflow-hidden">
        {event.featuredImage && (
          <div className="h-48 md:h-64 overflow-hidden">
            <img 
              src={event.featuredImage} 
              alt={event.title}
              className="w-full h-full object-cover" 
            />
          </div>
        )}
        
        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between">
            <div>
              <div className="flex items-center mb-2">
                <Badge className={getStatusBadgeColor(event.status)}>
                  {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                </Badge>
                <span className="text-gray-500 text-sm ml-2">
                  Updated {format(new Date(event.updatedAt), "MMM dd, yyyy")}
                </span>
              </div>
              
              <h1 className="text-3xl font-bold">{event.title}</h1>
              <p className="text-gray-500 mt-1">Organized by {event.organizerName}</p>
            </div>
            
            <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate(`/events/${event.id}/edit`)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="destructive" size="sm" onClick={() => setIsCancelDialogOpen(true)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Cancel Event
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-3 text-gray-400" />
              <div>
                <div className="text-sm text-gray-500">Date</div>
                <div>
                  {format(new Date(event.startDate), "MMM dd, yyyy")}
                  {new Date(event.startDate).toDateString() !== new Date(event.endDate).toDateString() && (
                    <> - {format(new Date(event.endDate), "MMM dd, yyyy")}</>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-3 text-gray-400" />
              <div>
                <div className="text-sm text-gray-500">Time</div>
                <div>
                  {format(new Date(event.startDate), "h:mm a")} - {format(new Date(event.endDate), "h:mm a")}
                </div>
              </div>
            </div>
            
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-3 text-gray-400" />
              <div>
                <div className="text-sm text-gray-500">Capacity</div>
                <div>{event.capacity} attendees</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Event Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-3 md:grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="tickets">Tickets</TabsTrigger>
              <TabsTrigger value="attendees">Attendees</TabsTrigger>
              <TabsTrigger value="qr">QR Codes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="p-4 bg-white rounded-lg shadow-sm border mt-2">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">About this event</h2>
                  <p className="whitespace-pre-line">{event.description}</p>
                </div>
                
                <div>
                  <EventLocationMap location={event.location} />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="tickets" className="p-4 bg-white rounded-lg shadow-sm border mt-2">
              <TicketManagement 
                eventId={event.id}
                ticketTiers={event.ticketTiers}
                onAddTicketTier={handleAddTicketTier}
                onDeleteTicketTier={handleDeleteTicketTier}
              />
            </TabsContent>
            
            <TabsContent value="attendees" className="p-4 bg-white rounded-lg shadow-sm border mt-2">
              <div className="text-center py-10">
                <h3 className="text-xl font-medium">No attendees yet</h3>
                <p className="text-gray-500 mt-1">
                  Attendees will appear here once tickets are purchased.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="qr" className="p-4 bg-white rounded-lg shadow-sm border mt-2">
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-2">Ticket QR Codes</h2>
                
                <QRCodeGenerator
                  ticketId="sample-ticket-123"
                  eventName={event.title}
                  attendeeName="Sample Attendee"
                  attendeeEmail="attendee@example.com"
                  onSendEmail={handleSendTicketEmail}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h2 className="text-lg font-bold mb-3">Event Stats</h2>
            
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-500">Tickets Sold</div>
                <div className="text-2xl font-bold">
                  {event.ticketTiers.reduce((sum, tier) => sum + (tier.quantity - tier.quantityAvailable), 0)} / {event.ticketTiers.reduce((sum, tier) => sum + tier.quantity, 0)}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className="bg-indigo-600 rounded-full h-2" 
                    style={{ 
                      width: `${
                        (event.ticketTiers.reduce((sum, tier) => sum + (tier.quantity - tier.quantityAvailable), 0) / 
                        event.ticketTiers.reduce((sum, tier) => sum + tier.quantity, 0)) * 100
                      }%` 
                    }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500">Total Revenue</div>
                <div className="text-2xl font-bold">
                  $
                  {event.ticketTiers.reduce(
                    (sum, tier) => sum + (tier.quantity - tier.quantityAvailable) * tier.price,
                    0
                  ).toLocaleString()}
                </div>
              </div>
              
              <div className="pt-2 border-t">
                <Button className="w-full" onClick={() => setActiveTab("tickets")}>
                  <TicketIcon className="mr-2 h-4 w-4" />
                  Manage Tickets
                </Button>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h2 className="text-lg font-bold mb-3">Quick Links</h2>
            
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab("qr")}>
                <QrCode className="mr-2 h-4 w-4" />
                Generate QR Codes
              </Button>
              
              <Button variant="outline" className="w-full justify-start">
                <Mail className="mr-2 h-4 w-4" />
                Email Attendees
              </Button>
              
              <Button variant="outline" className="w-full justify-start">
                <Share2 className="mr-2 h-4 w-4" />
                Share Event Page
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Cancel Event Confirmation Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this event? This action cannot be undone.
              All ticket holders will be notified.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
              No, Keep Event
            </Button>
            <Button variant="destructive" onClick={handleCancelEvent}>
              Yes, Cancel Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventDetail;
