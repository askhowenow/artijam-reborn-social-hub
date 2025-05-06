
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/context/AuthProvider";
import { useEvents } from "@/hooks/use-events";
import { 
  Calendar, MapPin, Ticket, Plus, Edit, Trash, 
  Calendar as CalendarIcon, Filter, Search as SearchIcon 
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useEventModal } from "@/hooks/use-event-modal";
import { Event } from "@/types/event";

const MyEventsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openEventModal } = useEventModal();
  
  const { 
    events, 
    isLoading, 
    deleteEvent, 
    publishEvent,
    cancelEvent 
  } = useEvents({
    filterByOrganizer: user?.id,
  });

  // Filter events based on search and tab
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    
    switch (activeTab) {
      case "published":
        return event.status === "published";
      case "draft":
        return event.status === "draft";
      case "canceled":
        return event.status === "canceled";
      default:
        return true;
    }
  });

  const handleCreateEvent = () => {
    openEventModal();
  };

  const handleEditEvent = (event: Event) => {
    navigate(`/events/${event.id}/edit`);
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await deleteEvent(eventId);
      toast.success("Event deleted successfully");
    } catch (error) {
      toast.error("Failed to delete event");
    }
  };

  const handlePublishEvent = async (eventId: string) => {
    try {
      await publishEvent(eventId);
      toast.success("Event published successfully");
    } catch (error) {
      toast.error("Failed to publish event");
    }
  };

  const handleCancelEvent = async (eventId: string) => {
    try {
      await cancelEvent(eventId);
      toast.success("Event canceled successfully");
    } catch (error) {
      toast.error("Failed to cancel event");
    }
  };

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
    <>
      <Helmet>
        <title>My Events - Manage Your Events</title>
        <meta name="description" content="Create and manage your events" />
      </Helmet>

      <div className="container max-w-7xl mx-auto py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold">My Events</h1>
            <p className="text-gray-500">Create and manage your events</p>
          </div>
          
          <Button onClick={handleCreateEvent}>
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        </div>
        
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input 
                placeholder="Search events..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Button variant="outline" className="flex gap-2">
              <Filter size={18} />
              Filters
            </Button>
          </div>
          
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="published">Published</TabsTrigger>
              <TabsTrigger value="draft">Draft</TabsTrigger>
              <TabsTrigger value="canceled">Canceled</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin h-10 w-10 rounded-full border-4 border-artijam-purple border-t-transparent"></div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-10">
            <h3 className="text-xl font-medium">No events found</h3>
            <p className="text-gray-500 mt-1">
              {searchQuery 
                ? "Try a different search term"
                : activeTab !== "all"
                  ? `You don't have any ${activeTab} events`
                  : "Create your first event by clicking the 'Create Event' button"
              }
            </p>
            
            <Button className="mt-4" onClick={handleCreateEvent}>
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <Card key={event.id} className="overflow-hidden">
                {event.featuredImage ? (
                  <div className="h-40 overflow-hidden">
                    <img 
                      src={event.featuredImage} 
                      alt={event.title}
                      className="w-full h-full object-cover" 
                    />
                  </div>
                ) : (
                  <div className="h-40 bg-gradient-to-r from-artijam-purple to-blue-500 flex items-center justify-center text-white">
                    <CalendarIcon size={48} />
                  </div>
                )}
                
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <Badge className={getStatusBadgeColor(event.status)}>
                      {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {event.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pb-2">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center text-sm">
                      <Calendar className="mr-2 h-4 w-4 opacity-70" />
                      <span>
                        {format(new Date(event.startDate), "dd MMM yyyy")}
                        {event.startDate !== event.endDate && 
                          ` - ${format(new Date(event.endDate), "dd MMM yyyy")}`}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <MapPin className="mr-2 h-4 w-4 opacity-70" />
                      <span className="truncate">
                        {event.location.city}, {event.location.state}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <Ticket className="mr-2 h-4 w-4 opacity-70" />
                      <span>
                        {event.ticketTiers.reduce((total, tier) => total + tier.quantity, 0)} tickets total
                      </span>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-between">
                  <Button 
                    variant="outline" 
                    className="flex-1 mr-2"
                    onClick={() => navigate(`/events/${event.id}`)}
                  >
                    View
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="px-2">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditEvent(event)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      {event.status === 'draft' && (
                        <DropdownMenuItem onClick={() => handlePublishEvent(event.id)}>
                          <Calendar className="mr-2 h-4 w-4" /> Publish
                        </DropdownMenuItem>
                      )}
                      {event.status === 'published' && (
                        <DropdownMenuItem onClick={() => handleCancelEvent(event.id)}>
                          <Calendar className="mr-2 h-4 w-4" /> Cancel
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        className="text-red-500"
                        onClick={() => handleDeleteEvent(event.id)}
                      >
                        <Trash className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default MyEventsPage;
