
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
    const url = new URL(req.url)
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const offset = parseInt(url.searchParams.get('offset') || '0')
    const type = url.searchParams.get('type') || undefined
    
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

    // Build query
    let query = supabaseClient
      .from('transactions')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
      
    // Add type filter if provided
    if (type) {
      query = query.eq('type', type)
    }

    // Execute query  
    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching transactions:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch transactions' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get total count for pagination
    const { count: totalCount } = await supabaseClient
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', session.user.id)
      .eq(type ? 'type' : 'user_id', type || session.user.id)

    // Return the transactions
    return new Response(
      JSON.stringify({ 
        transactions: data,
        pagination: {
          total: totalCount,
          limit,
          offset
        }
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
