
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
}

// Generate email function
export const generateEmail = async (data: EmailGenerationRequest): Promise<EmailGenerationResponse> => {
  try {
    const { data: response, error } = await supabase.functions.invoke('generate-email', {
      body: data,
    });

    if (error) {
      throw new Error(error.message || 'Failed to generate email');
    }

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
    
    // Ensure user_id is set in the request
    const requestData: EmailSendRequest = {
      ...data,
      user_id: data.user_id || sessionData.session.user.id
    };
    
    // Remove mailjet keys from the request since they'll be retrieved from the database
    delete requestData.mailjet_api_key;
    delete requestData.mailjet_api_secret;

    const { data: response, error } = await supabase.functions.invoke('send-email', {
      body: requestData,
    });

    if (error) {
      throw new Error(error.message || 'Failed to send email');
    }

    return response;
  } catch (error: any) {
    console.error('Error sending email:', error);
    toast.error(`Error sending email: ${error.message}`);
    throw error;
  }
};
