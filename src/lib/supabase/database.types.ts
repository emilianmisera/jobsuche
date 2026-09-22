export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      activities: {
        Row: {
          application_id: string
          created_at: string
          id: string
          message: string
          payload: Json
          type: Database["public"]["Enums"]["activity_type"]
          user_id: string
        }
        Insert: {
          application_id: string
          created_at?: string
          id?: string
          message: string
          payload?: Json
          type: Database["public"]["Enums"]["activity_type"]
          user_id: string
        }
        Update: {
          application_id?: string
          created_at?: string
          id?: string
          message?: string
          payload?: Json
          type?: Database["public"]["Enums"]["activity_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      application_attachments: {
        Row: {
          application_id: string
          created_at: string
          document_id: string
        }
        Insert: {
          application_id: string
          created_at?: string
          document_id: string
        }
        Update: {
          application_id?: string
          created_at?: string
          document_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_attachments_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "application_attachments_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          applied_at: string | null
          company: string
          cover_letter_id: string | null
          created_at: string
          cv_document_id: string | null
          employment_type: Database["public"]["Enums"]["employment_type"] | null
          gmail_thread_id: string | null
          id: string
          is_remote: boolean
          job_link: string | null
          location: string | null
          next_action_at: string | null
          next_action_note: string | null
          notes: string | null
          position: string
          status: Database["public"]["Enums"]["application_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          applied_at?: string | null
          company: string
          cover_letter_id?: string | null
          created_at?: string
          cv_document_id?: string | null
          employment_type?:
            | Database["public"]["Enums"]["employment_type"]
            | null
          gmail_thread_id?: string | null
          id?: string
          is_remote?: boolean
          job_link?: string | null
          location?: string | null
          next_action_at?: string | null
          next_action_note?: string | null
          notes?: string | null
          position: string
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
          user_id?: string
        }
        Update: {
          applied_at?: string | null
          company?: string
          cover_letter_id?: string | null
          created_at?: string
          cv_document_id?: string | null
          employment_type?:
            | Database["public"]["Enums"]["employment_type"]
            | null
          gmail_thread_id?: string | null
          id?: string
          is_remote?: boolean
          job_link?: string | null
          location?: string | null
          next_action_at?: string | null
          next_action_note?: string | null
          notes?: string | null
          position?: string
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_cover_letter_id_fkey"
            columns: ["cover_letter_id"]
            isOneToOne: false
            referencedRelation: "cover_letters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_cv_document_id_fkey"
            columns: ["cv_document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      cover_letter_templates: {
        Row: {
          base_pdf_path: string
          created_at: string
          font_path: string | null
          id: string
          is_default: boolean
          layout: Json
          name: string
          signature_pdf_path: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          base_pdf_path: string
          created_at?: string
          font_path?: string | null
          id?: string
          is_default?: boolean
          layout?: Json
          name: string
          signature_pdf_path?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          base_pdf_path?: string
          created_at?: string
          font_path?: string | null
          id?: string
          is_default?: boolean
          layout?: Json
          name?: string
          signature_pdf_path?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cover_letters: {
        Row: {
          body: string
          created_at: string
          id: string
          template_id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body?: string
          created_at?: string
          id?: string
          template_id: string
          title: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          template_id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cover_letters_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "cover_letter_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string
          id: string
          mime_type: string
          size_bytes: number | null
          storage_path: string
          title: string
          type: Database["public"]["Enums"]["document_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mime_type?: string
          size_bytes?: number | null
          storage_path: string
          title: string
          type?: Database["public"]["Enums"]["document_type"]
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          mime_type?: string
          size_bytes?: number | null
          storage_path?: string
          title?: string
          type?: Database["public"]["Enums"]["document_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_accounts: {
        Row: {
          created_at: string
          email: string
          last_synced_at: string | null
          refresh_token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          last_synced_at?: string | null
          refresh_token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          last_synced_at?: string | null
          refresh_token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_messages: {
        Row: {
          application_id: string | null
          confidence: number | null
          created_at: string
          from_address: string
          gmail_message_id: string
          gmail_thread_id: string | null
          id: string
          received_at: string
          seen_at: string | null
          snippet: string
          state: Database["public"]["Enums"]["suggestion_state"]
          subject: string
          suggested_status:
            | Database["public"]["Enums"]["application_status"]
            | null
          user_id: string
        }
        Insert: {
          application_id?: string | null
          confidence?: number | null
          created_at?: string
          from_address: string
          gmail_message_id: string
          gmail_thread_id?: string | null
          id?: string
          received_at: string
          seen_at?: string | null
          snippet?: string
          state?: Database["public"]["Enums"]["suggestion_state"]
          subject?: string
          suggested_status?:
            | Database["public"]["Enums"]["application_status"]
            | null
          user_id: string
        }
        Update: {
          application_id?: string | null
          confidence?: number | null
          created_at?: string
          from_address?: string
          gmail_message_id?: string
          gmail_thread_id?: string | null
          id?: string
          received_at?: string
          seen_at?: string | null
          snippet?: string
          state?: Database["public"]["Enums"]["suggestion_state"]
          subject?: string
          suggested_status?:
            | Database["public"]["Enums"]["application_status"]
            | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_messages_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      activity_type: "created" | "status_changed" | "note" | "email_received"
      application_status:
        | "draft"
        | "applied"
        | "in_progress"
        | "rejected"
        | "offer"
      document_type: "cv" | "attachment"
      employment_type: "full_time" | "part_time" | "mini_job" | "fixed_term"
      suggestion_state:
        | "none"
        | "pending"
        | "accepted"
        | "dismissed"
        | "auto_applied"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      activity_type: ["created", "status_changed", "note", "email_received"],
      application_status: [
        "draft",
        "applied",
        "in_progress",
        "rejected",
        "offer",
      ],
      document_type: ["cv", "attachment"],
      employment_type: ["full_time", "part_time", "mini_job", "fixed_term"],
      suggestion_state: [
        "none",
        "pending",
        "accepted",
        "dismissed",
        "auto_applied",
      ],
    },
  },
} as const

