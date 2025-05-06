
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { tierId } = await req.json();
    
    // Create a Supabase client with the project URL and service key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Check if the tier exists and has available tickets
    const { data: tier, error: tierError } = await supabase
      .from('ticket_tiers')
      .select('quantity_available')
      .eq('id', tierId)
      .single();
      
    if (tierError) {
      return new Response(
        JSON.stringify({ error: 'Failed to find ticket tier' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (tier.quantity_available <= 0) {
      return new Response(
        JSON.stringify({ error: 'No tickets available' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Decrement the quantity_available
    const { error: updateError } = await supabase
      .from('ticket_tiers')
      .update({ quantity_available: tier.quantity_available - 1 })
      .eq('id', tierId);
      
    if (updateError) {
      return new Response(
        JSON.stringify({ error: 'Failed to update ticket tier' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
