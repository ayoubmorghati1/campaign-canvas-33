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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      campaign_assets: {
        Row: {
          campaign_id: string
          created_at: string
          height: number | null
          id: string
          kind: string
          mime: string | null
          public_url: string
          storage_path: string
          width: number | null
        }
        Insert: {
          campaign_id: string
          created_at?: string
          height?: number | null
          id?: string
          kind: string
          mime?: string | null
          public_url: string
          storage_path: string
          width?: number | null
        }
        Update: {
          campaign_id?: string
          created_at?: string
          height?: number | null
          id?: string
          kind?: string
          mime?: string | null
          public_url?: string
          storage_path?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_assets_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          brand: string
          cover_path: string | null
          created_at: string
          freedom: number
          id: string
          name: string
          platforms: string[]
          status: string
          updated_at: string
          voice: string
        }
        Insert: {
          brand?: string
          cover_path?: string | null
          created_at?: string
          freedom?: number
          id?: string
          name?: string
          platforms?: string[]
          status?: string
          updated_at?: string
          voice?: string
        }
        Update: {
          brand?: string
          cover_path?: string | null
          created_at?: string
          freedom?: number
          id?: string
          name?: string
          platforms?: string[]
          status?: string
          updated_at?: string
          voice?: string
        }
        Relationships: []
      }
      creative_briefs: {
        Row: {
          audience: string | null
          campaign_id: string
          color_strategy: string | null
          created_at: string
          goal: string | null
          mood: string | null
          notes: string | null
          palette: Json | null
          position: string | null
          references_dna: Json | null
          updated_at: string
          visual_direction: string | null
        }
        Insert: {
          audience?: string | null
          campaign_id: string
          color_strategy?: string | null
          created_at?: string
          goal?: string | null
          mood?: string | null
          notes?: string | null
          palette?: Json | null
          position?: string | null
          references_dna?: Json | null
          updated_at?: string
          visual_direction?: string | null
        }
        Update: {
          audience?: string | null
          campaign_id?: string
          color_strategy?: string | null
          created_at?: string
          goal?: string | null
          mood?: string | null
          notes?: string | null
          palette?: Json | null
          position?: string | null
          references_dna?: Json | null
          updated_at?: string
          visual_direction?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "creative_briefs_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: true
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      director_messages: {
        Row: {
          campaign_id: string
          content: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          campaign_id: string
          content: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          campaign_id?: string
          content?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "director_messages_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      variants: {
        Row: {
          campaign_id: string
          caption_body: string | null
          created_at: string
          direction_label: string
          id: string
          match_score: number | null
          mood_caption: string | null
          platform: string
          prompt: string | null
          public_url: string | null
          reasoning: Json | null
          storage_path: string | null
          title: string
        }
        Insert: {
          campaign_id: string
          caption_body?: string | null
          created_at?: string
          direction_label: string
          id?: string
          match_score?: number | null
          mood_caption?: string | null
          platform: string
          prompt?: string | null
          public_url?: string | null
          reasoning?: Json | null
          storage_path?: string | null
          title: string
        }
        Update: {
          campaign_id?: string
          caption_body?: string | null
          created_at?: string
          direction_label?: string
          id?: string
          match_score?: number | null
          mood_caption?: string | null
          platform?: string
          prompt?: string | null
          public_url?: string | null
          reasoning?: Json | null
          storage_path?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "variants_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
