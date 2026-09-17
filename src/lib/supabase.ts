import { createClient } from '@supabase/supabase-js';
import { TaskStatus, TaskPriority } from '../types';

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
      tasks: {
        Row: {
          id: string;
          code: string;
          title: string;
          details: string | null;
          project: string;
          start_date: string | null;
          due_date: string | null;
          due_status_note: string | null;
          status: TaskStatus;
          assignee_ids: string[];
          priority: TaskPriority | null;
          comments_count: number | null;
          files_count: number | null;
          figma_link: string | null;
          category: string | null;
          completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code?: string;
          title: string;
          details?: string | null;
          project?: string;
          start_date?: string | null;
          due_date?: string | null;
          due_status_note?: string | null;
          status?: TaskStatus;
          assignee_ids?: string[];
          priority?: TaskPriority | null;
          comments_count?: number | null;
          files_count?: number | null;
          figma_link?: string | null;
          category?: string | null;
          completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          title?: string;
          details?: string | null;
          project?: string;
          start_date?: string | null;
          due_date?: string | null;
          due_status_note?: string | null;
          status?: TaskStatus;
          assignee_ids?: string[];
          priority?: TaskPriority | null;
          comments_count?: number | null;
          files_count?: number | null;
          figma_link?: string | null;
          category?: string | null;
          completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          name: string;
          color: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          color: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          color?: string;
          description?: string | null;
          created_at?: string;
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

export type TaskRow = Database['public']['Tables']['tasks']['Row'];
export type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
export type TaskUpdate = Database['public']['Tables']['tasks']['Update'];

export type ProjectRow = Database['public']['Tables']['projects']['Row'];
export type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
export type ProjectUpdate = Database['public']['Tables']['projects']['Update'];

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
