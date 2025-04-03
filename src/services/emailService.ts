
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
  prospect_rep_role: string; 
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
  email_id?: string;
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
    
    // If there's no email_record in the response but we have a prospect_id, 
    // fetch the email record from the database
    if (!response.email_record && data.prospect_id) {
      console.log("No email record in response, fetching from database");
      const { data: emailRecord, error: fetchError } = await supabase
        .from('emails')
        .select('*')
        .eq('prospect_id', data.prospect_id)
        .maybeSingle();
        
      if (fetchError) {
        console.error("Error fetching email record:", fetchError);
      } else if (emailRecord) {
        console.log("Email record fetched successfully:", emailRecord);
        response.email_record = emailRecord;
      } else {
        // If still no email record found, create one manually
        console.log("No email record found in database, creating one manually");
        const { data: newEmailRecord, error: insertError } = await supabase
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
          console.log("Email record created successfully:", newEmailRecord);
          response.email_record = newEmailRecord;
        }
      }
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
    
    // Update the email status in the database if email_id was provided
    if (data.email_id) {
      const { error: updateError } = await supabase
        .from('emails')
        .update({ 
          status: 'sent',
          updated_at: new Date().toISOString() 
        })
        .eq('id', data.email_id);
        
      if (updateError) {
        console.error("Error updating email status:", updateError);
        // Don't throw here, we still want to return success if the email was sent
      }
    }
    
    return response;
  } catch (error: any) {
    console.error('Error sending email:', error);
    toast.error(`Error sending email: ${error.message}`);
    throw error;
  }
};

// Delete campaign and all related data
export const deleteCampaignWithRelated = async (campaignId: string): Promise<void> => {
  try {
    console.log("Deleting campaign and all related data for campaign ID:", campaignId);
    
    // First, get all prospects for this campaign
    const { data: prospects, error: prospectsError } = await supabase
      .from('prospects')
      .select('id')
      .eq('campaign_id', campaignId);
      
    if (prospectsError) {
      console.error("Error fetching prospects:", prospectsError);
      throw prospectsError;
    }
    
    const prospectIds = prospects?.map(p => p.id) || [];
    console.log(`Found ${prospectIds.length} prospects to delete`);
    
    // Delete all emails related to these prospects
    if (prospectIds.length > 0) {
      const { error: emailsError } = await supabase
        .from('emails')
        .delete()
        .in('prospect_id', prospectIds);
        
      if (emailsError) {
        console.error("Error deleting related emails:", emailsError);
        throw emailsError;
      }
      
      console.log(`Deleted emails for ${prospectIds.length} prospects`);
    }
    
    // Delete all prospects for this campaign
    const { error: prospectsDeleteError } = await supabase
      .from('prospects')
      .delete()
      .eq('campaign_id', campaignId);
      
    if (prospectsDeleteError) {
      console.error("Error deleting prospects:", prospectsDeleteError);
      throw prospectsDeleteError;
    }
    
    console.log("Deleted all prospects for campaign");
    
    // Finally, delete the campaign
    const { error: campaignError } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', campaignId);
      
    if (campaignError) {
      console.error("Error deleting campaign:", campaignError);
      throw campaignError;
    }
    
    console.log("Campaign deleted successfully");
    
  } catch (error: any) {
    console.error("Error in deleteCampaignWithRelated:", error);
    throw error;
  }
};
