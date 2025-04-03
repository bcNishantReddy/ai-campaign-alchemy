
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

    // Generate a mock email with HTML formatting - this simulates what would come from an AI service
    const mockEmail = {
      sender_email: processedData.company_rep_email,
      sender_name: processedData.company_rep_name,
      prospect_name: processedData.prospect_rep_name,
      prospect_email: processedData.prospect_rep_email,
      prospect_company_name: processedData.prospect_company_name,
      subject: `Partnership opportunity with ${processedData.company_name}`,
      body: `<p>Dear ${processedData.prospect_rep_name},</p>
<p>I hope this email finds you well. My name is ${processedData.company_rep_name}, ${processedData.company_rep_role} at ${processedData.company_name}.</p>
<p>${processedData.company_description}</p>
<p>I'm reaching out to discuss ${processedData.campaign_description}.</p>
<p>I believe there might be some great synergies between our companies. Would you be available for a 15-minute call this week to explore potential collaboration?</p>
<p>Best regards,<br>${processedData.company_rep_name}<br>${processedData.company_rep_role}<br>${processedData.company_name}</p>`
    };

    // If prospect_id is provided, store the email in the database
    if (requestData.prospect_id) {
      try {
        // Create Supabase client
        const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        console.log(`Storing email for prospect ID: ${requestData.prospect_id}`);
        
        // Store the email in the database - ensure we're storing the HTML content as is
        const { data: emailRecord, error: insertError } = await supabase
          .from('emails')
          .insert({
            prospect_id: requestData.prospect_id,
            subject: mockEmail.subject,
            body: mockEmail.body,
            status: 'draft'
          })
          .select()
          .single();
          
        if (insertError) {
          console.error("Error storing email in database:", insertError);
          return new Response(
            JSON.stringify({ error: `Error storing email: ${insertError.message}` }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        } else {
          console.log("Email stored successfully:", emailRecord);
          // Add the email record to the response
          mockEmail.email_record = emailRecord;
        }
      } catch (dbError) {
        console.error("Database operation error:", dbError);
        return new Response(
          JSON.stringify({ error: `Database error: ${dbError.message}` }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }
    
    return new Response(
      JSON.stringify(mockEmail),
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
