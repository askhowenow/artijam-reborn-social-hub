
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

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), 
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  try {
    // Create Supabase admin client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Parse the webhook payload
    const payload = await req.json();
    console.log('Received First Atlantic webhook:', payload);
    
    // Validate the webhook signature
    // In a real implementation, we would verify that the webhook came from First Atlantic
    // Using a signature or shared secret
    
    const { transactionId, status, userId, amount, currency, reference } = payload;
    
    if (!transactionId || !status || !userId || !amount) {
      return new Response(JSON.stringify({ error: 'Invalid webhook payload' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    
    // Process the webhook based on status
    if (status === 'success') {
      // Call database function to update balance
      const { data, error } = await supabaseAdmin.rpc('top_up_balance', {
        p_user_id: userId,
        p_amount: amount,
        p_currency: currency || 'USD',
        p_reference: reference || transactionId,
        p_gateway: 'first_atlantic',
        p_gateway_reference: transactionId,
        p_metadata: payload
      });
      
      if (error) {
        console.error('Error processing successful payment:', error);
        return new Response(JSON.stringify({ error: 'Failed to process payment' }), 
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      
      return new Response(JSON.stringify({ success: true, message: 'Payment processed successfully' }), 
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    } 
    else if (status === 'failed') {
      // Record the failed transaction
      const { error } = await supabaseAdmin
        .from('transactions')
        .insert({
          user_id: userId,
          amount: amount,
          currency: currency || 'USD',
          type: 'top_up',
          status: 'failed',
          reference_id: reference || transactionId,
          gateway: 'first_atlantic',
          gateway_reference: transactionId,
          metadata: payload,
          description: 'Failed payment attempt'
        });
        
      if (error) {
        console.error('Error recording failed payment:', error);
        return new Response(JSON.stringify({ error: 'Failed to record failed payment' }), 
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      
      return new Response(JSON.stringify({ success: true, message: 'Failed payment recorded' }), 
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    
    // Unknown status
    return new Response(JSON.stringify({ error: 'Unknown payment status' }), 
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Unexpected error:', error);
    
    return new Response(JSON.stringify({ error: 'An unexpected error occurred' }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
})
