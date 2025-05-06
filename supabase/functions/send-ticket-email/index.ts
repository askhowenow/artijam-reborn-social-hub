
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

interface SendTicketEmailRequest {
  ticketId: string;
  eventName: string;
  attendeeName: string;
  attendeeEmail: string;
  qrCodeUrl?: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { ticketId, eventName, attendeeName, attendeeEmail, qrCodeUrl } = await req.json() as SendTicketEmailRequest;
    
    // Validate required fields
    if (!ticketId || !eventName || !attendeeEmail) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // In a real implementation, this would send an actual email
    // For now, we'll just log it and return success
    console.log(`Email would be sent to ${attendeeEmail} for ticket ${ticketId} to event "${eventName}"`);
    
    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Email sent to ${attendeeEmail} for event "${eventName}"`,
        ticketId,
        attendeeName,
        attendeeEmail
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error('Error sending ticket email:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Error sending email" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
