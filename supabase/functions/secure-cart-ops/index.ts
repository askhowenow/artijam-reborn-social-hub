
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.23.0';

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create a Supabase client with the project URL and anon key
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? 'https://gqceeliuclgzjzmubywy.supabase.co',
  Deno.env.get('SUPABASE_ANON_KEY') ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxY2VlbGl1Y2xnemp6bXVieXd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0MDY4NDgsImV4cCI6MjA2MTk4Mjg0OH0.-ItatSGo0cojPhLHeWP8dOr72-eca-RsSf0T5Q7Kfa0'
);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create a Supabase client with the user's JWT
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? 'https://gqceeliuclgzjzmubywy.supabase.co',
      Deno.env.get('SUPABASE_ANON_KEY') ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxY2VlbGl1Y2xnemp6bXVieXd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0MDY4NDgsImV4cCI6MjA2MTk4Mjg0OH0.-ItatSGo0cojPhLHeWP8dOr72-eca-RsSf0T5Q7Kfa0',
      { 
        global: { 
          headers: { 
            Authorization: authHeader 
          } 
        } 
      }
    );

    // Parse the request body
    const { action, data } = await req.json();

    // Validate input based on action
    if (!action || !data) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle different cart operations securely
    let result;
    if (action === 'sync_guest_cart') {
      // Sync guest cart to user cart
      const { guestId } = data;

      // Input validation
      if (!guestId) {
        return new Response(
          JSON.stringify({ error: 'Missing guest ID' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get the authenticated user
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        return new Response(
          JSON.stringify({ error: 'Authentication error', details: authError }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Call the secure database function for syncing
      const { data: syncResult, error: syncError } = await supabase.rpc(
        'sync_guest_cart_to_user',
        { 
          guest_id: guestId,
          user_id: authData.user.id
        }
      );

      if (syncError) {
        console.error('Error syncing cart:', syncError);
        return new Response(
          JSON.stringify({ error: 'Failed to sync cart', details: syncError }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      result = { success: true, message: 'Cart synced successfully' };
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid action' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return the result
    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in secure-cart-ops function:', error);
    
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
