
import React, { useState, createContext, useContext, useCallback } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useEvents } from './use-events';
import { useAuth } from '@/context/AuthProvider';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface EventModalContextType {
  isOpen: boolean;
  openEventModal: () => void;
  closeEventModal: () => void;
}

const EventModalContext = createContext<EventModalContextType | undefined>(undefined);

export const EventModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [location, setLocation] = useState({
    address: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
  });

  const { user } = useAuth();
  const { createEvent } = useEvents();
  const navigate = useNavigate();

  const openEventModal = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeEventModal = useCallback(() => {
    setIsOpen(false);
    // Reset form
    setTitle('');
    setDescription('');
    setStartDate(undefined);
    setEndDate(undefined);
    setLocation({
      address: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to create an event');
      return;
    }

    if (!title || !startDate || !endDate || !location.city) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const newEvent = await createEvent({
        title,
        description,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        location,
        organizerId: user.id,
        organizerName: user.user_metadata?.full_name || user.email,
        status: 'draft',
        isPublic: true,
      });
      
      toast.success('Event created successfully!');
      closeEventModal();
      navigate(`/events/${newEvent.id}`);
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event. Please try again.');
    }
  };

  return (
    <EventModalContext.Provider value={{ isOpen, openEventModal, closeEventModal }}>
      {children}
      
      <Dialog open={isOpen} onOpenChange={closeEventModal}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogTitle>Create New Event</DialogTitle>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input 
                id="title" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter event title"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your event"
                className="min-h-[100px]"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Start Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="grid gap-2">
                <Label>End Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      disabled={(date) => startDate ? date < startDate : false}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="space-y-4">
              <Label>Location</Label>
              
              <div className="grid gap-2">
                <Input 
                  placeholder="Address"
                  value={location.address}
                  onChange={(e) => setLocation({...location, address: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  placeholder="City *"
                  value={location.city}
                  onChange={(e) => setLocation({...location, city: e.target.value})}
                  required
                />
                <Input 
                  placeholder="State/Province *"
                  value={location.state}
                  onChange={(e) => setLocation({...location, state: e.target.value})}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  placeholder="Country"
                  value={location.country}
                  onChange={(e) => setLocation({...location, country: e.target.value})}
                />
                <Input 
                  placeholder="Postal Code"
                  value={location.postalCode}
                  onChange={(e) => setLocation({...location, postalCode: e.target.value})}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={closeEventModal}>
                Cancel
              </Button>
              <Button type="submit">Create Event</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </EventModalContext.Provider>
  );
};

export const useEventModal = (): EventModalContextType => {
  const context = useContext(EventModalContext);
  if (context === undefined) {
    throw new Error('useEventModal must be used within an EventModalProvider');
  }
  return context;
};
