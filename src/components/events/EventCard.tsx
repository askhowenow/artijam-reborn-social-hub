
import React from "react";
import { Calendar, MapPin, Ticket } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import type { Event } from "@/types/event";

interface EventCardProps {
  event: Event;
  showActions?: boolean;
  isOwned?: boolean;
  onEdit?: (event: Event) => void;
  onDelete?: (id: string) => void;
}

const EventCard: React.FC<EventCardProps> = ({
  event,
  showActions = true,
  isOwned = false,
  onEdit,
  onDelete
}) => {
  const navigate = useNavigate();
  
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "published": return "bg-green-500";
      case "draft": return "bg-yellow-500";
      case "canceled": return "bg-red-500";
      case "completed": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  const handleClick = () => {
    navigate(`/events/${event.id}`);
  };

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
          {isOwned && (
            <Badge className={getStatusBadgeColor(event.status)}>
              {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
            </Badge>
          )}
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
              {event.ticketTiers.length > 0 
                ? `${event.ticketTiers.reduce((total, tier) => total + tier.quantity, 0)} tickets total` 
                : 'No tickets available'}
            </span>
          </div>
        </div>
      </CardContent>
      
      {showActions && (
        <CardFooter>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleClick}
          >
            {isOwned ? "Manage Event" : "View Details"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default EventCard;
