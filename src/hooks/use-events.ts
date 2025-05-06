import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Event, UseEventsOptions, UseEventsResult, EventStatus } from '@/types/event';
import { mapDbEventToEvent } from '@/utils/event-mappers';

// Helper functions for events
const fetchEvents = async (options?: UseEventsOptions): Promise<Event[]> => {
  let query = supabase.from('events').select('*');
  
  // Apply filters based on options
  if (options?.filterByStatus && options.filterByStatus.length > 0) {
    query = query.in('status', options.filterByStatus);
  }
  
  if (options?.filterByOrganizer) {
    query = query.eq('organizer_id', options.filterByOrganizer);
  }
  
  if (options?.filterByDate) {
    if (options.filterByDate.start) {
      query = query.gte('start_date', options.filterByDate.start);
    }
    
    if (options.filterByDate.end) {
      query = query.lte('end_date', options.filterByDate.end);
    }
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
  
  // Map each event to our format and fetch related data
  return Promise.all((data || []).map(mapDbEventToEvent));
};

const createEventOperation = async (eventInput: Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'ticketTiers'>): Promise<Event> => {
  const { location, ...eventFields } = eventInput;
  
  // Insert the event
  const { data: newEventData, error: eventError } = await supabase
    .from('events')
    .insert({
      title: eventFields.title,
      description: eventFields.description,
      start_date: eventFields.startDate,
      end_date: eventFields.endDate,
      organizer_id: eventFields.organizerId,
      organizer_name: eventFields.organizerName,
      featured_image: eventFields.featuredImage,
      status: eventFields.status,
      is_public: eventFields.isPublic,
      capacity: eventFields.capacity,
    })
    .select()
    .single();
    
  if (eventError) {
    console.error('Error creating event:', eventError);
    throw eventError;
  }
  
  // Insert the location
  const { error: locationError } = await supabase
    .from('event_locations')
    .insert({
      event_id: newEventData.id,
      address: location.address,
      city: location.city,
      state: location.state,
      country: location.country,
      postal_code: location.postalCode,
      latitude: location.latitude,
      longitude: location.longitude,
    });
    
  if (locationError) {
    console.error('Error creating event location:', locationError);
    throw locationError;
  }
  
  // Return the full event object
  return mapDbEventToEvent(newEventData);
};

const updateEventOperation = async (id: string, updates: Partial<Event>): Promise<Event> => {
  const updateData: any = {};
  const { location, ticketTiers, ...eventFields } = updates;
  
  // Map our frontend schema to database schema
  if (eventFields.title !== undefined) updateData.title = eventFields.title;
  if (eventFields.description !== undefined) updateData.description = eventFields.description;
  if (eventFields.startDate !== undefined) updateData.start_date = eventFields.startDate;
  if (eventFields.endDate !== undefined) updateData.end_date = eventFields.endDate;
  if (eventFields.organizerName !== undefined) updateData.organizer_name = eventFields.organizerName;
  if (eventFields.featuredImage !== undefined) updateData.featured_image = eventFields.featuredImage;
  if (eventFields.status !== undefined) updateData.status = eventFields.status;
  if (eventFields.isPublic !== undefined) updateData.is_public = eventFields.isPublic;
  if (eventFields.capacity !== undefined) updateData.capacity = eventFields.capacity;
  
  // Update the event
  if (Object.keys(updateData).length > 0) {
    const { error: eventError } = await supabase
      .from('events')
      .update(updateData)
      .eq('id', id);
      
    if (eventError) {
      console.error('Error updating event:', eventError);
      throw eventError;
    }
  }
  
  // Update location if provided
  if (location) {
    const locationData: any = {};
    
    if (location.address !== undefined) locationData.address = location.address;
    if (location.city !== undefined) locationData.city = location.city;
    if (location.state !== undefined) locationData.state = location.state;
    if (location.country !== undefined) locationData.country = location.country;
    if (location.postalCode !== undefined) locationData.postal_code = location.postalCode;
    if (location.latitude !== undefined) locationData.latitude = location.latitude;
    if (location.longitude !== undefined) locationData.longitude = location.longitude;
    
    if (Object.keys(locationData).length > 0) {
      const { error: locationError } = await supabase
        .from('event_locations')
        .update(locationData)
        .eq('event_id', id);
        
      if (locationError) {
        console.error('Error updating event location:', locationError);
        throw locationError;
      }
    }
  }
  
  // Fetch the updated event
  const { data: eventData, error: fetchError } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();
    
  if (fetchError) {
    console.error('Error fetching updated event:', fetchError);
    throw fetchError;
  }
  
  return mapDbEventToEvent(eventData);
};

const deleteEventOperation = async (id: string): Promise<void> => {
  // Delete the event (cascade will handle related records)
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};

const updateEventStatus = async (id: string, status: EventStatus): Promise<Event> => {
  // Update the event status
  const { data, error } = await supabase
    .from('events')
    .update({ status })
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    console.error(`Error updating event status to ${status}:`, error);
    throw error;
  }
  
  return mapDbEventToEvent(data);
};

export function useEvents(options?: UseEventsOptions): UseEventsResult {
  const queryClient = useQueryClient();
  const [error, setError] = useState<Error | null>(null);
  
  // Fetch events with the provided options
  const { data: events = [], isLoading, refetch } = useQuery({
    queryKey: ['events', options],
    queryFn: () => fetchEvents(options),
    meta: {
      onError: (error: Error) => {
        console.error('Failed to fetch events:', error);
        setError(error);
        toast.error('Failed to load events.');
      }
    }
  });
  
  // Create event
  const createEvent = useMutation({
    mutationFn: createEventOperation,
    onSuccess: () => {
      toast.success('Event created successfully');
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (error: any) => {
      console.error('Failed to create event:', error);
      setError(error);
      toast.error('Failed to create event. Please try again.');
    }
  });
  
  // Update event
  const updateEvent = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Event> }) => 
      updateEventOperation(id, updates),
    onSuccess: () => {
      toast.success('Event updated successfully');
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (error: any) => {
      console.error('Failed to update event:', error);
      setError(error);
      toast.error('Failed to update event. Please try again.');
    }
  });
  
  // Delete event
  const deleteEvent = useMutation({
    mutationFn: deleteEventOperation,
    onSuccess: () => {
      toast.success('Event deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (error: any) => {
      console.error('Failed to delete event:', error);
      setError(error);
      toast.error('Failed to delete event. Please try again.');
    }
  });
  
  // Publish event
  const publishEvent = useMutation({
    mutationFn: (id: string) => updateEventStatus(id, 'published'),
    onSuccess: () => {
      toast.success('Event published successfully');
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (error: any) => {
      console.error('Failed to publish event:', error);
      setError(error);
      toast.error('Failed to publish event. Please try again.');
    }
  });
  
  // Cancel event
  const cancelEvent = useMutation({
    mutationFn: (id: string) => updateEventStatus(id, 'canceled'),
    onSuccess: () => {
      toast.success('Event canceled successfully');
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (error: any) => {
      console.error('Failed to cancel event:', error);
      setError(error);
      toast.error('Failed to cancel event. Please try again.');
    }
  });
  
  return {
    events,
    isLoading,
    error,
    refetch,
    createEvent: createEvent.mutateAsync,
    updateEvent: (id: string, updates: Partial<Event>) => 
      updateEvent.mutateAsync({ id, updates }),
    deleteEvent: deleteEvent.mutateAsync,
    publishEvent: publishEvent.mutateAsync,
    cancelEvent: cancelEvent.mutateAsync
  };
}
