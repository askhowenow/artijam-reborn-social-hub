
import React from "react";
import { useParams, Navigate } from "react-router-dom";
import EventDetail from "@/components/events/EventDetail";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { mapDbEventToEvent } from "@/utils/event-mappers";

const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  // Fetch the specific event by ID
  const { data: event, isLoading, error } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      if (!id) throw new Error("Event ID is required");
      
      // Fetch the event
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();
        
      if (eventError) {
        throw eventError;
      }
      
      if (!eventData) {
        throw new Error("Event not found");
      }
      
      return mapDbEventToEvent(eventData);
    },
    enabled: !!id
  });
  
  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  // Handle error state
  if (error) {
    return (
      <div className="container mx-auto py-10 text-center">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Error Loading Event</h2>
        <p className="mb-6">{(error as Error).message}</p>
        <button
          onClick={() => window.history.back()}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Go Back
        </button>
      </div>
    );
  }
  
  // Handle not found
  if (!event && !isLoading) {
    return <Navigate to="/events" replace />;
  }
  
  return <EventDetail event={event} />;
};

export default EventDetailPage;
