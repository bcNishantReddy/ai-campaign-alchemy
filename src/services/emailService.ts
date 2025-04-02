
import { toast } from "sonner";

// API base URL
const API_BASE_URL = "http://localhost:5000";

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
  mailjet_api_key: string;
  mailjet_api_secret: string;
}

// Generate email function
export const generateEmail = async (data: EmailGenerationRequest): Promise<EmailGenerationResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/generate_email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate email');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error generating email:', error);
    toast.error(`Error generating email: ${error.message}`);
    throw error;
  }
};

// Send email function
export const sendEmail = async (data: EmailSendRequest): Promise<{ message: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/send_email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send email');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error sending email:', error);
    toast.error(`Error sending email: ${error.message}`);
    throw error;
  }
};
