
export interface Profile {
  id: string;
  name: string | null;
  company_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  company_name: string | null;
  company_description: string | null;
  representative_name: string | null;
  representative_role: string | null;
  representative_email: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Prospect {
  id: string;
  campaign_id: string;
  company_name: string | null;
  name: string | null;
  email: string | null;
  role: string | null;
  additional_info: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Email {
  id: string;
  prospect_id: string;
  subject: string | null;
  body: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}
