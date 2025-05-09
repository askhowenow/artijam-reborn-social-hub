
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

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

    // Get request body
    const { amount, currency = 'USD', paymentDetails } = await req.json()

    if (!amount || amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid amount' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get FAC payment gateway settings
    const { data: gatewaySettings, error: settingsError } = await supabaseClient
      .from('payment_gateway_settings')
      .select('*')
      .eq('gateway_name', 'first_atlantic')
      .eq('is_active', true)
      .single()

    if (settingsError || !gatewaySettings) {
      console.error('Payment gateway not configured:', settingsError)
      return new Response(
        JSON.stringify({ error: 'Payment gateway not properly configured' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate a unique reference ID
    const referenceId = `TOP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // In a real implementation, this would call the First Atlantic API
    // For now, we'll simulate a successful payment
    const isTestMode = gatewaySettings.is_test_mode;
    const paymentResponse = {
      success: true,
      reference: referenceId,
      gatewayReference: `FAC-${Date.now()}`,
      message: isTestMode ? 'Test payment processed' : 'Payment processed successfully'
    };

    // Begin a transaction
    const { data, error } = await supabaseClient.rpc('top_up_balance', {
      p_user_id: session.user.id,
      p_amount: amount,
      p_currency: currency,
      p_reference: referenceId,
      p_gateway: 'first_atlantic',
      p_gateway_reference: paymentResponse.gatewayReference,
      p_metadata: JSON.stringify(paymentDetails)
    });

    if (error) {
      console.error('Error processing top-up:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to process top-up' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Balance updated successfully',
        transactionReference: referenceId,
        isTestTransaction: isTestMode
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
