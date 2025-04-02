// Import Json type from Supabase for compatibility
import { Json } from "@/integrations/supabase/types";

export interface Profile {
  id: string;
  name: string | null;
  company_description: string | null;
  profile_photo?: string | null;  // Make this optional
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
  additional_info: Json | null;
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

// Add the missing UserApiKeys interface
export interface UserApiKeys {
  id: string;
  user_id: string;
  mailjet_api_key: string | null;
  mailjet_secret_key: string | null;
  created_at: string;
  updated_at: string;
}

// These type declarations help TypeScript recognize our database tables
declare module '@supabase/supabase-js' {
  export interface Database {
    public: {
      Tables: {
        profiles: {
          Row: Profile;
          Insert: Omit<Profile, 'created_at' | 'updated_at'>;
          Update: Partial<Omit<Profile, 'created_at' | 'updated_at'>>;
        };
        campaigns: {
          Row: Campaign;
          Insert: Omit<Campaign, 'created_at' | 'updated_at' | 'id'> & { id?: string };
          Update: Partial<Omit<Campaign, 'created_at' | 'updated_at'>>;
        };
        prospects: {
          Row: Prospect;
          Insert: Omit<Prospect, 'created_at' | 'updated_at' | 'id'> & { 
            id?: string;
            additional_info?: Json;
          };
          Update: Partial<Omit<Prospect, 'created_at' | 'updated_at'>>;
        };
        emails: {
          Row: Email;
          Insert: Omit<Email, 'created_at' | 'updated_at' | 'id'> & { id?: string };
          Update: Partial<Omit<Email, 'created_at' | 'updated_at'>>;
        };
      };
    };
  }
}
