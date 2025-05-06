
import { supabase } from "@/integrations/supabase/client";
import type { Event, EventStatus, TicketType } from "@/types/event";

// Helper function to convert database response to our Event type
export const mapDbEventToEvent = async (dbEvent: any): Promise<Event> => {
  // Fetch location for the event
  const { data: locationData, error: locationError } = await supabase
    .from('event_locations')
    .select('*')
    .eq('event_id', dbEvent.id)
    .single();
    
  if (locationError && locationError.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
    console.error('Error fetching location:', locationError);
  }
  
  // Fetch ticket tiers for the event
  const { data: ticketTiers, error: tierError } = await supabase
    .from('ticket_tiers')
    .select('*')
    .eq('event_id', dbEvent.id);
    
  if (tierError) {
    console.error('Error fetching ticket tiers:', tierError);
  }
  
  // Map database schema to our frontend schema
  return {
    id: dbEvent.id,
    title: dbEvent.title,
    description: dbEvent.description || '',
    startDate: dbEvent.start_date,
    endDate: dbEvent.end_date,
    location: locationData ? {
      address: locationData.address,
      city: locationData.city,
      state: locationData.state,
      country: locationData.country,
      postalCode: locationData.postal_code,
      latitude: locationData.latitude,
      longitude: locationData.longitude,
    } : {
      address: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
    },
    organizerId: dbEvent.organizer_id,
    organizerName: dbEvent.organizer_name || '',
    featuredImage: dbEvent.featured_image,
    ticketTiers: (ticketTiers || []).map(tier => ({
      id: tier.id,
      name: tier.name,
      description: tier.description || '',
      price: tier.price,
      currency: tier.currency,
      quantity: tier.quantity,
      quantityAvailable: tier.quantity_available,
      type: tier.type as any,
      salesStartDate: tier.sales_start_date,
      salesEndDate: tier.sales_end_date,
    })),
    status: dbEvent.status as EventStatus,
    createdAt: dbEvent.created_at,
    updatedAt: dbEvent.updated_at,
    isPublic: dbEvent.is_public,
    capacity: dbEvent.capacity,
  };
};

// Track QR code scan for a product or store
export const trackQRCodeScan = async (productId?: string, storeId?: string) => {
  try {
    if (productId) {
      // Increment product scan metric
      await supabase.rpc('increment_product_metric', {
        product_id_param: productId,
        metric_name: 'views',
        increment_value: 1
      });
      
      console.log(`Tracked QR scan for product: ${productId}`);
    }
    
    if (storeId) {
      // We could implement store-level metrics in the future
      console.log(`Tracked QR scan for store: ${storeId}`);
    }
    
    return true;
  } catch (error) {
    console.error('Failed to track QR code scan:', error);
    return false;
  }
};
