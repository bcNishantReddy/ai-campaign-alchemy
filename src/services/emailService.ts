
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Types for email generation request
export interface EmailGenerationRequest {
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
  prospect_id?: string;
}

// Types for email generation response
export interface EmailGenerationResponse {
  sender_email: string;
  sender_name: string;
  prospect_name: string;
  prospect_email: string;
  prospect_company_name: string;
  subject: string;
  body: string;
  email_record?: any;
}

// Types for email sending request
export interface EmailSendRequest {
  from_email: string;
  from_name: string;
  to_email: string;
  to_name: string;
  subject: string;
  body: string;
  mailjet_api_key?: string;
  mailjet_api_secret?: string;
  user_id: string;
  email_id?: string; // Added email_id for tracking
}

// Generate email function
export const generateEmail = async (data: EmailGenerationRequest): Promise<EmailGenerationResponse> => {
  try {
    console.log("Generating email with data:", {
      ...data,
      prospect_id: data.prospect_id ? data.prospect_id : 'Not provided'
    });
    
    // Make the API call to the edge function with all required data
    const { data: response, error } = await supabase.functions.invoke('generate-email', {
      body: data,
    });

    if (error) {
      console.error("Error from generate-email function:", error);
      throw new Error(error.message || 'Failed to generate email');
    }

    if (!response) {
      console.error("No response from generate-email function");
      throw new Error('No response received from the server');
    }

    console.log("Email generated successfully:", response);
    
    // Ensure email_record exists - if it doesn't, create a record in the database
    if (!response.email_record && data.prospect_id) {
      console.log("No email record returned from function, creating one manually");
      const { data: emailRecord, error: insertError } = await supabase
        .from('emails')
        .insert({
          prospect_id: data.prospect_id,
          subject: response.subject,
          body: response.body,
          status: 'draft'
        })
        .select()
        .single();
        
      if (insertError) {
        console.error("Error creating email record:", insertError);
      } else {
        console.log("Email record created successfully:", emailRecord);
        response.email_record = emailRecord;
      }
    }
    
    // Important: return the full response which includes the HTML content
    return response;
  } catch (error: any) {
    console.error('Error generating email:', error);
    toast.error(`Error generating email: ${error.message}`);
    throw error;
  }
};

// Send email function
export const sendEmail = async (data: EmailSendRequest): Promise<{ message: string }> => {
  try {
    // Get the current user
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (!sessionData.session) {
      throw new Error('User not authenticated');
    }
    
    console.log("Sending email with data:", {
      ...data,
      body: data.body.length > 100 ? data.body.substring(0, 100) + '...' : data.body,
      mailjet_api_key: data.mailjet_api_key ? "[REDACTED]" : undefined,
      mailjet_api_secret: data.mailjet_api_secret ? "[REDACTED]" : undefined
    });
    
    // Ensure user_id is set in the request
    const requestData: EmailSendRequest = {
      ...data,
      user_id: data.user_id || sessionData.session.user.id
    };
    
    // Remove mailjet keys from the request since they'll be retrieved from the database
    delete requestData.mailjet_api_key;
    delete requestData.mailjet_api_secret;

    // Send the email - preserving HTML content
    const { data: response, error } = await supabase.functions.invoke('send-email', {
      body: requestData,
    });

    if (error) {
      console.error("Error from send-email function:", error);
      throw new Error(error.message || 'Failed to send email');
    }

    console.log("Email sent successfully:", response);
    return response;
  } catch (error: any) {
    console.error('Error sending email:', error);
    toast.error(`Error sending email: ${error.message}`);
    throw error;
  }
};
