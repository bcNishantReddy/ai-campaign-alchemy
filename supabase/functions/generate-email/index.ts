
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
  user_id?: string;
  prospect_id?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: EmailGenerationRequest = await req.json();
    
    console.log("Received request data:", JSON.stringify(requestData, null, 2));

    // Ensure all fields have at least a string value, even if empty
    const requiredFields = [
      'company_name', 'company_description', 'campaign_description',
      'company_rep_name', 'company_rep_role', 'company_rep_email',
      'prospect_company_name', 'prospect_rep_name', 'prospect_rep_email'
    ];

    // Fill empty fields with defaults to prevent validation errors
    const processedData = { ...requestData };
    for (const field of requiredFields) {
      if (!processedData[field as keyof EmailGenerationRequest]) {
        processedData[field as keyof EmailGenerationRequest] = 
          field.includes('description') ? 'No description provided.' : '';
        console.log(`Set default for empty field: ${field}`);
      }
    }

    console.log("Sending request to the AI service for email generation");

    try {
      // Send request to AI service
      const response = await fetch("https://c12e-103-105-227-34.ngrok-free.app/generate_email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company_name: processedData.company_name,
          company_description: processedData.company_description,
          campaign_description: processedData.campaign_description,
          company_rep_name: processedData.company_rep_name,
          company_rep_role: processedData.company_rep_role,
          company_rep_email: processedData.company_rep_email,
          prospect_company_name: processedData.prospect_company_name,
          prospect_rep_name: processedData.prospect_rep_name,
          prospect_rep_email: processedData.prospect_rep_email
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response from AI service:", errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          return new Response(
            JSON.stringify({ error: `Error generating email: ${errorData.error || response.statusText}` }),
            { 
              status: response.status, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        } catch (e) {
          // If parsing fails, return the raw text
          return new Response(
            JSON.stringify({ error: `Error generating email: ${errorText || response.statusText}` }),
            { 
              status: response.status, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
      }

      const emailData = await response.json();
      console.log("Successfully generated email:", emailData);
      
      // If prospect_id is provided, store the email in the database
      if (requestData.prospect_id) {
        try {
          // Create Supabase client
          const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
          const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
          const supabase = createClient(supabaseUrl, supabaseKey);
          
          console.log(`Storing email for prospect ID: ${requestData.prospect_id}`);
          
          // Store the email in the database
          const { data: emailRecord, error: insertError } = await supabase
            .from('emails')
            .insert({
              prospect_id: requestData.prospect_id,
              subject: emailData.subject,
              body: emailData.body,
              status: 'draft'
            })
            .select()
            .single();
            
          if (insertError) {
            console.error("Error storing email in database:", insertError);
            // Continue execution even if storage fails
          } else {
            console.log("Email stored successfully:", emailRecord);
            // Add the email record to the response
            emailData.email_record = emailRecord;
          }
        } catch (dbError) {
          console.error("Database operation error:", dbError);
          // Continue execution even if database operation fails
        }
      }
      
      return new Response(
        JSON.stringify(emailData),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } catch (fetchError) {
      console.error("Error fetching from AI service:", fetchError);
      return new Response(
        JSON.stringify({ error: `Error connecting to AI service: ${fetchError.message}` }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
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
