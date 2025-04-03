
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
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: EmailSendRequest = await req.json();

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

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error: Missing Supabase credentials' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Retrieve user's Mailjet API keys from the database
    const { data: apiKeysData, error: apiKeysError } = await supabase
      .from('user_api_keys')
      .select('mailjet_api_key, mailjet_secret_key')
      .eq('user_id', requestData.user_id)
      .single();

    if (apiKeysError || !apiKeysData) {
      return new Response(
        JSON.stringify({ 
          error: `Error retrieving Mailjet API keys: ${apiKeysError?.message || 'API keys not found'}` 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { mailjet_api_key, mailjet_secret_key } = apiKeysData;
    
    if (!mailjet_api_key || !mailjet_secret_key) {
      return new Response(
        JSON.stringify({ error: 'Mailjet API keys not configured for this user' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Prepare the email request for the external service
    const emailRequest = {
      from_email: requestData.from_email,
      from_name: requestData.from_name,
      to_email: requestData.to_email,
      to_name: requestData.to_name,
      subject: requestData.subject,
      body: requestData.body,
      mailjet_api_key: mailjet_api_key,
      mailjet_api_secret: mailjet_secret_key
    };

    // Forward the request to the external email sending service
    const response = await fetch("https://c12e-103-105-227-34.ngrok-free.app/send_email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailRequest),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return new Response(
        JSON.stringify({ error: `Error sending email: ${errorData.error || response.statusText}` }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const result = await response.json();
    
    return new Response(
      JSON.stringify(result),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
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
