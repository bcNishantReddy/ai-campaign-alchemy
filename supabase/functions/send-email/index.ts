
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailSendRequest {
  from_email: string;
  from_name: string;
  to_email: string;
  to_name: string;
  subject: string;
  body: string;
  user_id: string;
  email_id?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: EmailSendRequest = await req.json();
    console.log("Received email send request:", {
      ...requestData,
      body: requestData.body.length > 100 ? requestData.body.substring(0, 100) + '...' : requestData.body
    });

    // Validate required fields
    const requiredFields = [
      'from_email', 'from_name', 'to_email', 'to_name', 'subject', 'body', 'user_id'
    ];

    for (const field of requiredFields) {
      if (!requestData[field as keyof EmailSendRequest]) {
        return new Response(
          JSON.stringify({ error: `Missing required field: ${field}` }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    // Create a Supabase client to fetch the user's Mailjet API keys
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    const supabase = createClient(supabaseUrl, supabaseServiceRole);
    
    // Get the user's Mailjet API keys from the database
    const { data: apiKeysData, error: apiKeysError } = await supabase
      .from('user_api_keys')
      .select('mailjet_api_key, mailjet_secret_key')
      .eq('user_id', requestData.user_id)
      .maybeSingle();
      
    if (apiKeysError) {
      console.error("Error fetching API keys:", apiKeysError);
      return new Response(
        JSON.stringify({ error: `Error fetching API keys: ${apiKeysError.message}` }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    if (!apiKeysData || !apiKeysData.mailjet_api_key || !apiKeysData.mailjet_secret_key) {
      return new Response(
        JSON.stringify({ error: "Mailjet API keys not configured for this user" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Prepare the data for the external API call - preserve HTML content in body
    const externalApiData = {
      from_email: requestData.from_email,
      from_name: requestData.from_name,
      to_email: requestData.to_email,
      to_name: requestData.to_name,
      subject: requestData.subject,
      body: requestData.body, // Keep HTML tags intact
      mailjet_api_key: apiKeysData.mailjet_api_key,
      mailjet_api_secret: apiKeysData.mailjet_secret_key
    };

    console.log("Sending request to the email service:", {
      ...externalApiData,
      mailjet_api_key: "[REDACTED]",
      mailjet_api_secret: "[REDACTED]",
      body: externalApiData.body.length > 100 ? externalApiData.body.substring(0, 100) + '...' : externalApiData.body
    });

    try {
      // Forward the request to the external email sending service
      const response = await fetch("https://c12e-103-105-227-34.ngrok-free.app/send_email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(externalApiData),
      });

      if (!response.ok) {
        let errorMessage = response.statusText;
        try {
          const errorText = await response.text();
          console.error("Error response from email service:", errorText);
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.error || errorMessage;
          } catch {
            errorMessage = errorText || errorMessage;
          }
        } catch (parseError) {
          console.error("Failed to parse error response:", parseError);
        }
        
        return new Response(
          JSON.stringify({ error: `Error sending email: ${errorMessage}` }),
          { 
            status: response.status, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      const emailResult = await response.json();
      console.log("Email sent successfully:", emailResult);
      
      // Update the email status in the database if an email_id was provided
      if (requestData.email_id) {
        const { error: updateError } = await supabase
          .from('emails')
          .update({ status: 'sent', updated_at: new Date().toISOString() })
          .eq('id', requestData.email_id);
          
        if (updateError) {
          console.error("Error updating email status:", updateError);
          // We don't want to fail the response if this update fails
        } else {
          console.log(`Successfully updated email status to 'sent' for email ID: ${requestData.email_id}`);
        }
      } else {
        console.warn("No email_id provided, skipping database update");
      }
      
      return new Response(
        JSON.stringify({ 
          message: "Email sent successfully!",
          email_result: emailResult 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } catch (fetchError) {
      console.error("Fetch error:", fetchError);
      return new Response(
        JSON.stringify({ error: `Fetch error: ${fetchError.message}` }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
  } catch (error) {
    console.error("Error in send-email function:", error);
    return new Response(
      JSON.stringify({ error: `Internal server error: ${error.message}` }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        
      }
    );
  }
});
