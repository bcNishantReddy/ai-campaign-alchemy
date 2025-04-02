
export interface Campaign {
  id: string;
  created_at: string;
  name: string;
  description: string;
  company_name: string;
  company_description: string;
  representative_name: string;
  representative_role: string;
  representative_email: string;
  user_id: string;
  status: string;
}

export interface Prospect {
  id: string;
  created_at: string;
  name: string;
  role: string;
  email: string;
  company_name: string;
  campaign_id: string;
}

export interface Email {
  id: string;
  created_at: string;
  prospect_id: string;
  subject: string;
  body: string;
  status: 'draft' | 'approved' | 'sent' | 'rejected' | string;
}

export interface Profile {
  id: string;
  updated_at: string;
  name: string;
  company_description: string;
  profile_photo: string;
}

export interface UserApiKeys {
  id: string;
  user_id: string;
  mailjet_api_key: string;
  mailjet_secret_key: string;
  created_at: string;
}
