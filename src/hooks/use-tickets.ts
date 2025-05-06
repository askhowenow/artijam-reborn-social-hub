
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Ticket, UseTicketsOptions, UseTicketsResult } from '@/types/event';

// Helper function to map database ticket to our model
const mapDbTicketToTicket = (dbTicket: any): Ticket => {
  return {
    id: dbTicket.id,
    eventId: dbTicket.event_id,
    tierId: dbTicket.tier_id,
    userId: dbTicket.user_id,
    purchaseDate: dbTicket.purchase_date,
    price: dbTicket.price,
    currency: dbTicket.currency,
    status: dbTicket.status,
    qrCode: dbTicket.qr_code,
    attendeeName: dbTicket.attendee_name,
    attendeeEmail: dbTicket.attendee_email,
  };
};

// Helper functions for tickets
const fetchTickets = async (options?: UseTicketsOptions): Promise<Ticket[]> => {
  let query = supabase.from('tickets').select('*');
  
  // Apply filters based on options
  if (options?.eventId) {
    query = query.eq('event_id', options.eventId);
  }
  
  if (options?.userId) {
    query = query.eq('user_id', options.userId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching tickets:', error);
    throw error;
  }
  
  return (data || []).map(mapDbTicketToTicket);
};

const purchaseTicketOperation = async (ticketData: Omit<Ticket, 'id' | 'purchaseDate' | 'status' | 'qrCode'>): Promise<Ticket> => {
  // Insert the ticket
  const { data, error } = await supabase
    .from('tickets')
    .insert({
      event_id: ticketData.eventId,
      tier_id: ticketData.tierId,
      user_id: ticketData.userId,
      price: ticketData.price,
      currency: ticketData.currency,
      attendee_name: ticketData.attendeeName,
      attendee_email: ticketData.attendeeEmail,
    })
    .select()
    .single();
    
  if (error) {
    console.error('Error purchasing ticket:', error);
    throw error;
  }
  
  // Also update the ticket tier quantity available
  const { error: tierError } = await supabase.rpc('decrement_tier_quantity', {
    tier_id: ticketData.tierId,
  });
  
  if (tierError) {
    console.error('Error updating ticket tier quantity:', tierError);
    // Don't throw here, the ticket was created successfully
  }
  
  return mapDbTicketToTicket(data);
};

const cancelTicketOperation = async (id: string): Promise<void> => {
  // Update ticket status to canceled
  const { error } = await supabase
    .from('tickets')
    .update({ status: 'canceled' })
    .eq('id', id);
    
  if (error) {
    console.error('Error canceling ticket:', error);
    throw error;
  }
};

const validateTicketOperation = async (id: string): Promise<boolean> => {
  // Get the ticket
  const { data, error } = await supabase
    .from('tickets')
    .select('status')
    .eq('id', id)
    .single();
    
  if (error) {
    console.error('Error validating ticket:', error);
    return false;
  }
  
  if (data.status !== 'valid') {
    return false;
  }
  
  // Mark ticket as used
  const { error: updateError } = await supabase
    .from('tickets')
    .update({ status: 'used' })
    .eq('id', id);
    
  if (updateError) {
    console.error('Error updating ticket status:', updateError);
    return false;
  }
  
  return true;
};

const generateQrCodeOperation = async (id: string): Promise<string> => {
  // Generate a QR code (this would be a more sophisticated implementation in a real app)
  const qrCode = `https://event-app.com/verify/${id}`;
  
  // Update the ticket with the QR code
  const { error } = await supabase
    .from('tickets')
    .update({ qr_code: qrCode })
    .eq('id', id);
    
  if (error) {
    console.error('Error updating ticket with QR code:', error);
    throw error;
  }
  
  return qrCode;
};

const sendTicketByEmailOperation = async (id: string, email: string): Promise<void> => {
  // First fetch the ticket details
  const { data: ticket, error: ticketError } = await supabase
    .from('tickets')
    .select(`
      *,
      events(title),
      ticket_tiers(name)
    `)
    .eq('id', id)
    .single();
    
  if (ticketError) {
    console.error('Error fetching ticket for email:', ticketError);
    throw ticketError;
  }
  
  // Generate QR code if not already present
  let qrCode = ticket.qr_code;
  
  if (!qrCode) {
    qrCode = await generateQrCodeOperation(id);
  }
  
  // Call the send-ticket-email function
  const { error } = await supabase.functions.invoke('send-ticket-email', {
    body: {
      ticketId: id,
      eventName: ticket.events.title,
      attendeeName: ticket.attendee_name || email,
      attendeeEmail: email,
      qrCodeUrl: qrCode,
    },
  });
  
  if (error) {
    console.error('Error sending ticket email:', error);
    throw error;
  }
};

export function useTickets(options?: UseTicketsOptions): UseTicketsResult {
  const queryClient = useQueryClient();
  const [error, setError] = useState<Error | null>(null);
  
  // Fetch tickets with the provided options
  const { data: tickets = [], isLoading, refetch } = useQuery({
    queryKey: ['tickets', options],
    queryFn: () => fetchTickets(options),
    meta: {
      onError: (error: Error) => {
        console.error('Failed to fetch tickets:', error);
        setError(error);
        toast.error('Failed to load tickets.');
      }
    }
  });
  
  // Purchase ticket
  const purchaseTicket = useMutation({
    mutationFn: purchaseTicketOperation,
    onSuccess: () => {
      toast.success('Ticket purchased successfully');
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
    onError: (error: any) => {
      console.error('Failed to purchase ticket:', error);
      setError(error);
      toast.error('Failed to purchase ticket. Please try again.');
    }
  });
  
  // Cancel ticket
  const cancelTicket = useMutation({
    mutationFn: cancelTicketOperation,
    onSuccess: () => {
      toast.success('Ticket canceled successfully');
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
    onError: (error: any) => {
      console.error('Failed to cancel ticket:', error);
      setError(error);
      toast.error('Failed to cancel ticket. Please try again.');
    }
  });
  
  // Validate ticket
  const validateTicket = useMutation({
    mutationFn: validateTicketOperation,
    onSuccess: (isValid) => {
      if (isValid) {
        toast.success('Ticket validated successfully');
      } else {
        toast.error('Invalid ticket');
      }
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
    onError: (error: any) => {
      console.error('Failed to validate ticket:', error);
      setError(error);
      toast.error('Failed to validate ticket. Please try again.');
    }
  });
  
  // Generate QR code
  const generateQrCode = useMutation({
    mutationFn: generateQrCodeOperation,
    onSuccess: () => {
      toast.success('QR code generated successfully');
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
    onError: (error: any) => {
      console.error('Failed to generate QR code:', error);
      setError(error);
      toast.error('Failed to generate QR code. Please try again.');
    }
  });
  
  // Send ticket by email
  const sendTicketByEmail = useMutation({
    mutationFn: ({ id, email }: { id: string; email: string }) => 
      sendTicketByEmailOperation(id, email),
    onSuccess: () => {
      toast.success('Ticket sent by email successfully');
    },
    onError: (error: any) => {
      console.error('Failed to send ticket by email:', error);
      setError(error);
      toast.error('Failed to send ticket by email. Please try again.');
    }
  });
  
  return {
    tickets,
    isLoading,
    error,
    refetch,
    purchaseTicket: purchaseTicket.mutateAsync,
    cancelTicket: cancelTicket.mutateAsync,
    validateTicket: validateTicket.mutateAsync,
    generateQrCode: generateQrCode.mutateAsync,
    sendTicketByEmail: (id: string, email: string) => 
      sendTicketByEmail.mutateAsync({ id, email })
  };
}
