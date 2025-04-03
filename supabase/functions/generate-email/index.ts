
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
  prospect_rep_role: string; // Added new field
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
      'prospect_company_name', 'prospect_rep_name', 'prospect_rep_email', 'prospect_rep_role'
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

    console.log("Sending request to the external API service for email generation");

    // Make API call to the external service with the exact format required
    const externalApiResponse = await fetch("https://c12e-103-105-227-34.ngrok-free.app/", {
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
        prospect_rep_email: processedData.prospect_rep_email,
        prospect_rep_role: processedData.prospect_rep_role // Added new field
      }),
    });

    if (!externalApiResponse.ok) {
      const errorData = await externalApiResponse.json();
      console.error("Error response from external API:", errorData);
      throw new Error(`External API error: ${JSON.stringify(errorData)}`);
    }

    const generatedEmail = await externalApiResponse.json();
    console.log("Email generated successfully from external API:", generatedEmail);

    // Prepare the response in the expected format
    const emailResponse = {
      sender_email: processedData.company_rep_email,
      sender_name: processedData.company_rep_name,
      prospect_name: processedData.prospect_rep_name,
      prospect_email: processedData.prospect_rep_email,
      prospect_company_name: processedData.prospect_company_name,
      subject: generatedEmail.subject || `Partnership opportunity with ${processedData.company_name}`,
      body: generatedEmail.body || `Default email body if API doesn't return one`,
    };

    // If prospect_id is provided, store the email in the database
    if (requestData.prospect_id) {
      try {
        // Create Supabase client
        const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        console.log(`Checking for existing email for prospect ID: ${requestData.prospect_id}`);
        
        // Check if an email already exists for this prospect
        const { data: existingEmail, error: fetchError } = await supabase
          .from('emails')
          .select('*')
          .eq('prospect_id', requestData.prospect_id)
          .maybeSingle();
          
        if (fetchError) {
          console.error("Error checking for existing email:", fetchError);
        }
        
        let emailRecord;
        
        if (existingEmail) {
          console.log(`Existing email found, updating record ID: ${existingEmail.id}`);
          
          // Update the existing email
          const { data: updatedEmail, error: updateError } = await supabase
            .from('emails')
            .update({
              subject: emailResponse.subject,
              body: emailResponse.body,
              status: 'draft',
              updated_at: new Date().toISOString()
            })
            .eq('id', existingEmail.id)
            .select()
            .single();
            
          if (updateError) {
            console.error("Error updating email in database:", updateError);
            throw updateError;
          } else {
            console.log("Email updated successfully:", updatedEmail);
            emailRecord = updatedEmail;
          }
        } else {
          console.log(`No existing email found, creating new record for prospect ID: ${requestData.prospect_id}`);
          
          // Store the email in the database - ensure we're storing the HTML content as is
          const { data: newEmail, error: insertError } = await supabase
            .from('emails')
            .insert({
              prospect_id: requestData.prospect_id,
              subject: emailResponse.subject,
              body: emailResponse.body, // Store the HTML content as returned by the API
              status: 'draft'
            })
            .select()
            .single();
            
          if (insertError) {
            console.error("Error storing email in database:", insertError);
            throw insertError;
          } else {
            console.log("Email stored successfully:", newEmail);
            emailRecord = newEmail;
          }
        }
        
        // Add the email record to the response
        emailResponse.email_record = emailRecord;
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
      JSON.stringify(emailResponse),
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
