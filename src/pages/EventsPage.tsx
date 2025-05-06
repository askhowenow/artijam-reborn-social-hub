
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Ticket, Plus, Filter, SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Event } from "@/types/event";
import { useEvents } from "@/hooks/use-events";

const EventsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const { events, isLoading } = useEvents();
  
  // Filter events based on search query
  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Get events based on active tab
  const getFilteredEvents = () => {
    const now = new Date();
    
    switch (activeTab) {
      case "upcoming":
        return filteredEvents.filter(event => new Date(event.startDate) > now);
      case "past":
        return filteredEvents.filter(event => new Date(event.endDate) < now);
      case "draft":
        return filteredEvents.filter(event => event.status === "draft");
      default:
        return filteredEvents;
    }
  };
  
  // Get status badge color
  const getStatusColor = (status: string) => {
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="text-gray-500">Manage your events and tickets</p>
        </div>
        
        <Button onClick={() => {}}>
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
        
        <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
            <TabsTrigger value="draft">Draft</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin h-10 w-10 rounded-full border-4 border-artijam-purple border-t-transparent"></div>
        </div>
      ) : getFilteredEvents().length === 0 ? (
        <div className="text-center py-10">
          <h3 className="text-xl font-medium">No events found</h3>
          <p className="text-gray-500 mt-1">
            {searchQuery 
              ? "Try a different search term"
              : activeTab === "draft" 
                ? "You don't have any draft events" 
                : activeTab === "past"
                  ? "You don't have any past events"
                  : "Create your first event by clicking the 'Create Event' button"
            }
          </p>
          
          <Button className="mt-4" onClick={() => {}}>
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getFilteredEvents().map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
};

// Event Card Component
interface EventCardProps {
  event: Event;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  return (
    <Card className="overflow-hidden">
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
          <Calendar size={48} />
        </div>
      )}
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{event.title}</CardTitle>
          <Badge className={`${getStatusBadgeColor(event.status)}`}>
            {capitalizeFirstLetter(event.status)}
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
      
      <CardFooter>
        <Button variant="outline" className="w-full">
          Manage Event
        </Button>
      </CardFooter>
    </Card>
  );
};

function getStatusBadgeColor(status: string) {
  switch (status) {
    case "published": return "bg-green-500";
    case "draft": return "bg-yellow-500";
    case "canceled": return "bg-red-500";
    case "completed": return "bg-blue-500";
    default: return "bg-gray-500";
  }
}

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export default EventsPage;
