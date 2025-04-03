
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailGenerationRequest {
  company_name: string;
  company_description: string;
  campaign_description: string;
  company_rep_name: string;
  company_rep_role: string;
  company_rep_email: string;
  prospect_company_name: string;
  prospect_rep_name: string;
  prospect_rep_email: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: EmailGenerationRequest = await req.json();

    // Validate required fields
    const requiredFields = [
      'company_name', 'company_description', 'campaign_description',
      'company_rep_name', 'company_rep_role', 'company_rep_email',
      'prospect_company_name', 'prospect_rep_name', 'prospect_rep_email'
    ];

    for (const field of requiredFields) {
      if (!requestData[field as keyof EmailGenerationRequest]) {
        return new Response(
          JSON.stringify({ error: `Missing required field: ${field}` }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    // Forward the request to the external AI email generation service
    const response = await fetch("https://c12e-103-105-227-34.ngrok-free.app/generate_email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return new Response(
        JSON.stringify({ error: `Error generating email: ${errorData.error || response.statusText}` }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const emailData = await response.json();
    
    return new Response(
      JSON.stringify(emailData),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error("Error in generate-email function:", error);
    return new Response(
      JSON.stringify({ error: `Internal server error: ${error.message}` }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
