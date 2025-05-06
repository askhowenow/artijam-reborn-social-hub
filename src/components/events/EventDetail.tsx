import React, { useState } from "react";
import { useParams } from "react-router-dom";
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

const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Fetch event details - in a real app, this would come from the API
  // For now, let's use a mock event
  const mockEvent: Event = {
    id: id || "1",
    title: "Annual Tech Conference 2025",
    description: "Join us for the biggest tech conference of the year, featuring keynote speakers, workshops, and networking opportunities.",
    startDate: "2025-09-15T09:00:00Z",
    endDate: "2025-09-17T17:00:00Z",
    location: {
      address: "123 Conference Way",
      city: "San Francisco",
      state: "CA",
      country: "USA",
      postalCode: "94105",
      latitude: 37.7749,
      longitude: -122.4194,
    },
    organizerId: "user123",
    organizerName: "Tech Events Inc.",
    featuredImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2370&q=80",
    ticketTiers: [
      {
        id: "tier1",
        name: "General Admission",
        description: "Access to all keynotes and expo hall",
        price: 99,
        currency: "USD",
        quantity: 500,
        quantityAvailable: 350,
        type: "paid",
        salesStartDate: "2025-05-01T00:00:00Z",
        salesEndDate: "2025-09-14T23:59:59Z",
      },
      {
        id: "tier2",
        name: "VIP Pass",
        description: "General admission plus exclusive workshops and networking event",
        price: 299,
        currency: "USD",
        quantity: 100,
        quantityAvailable: 75,
        type: "paid",
        salesStartDate: "2025-05-01T00:00:00Z",
        salesEndDate: "2025-09-10T23:59:59Z",
      },
    ],
    status: "published",
    createdAt: "2025-04-01T12:00:00Z",
    updatedAt: "2025-04-15T09:30:00Z",
    isPublic: true,
    capacity: 600,
  };
  
  const handleAddTicketTier = async (ticketTier: Omit<TicketTier, "id" | "quantityAvailable">) => {
    // In a real app, this would call the API
    console.log("Adding ticket tier:", ticketTier);
    // Mock implementation
    return Promise.resolve();
  };
  
  const handleDeleteTicketTier = async (id: string) => {
    // In a real app, this would call the API
    console.log("Deleting ticket tier:", id);
    // Mock implementation
    return Promise.resolve();
  };
  
  const handleSendTicketEmail = async (email: string) => {
    // In a real app, this would call the API
    console.log("Sending ticket email to:", email);
    // Mock implementation
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 1500);
    });
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
        {mockEvent.featuredImage && (
          <div className="h-48 md:h-64 overflow-hidden">
            <img 
              src={mockEvent.featuredImage} 
              alt={mockEvent.title}
              className="w-full h-full object-cover" 
            />
          </div>
        )}
        
        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between">
            <div>
              <div className="flex items-center mb-2">
                <Badge className={getStatusBadgeColor(mockEvent.status)}>
                  {mockEvent.status.charAt(0).toUpperCase() + mockEvent.status.slice(1)}
                </Badge>
                <span className="text-gray-500 text-sm ml-2">
                  Updated {format(new Date(mockEvent.updatedAt), "MMM dd, yyyy")}
                </span>
              </div>
              
              <h1 className="text-3xl font-bold">{mockEvent.title}</h1>
              <p className="text-gray-500 mt-1">Organized by {mockEvent.organizerName}</p>
            </div>
            
            <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="destructive" size="sm">
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
                  {format(new Date(mockEvent.startDate), "MMM dd, yyyy")}
                  {new Date(mockEvent.startDate).toDateString() !== new Date(mockEvent.endDate).toDateString() && (
                    <> - {format(new Date(mockEvent.endDate), "MMM dd, yyyy")}</>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-3 text-gray-400" />
              <div>
                <div className="text-sm text-gray-500">Time</div>
                <div>
                  {format(new Date(mockEvent.startDate), "h:mm a")} - {format(new Date(mockEvent.endDate), "h:mm a")}
                </div>
              </div>
            </div>
            
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-3 text-gray-400" />
              <div>
                <div className="text-sm text-gray-500">Capacity</div>
                <div>{mockEvent.capacity} attendees</div>
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
                  <p className="whitespace-pre-line">{mockEvent.description}</p>
                </div>
                
                <div>
                  <EventLocationMap location={mockEvent.location} />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="tickets" className="p-4 bg-white rounded-lg shadow-sm border mt-2">
              <TicketManagement 
                eventId={mockEvent.id}
                ticketTiers={mockEvent.ticketTiers}
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
                  eventName={mockEvent.title}
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
                  {mockEvent.ticketTiers.reduce((sum, tier) => sum + (tier.quantity - tier.quantityAvailable), 0)} / {mockEvent.ticketTiers.reduce((sum, tier) => sum + tier.quantity, 0)}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className="bg-artijam-purple rounded-full h-2" 
                    style={{ 
                      width: `${
                        (mockEvent.ticketTiers.reduce((sum, tier) => sum + (tier.quantity - tier.quantityAvailable), 0) / 
                        mockEvent.ticketTiers.reduce((sum, tier) => sum + tier.quantity, 0)) * 100
                      }%` 
                    }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500">Total Revenue</div>
                <div className="text-2xl font-bold">
                  $
                  {mockEvent.ticketTiers.reduce(
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
    </div>
  );
};

export default EventDetail;
