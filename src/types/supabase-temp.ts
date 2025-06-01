
// Temporary types to help with TypeScript errors until Supabase regenerates the official types
export interface SupabaseDatabase {
  public: {
    Tables: {
      campaigns: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          description: string | null;
          company_name: string | null;
          company_description: string | null;
          representative_name: string | null;
          representative_role: string | null;
          representative_email: string | null;
          user_id: string;
          status: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          name: string;
          description?: string | null;
          company_name?: string | null;
          company_description?: string | null;
          representative_name?: string | null;
          representative_role?: string | null;
          representative_email?: string | null;
          user_id: string;
          status?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          name?: string;
          description?: string | null;
          company_name?: string | null;
          company_description?: string | null;
          representative_name?: string | null;
          representative_role?: string | null;
          representative_email?: string | null;
          user_id?: string;
          status?: string | null;
        };
      };
      prospects: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          role: string | null;
          email: string;
          company_name: string;
          campaign_id: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          name: string;
          role?: string | null;
          email: string;
          company_name: string;
          campaign_id: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          name?: string;
          role?: string | null;
          email?: string;
          company_name?: string;
          campaign_id?: string;
        };
      };
      emails: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          prospect_id: string;
          subject: string;
          body: string;
          status: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          prospect_id: string;
          subject: string;
          body: string;
          status?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          prospect_id?: string;
          subject?: string;
          body?: string;
          status?: string | null;
        };
      };
      profiles: {
        Row: {
          id: string;
          updated_at: string;
          name: string | null;
          company_description: string | null;
          profile_photo: string | null;
        };
        Insert: {
          id: string;
          updated_at?: string;
          name?: string | null;
          company_description?: string | null;
          profile_photo?: string | null;
        };
        Update: {
          id?: string;
          updated_at?: string;
          name?: string | null;
          company_description?: string | null;
          profile_photo?: string | null;
        };
      };
      user_api_keys: {
        Row: {
          id: string;
          user_id: string;
          mailjet_api_key: string | null;
          mailjet_secret_key: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          mailjet_api_key?: string | null;
          mailjet_secret_key?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          mailjet_api_key?: string | null;
          mailjet_secret_key?: string | null;
          created_at?: string;
        };
      };
    };
  };
}
