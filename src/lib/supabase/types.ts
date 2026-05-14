export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      aligned_insights_inquiries: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          email: string;
          phone: string;
          organization_name: string;
          organization_type: string;
          annual_revenue: string;
          looking_for: string[];
          message: string | null;
          source: string;
          status: string;
          intake_email_sent_at: string | null;
          intake_email_sent_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          first_name: string;
          last_name: string;
          email: string;
          phone: string;
          organization_name: string;
          organization_type: string;
          annual_revenue: string;
          looking_for: string[];
          message?: string | null;
          source?: string;
          status?: string;
          intake_email_sent_at?: string | null;
          intake_email_sent_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          first_name?: string;
          last_name?: string;
          email?: string;
          phone?: string;
          organization_name?: string;
          organization_type?: string;
          annual_revenue?: string;
          looking_for?: string[];
          message?: string | null;
          source?: string;
          status?: string;
          intake_email_sent_at?: string | null;
          intake_email_sent_by?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      financial_intake_links: {
        Row: {
          id: string;
          token: string;
          contact_email: string | null;
          organization_name: string | null;
          status: string;
          expires_at: string | null;
          created_at: string;
          submitted_at: string | null;
        };
        Insert: {
          id?: string;
          token: string;
          contact_email?: string | null;
          organization_name?: string | null;
          status?: string;
          expires_at?: string | null;
          created_at?: string;
          submitted_at?: string | null;
        };
        Update: {
          token?: string;
          contact_email?: string | null;
          organization_name?: string | null;
          status?: string;
          expires_at?: string | null;
          submitted_at?: string | null;
        };
        Relationships: [];
      };
      financial_intake_submissions: {
        Row: {
          id: string;
          link_id: string | null;
          token: string;
          organization_profile: Json | null;
          financial_systems: Json | null;
          reporting_visibility: Json | null;
          payroll_staffing: Json | null;
          giving_funds: Json | null;
          banking_cash_debt: Json | null;
          internal_controls: Json | null;
          pain_points_goals: Json | null;
          uploads: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          link_id?: string | null;
          token: string;
          organization_profile?: Json | null;
          financial_systems?: Json | null;
          reporting_visibility?: Json | null;
          payroll_staffing?: Json | null;
          giving_funds?: Json | null;
          banking_cash_debt?: Json | null;
          internal_controls?: Json | null;
          pain_points_goals?: Json | null;
          uploads?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          uploads?: Json | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "financial_intake_submissions_link_id_fkey";
            columns: ["link_id"];
            isOneToOne: false;
            referencedRelation: "financial_intake_links";
            referencedColumns: ["id"];
          },
        ];
      };
      financial_intake_files: {
        Row: {
          id: string;
          submission_id: string | null;
          file_label: string | null;
          file_name: string | null;
          file_path: string | null;
          file_type: string | null;
          file_size: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          submission_id?: string | null;
          file_label?: string | null;
          file_name?: string | null;
          file_path?: string | null;
          file_type?: string | null;
          file_size?: number | null;
          created_at?: string;
        };
        Update: never;
        Relationships: [
          {
            foreignKeyName: "financial_intake_files_submission_id_fkey";
            columns: ["submission_id"];
            isOneToOne: false;
            referencedRelation: "financial_intake_submissions";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
