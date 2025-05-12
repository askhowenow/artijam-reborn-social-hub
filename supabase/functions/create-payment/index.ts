
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// Note: In a production environment, these would be stored as secure environment variables
const FAC_BASE_URL = "https://ecm.firstatlanticcommerce.com/PGServiceXML";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the session of the logged-in user
    const { data: { session } } = await supabaseClient.auth.getSession()
    
    if (!session) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get the payment request details from the request body
    const { amount, currency = 'USD', description = 'Add funds to balance', gateway = 'first_atlantic' } = await req.json()

    if (!amount || amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid amount' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create a service client with admin privileges
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    )

    // Get the gateway settings
    const { data: gatewaySettings, error: settingsError } = await serviceClient
      .from('payment_gateway_settings')
      .select('*')
      .eq('gateway_name', gateway)
      .eq('is_active', true)
      .single();
    
    if (settingsError || !gatewaySettings) {
      return new Response(
        JSON.stringify({ error: 'Payment gateway not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate a unique reference number for the transaction
    const referenceNumber = `AJ-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Create a pending transaction record
    const { data: transaction, error: transactionError } = await serviceClient
      .from('transactions')
      .insert({
        user_id: session.user.id,
        amount,
        currency,
        type: 'deposit',
        status: 'pending',
        reference_id: referenceNumber,
        gateway,
        description,
      })
      .select()
      .single();
    
    if (transactionError) {
      return new Response(
        JSON.stringify({ error: 'Failed to create transaction record' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // In a real implementation, we would now create a payment session with FAC
    // This is a simplified example that would need to be expanded with actual FAC API integration
    
    // For demonstration purposes, we're just returning a mock redirect URL
    // In a production environment, this would be the URL returned from the FAC integration
    const returnUrl = new URL(req.headers.get('origin') || '');
    returnUrl.pathname = '/balance';
    returnUrl.searchParams.append('status', 'success');
    returnUrl.searchParams.append('reference', referenceNumber);

    // Simulate a redirect to FAC payment page
    // In a real implementation, this would be generated from the FAC API response
    const mockFacRedirectUrl = `${FAC_BASE_URL}/mockpayment?amount=${amount}&currency=${currency}&reference=${referenceNumber}&return=${returnUrl.toString()}`;

    return new Response(
      JSON.stringify({ 
        redirectUrl: mockFacRedirectUrl,
        reference: referenceNumber,
        transactionId: transaction.id
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
