export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      event_activities: {
        Row: {
          activity_description: string
          created_at: string
          day_date: string
          event_id: string
          id: string
          image_url: string | null
          rich_description: Json | null
          time_slot: string
          updated_at: string
        }
        Insert: {
          activity_description: string
          created_at?: string
          day_date: string
          event_id: string
          id?: string
          image_url?: string | null
          rich_description?: Json | null
          time_slot: string
          updated_at?: string
        }
        Update: {
          activity_description?: string
          created_at?: string
          day_date?: string
          event_id?: string
          id?: string
          image_url?: string | null
          rich_description?: Json | null
          time_slot?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_activities_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "user_events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_media: {
        Row: {
          created_at: string
          display_order: number | null
          event_id: string
          id: string
          media_type: string
          media_url: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          event_id: string
          id?: string
          media_type: string
          media_url: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          event_id?: string
          id?: string
          media_type?: string
          media_url?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_media_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "user_events"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      recurrence_types: {
        Row: {
          created_at: string
          days_interval: number | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          days_interval?: number | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          days_interval?: number | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      user_activity_logs: {
        Row: {
          activity_type: string
          created_at: string
          device_info: Json | null
          event_id: string | null
          id: string
          ip_address: unknown
          location_info: Json | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          activity_type: string
          created_at?: string
          device_info?: Json | null
          event_id?: string | null
          id?: string
          ip_address?: unknown
          location_info?: Json | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          activity_type?: string
          created_at?: string
          device_info?: Json | null
          event_id?: string | null
          id?: string
          ip_address?: unknown
          location_info?: Json | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_activity_logs_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "user_events"
            referencedColumns: ["id"]
          },
        ]
      }
      user_events: {
        Row: {
          address: string
          category: string | null
          contact_info: string | null
          created_at: string
          dates: string
          end_date: string | null
          full_description: string | null
          id: string
          image_url: string | null
          is_published: boolean
          latitude: number | null
          longitude: number | null
          price: string
          recurrence_days: number[] | null
          recurrence_end_date: string | null
          recurrence_type_id: string | null
          short_description: string
          start_date: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address: string
          category?: string | null
          contact_info?: string | null
          created_at?: string
          dates: string
          end_date?: string | null
          full_description?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          latitude?: number | null
          longitude?: number | null
          price?: string
          recurrence_days?: number[] | null
          recurrence_end_date?: string | null
          recurrence_type_id?: string | null
          short_description: string
          start_date?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string
          category?: string | null
          contact_info?: string | null
          created_at?: string
          dates?: string
          end_date?: string | null
          full_description?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          latitude?: number | null
          longitude?: number | null
          price?: string
          recurrence_days?: number[] | null
          recurrence_end_date?: string | null
          recurrence_type_id?: string | null
          short_description?: string
          start_date?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_events_recurrence_type_id_fkey"
            columns: ["recurrence_type_id"]
            isOneToOne: false
            referencedRelation: "recurrence_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_favorites: {
        Row: {
          created_at: string
          event_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "user_events"
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
      [_ in never]: never
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
  public: {
    Enums: {},
  },
} as const
