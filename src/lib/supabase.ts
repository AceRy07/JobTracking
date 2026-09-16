import { createClient } from '@supabase/supabase-js';

export type ApplicationStatus = 'applied' | 'interview' | 'offer' | 'rejected' | 'withdrawn';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/**
 * Supabase Database Type Placeholder
 * (İleride Supabase CLI `supabase gen types typescript` ile güncellenebilir)
 */
export interface Database {
  public: {
    Tables: {
      applications: {
        Row: {
          id: string;
          company_name: string;
          position: string;
          status: ApplicationStatus;
          applied_date: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_name: string;
          position: string;
          status?: ApplicationStatus;
          applied_date?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_name?: string;
          position?: string;
          status?: ApplicationStatus;
          applied_date?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      application_status: ApplicationStatus;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type ApplicationRow = Database['public']['Tables']['applications']['Row'];
export type ApplicationInsert = Database['public']['Tables']['applications']['Insert'];
export type ApplicationUpdate = Database['public']['Tables']['applications']['Update'];

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
const supabasePublishableKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string) || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabasePublishableKey &&
  !supabasePublishableKey.includes('<') &&
  !supabasePublishableKey.includes('>')
);

export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabasePublishableKey || 'placeholder-key'
);
