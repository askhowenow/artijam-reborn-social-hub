
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEvents } from '@/hooks/use-events';

interface ShopEventsProps {
  isSelected: boolean;
}

const ShopEvents: React.FC<ShopEventsProps> = ({ isSelected }) => {
  const navigate = useNavigate();
  
  const { 
    events,
    isLoading: isEventsLoading,
  } = useEvents({
    filterByStatus: ['published']
  });

  if (!isSelected) return null;

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg sm:text-xl font-bold">Upcoming Events</h2>
        <Button 
          variant="link" 
          className="text-artijam-purple"
          onClick={() => navigate('/events')}
        >
          View All
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {isEventsLoading ? (
          <div className="col-span-full flex justify-center py-10">
            <div className="animate-spin h-10 w-10 rounded-full border-4 border-artijam-purple border-t-transparent"></div>
          </div>
        ) : events.length === 0 ? (
          <div className="col-span-full text-center py-10">
            <h3 className="text-lg sm:text-xl font-medium">No upcoming events found</h3>
            <p className="text-gray-500 mt-1">Check back later for new events</p>
          </div>
        ) : (
          events.slice(0, 6).map((event) => (
            <div key={event.id} onClick={() => navigate(`/events/${event.id}`)} className="cursor-pointer">
              <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="h-40 bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  {event.featuredImage ? (
                    <img src={event.featuredImage} alt={event.title} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <Calendar className="h-16 w-16 text-white" />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg">{event.title}</h3>
                  <p className="text-sm text-gray-500">{new Date(event.startDate).toLocaleDateString()}</p>
                  <p className="text-sm truncate mt-2">{event.location.city}, {event.location.state}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ShopEvents;
