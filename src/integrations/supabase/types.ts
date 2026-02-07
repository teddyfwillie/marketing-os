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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          activity_type: string
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          organization_id: string
          title: string
          user_id: string | null
        }
        Insert: {
          activity_type: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          organization_id: string
          title: string
          user_id?: string | null
        }
        Update: {
          activity_type?: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_events: {
        Row: {
          created_at: string
          event_name: string
          id: string
          organization_id: string | null
          properties: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_name: string
          id?: string
          organization_id?: string | null
          properties?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_name?: string
          id?: string
          organization_id?: string | null
          properties?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      competitors: {
        Row: {
          content_count: number | null
          created_at: string
          id: string
          last_scanned_at: string | null
          name: string
          organization_id: string
          scraped_data: Json | null
          social_followers: string | null
          status: Database["public"]["Enums"]["competitor_status"]
          traffic_estimate: string | null
          updated_at: string
          url: string
        }
        Insert: {
          content_count?: number | null
          created_at?: string
          id?: string
          last_scanned_at?: string | null
          name: string
          organization_id: string
          scraped_data?: Json | null
          social_followers?: string | null
          status?: Database["public"]["Enums"]["competitor_status"]
          traffic_estimate?: string | null
          updated_at?: string
          url: string
        }
        Update: {
          content_count?: number | null
          created_at?: string
          id?: string
          last_scanned_at?: string | null
          name?: string
          organization_id?: string
          scraped_data?: Json | null
          social_followers?: string | null
          status?: Database["public"]["Enums"]["competitor_status"]
          traffic_estimate?: string | null
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "competitors_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      email_campaigns: {
        Row: {
          audience: string | null
          click_rate: number | null
          content: string | null
          created_at: string
          created_by: string | null
          id: string
          name: string
          open_rate: number | null
          organization_id: string
          scheduled_at: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["campaign_status"]
          subject: string | null
          subscriber_count: number | null
          updated_at: string
        }
        Insert: {
          audience?: string | null
          click_rate?: number | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          open_rate?: number | null
          organization_id: string
          scheduled_at?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["campaign_status"]
          subject?: string | null
          subscriber_count?: number | null
          updated_at?: string
        }
        Update: {
          audience?: string | null
          click_rate?: number | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          open_rate?: number | null
          organization_id?: string
          scheduled_at?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["campaign_status"]
          subject?: string | null
          subscriber_count?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_campaigns_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_content: {
        Row: {
          content: string
          content_type: Database["public"]["Enums"]["content_type"]
          created_at: string
          created_by: string | null
          id: string
          organization_id: string
          prompt: string | null
          title: string | null
          tone: Database["public"]["Enums"]["content_tone"]
          updated_at: string
        }
        Insert: {
          content: string
          content_type: Database["public"]["Enums"]["content_type"]
          created_at?: string
          created_by?: string | null
          id?: string
          organization_id: string
          prompt?: string | null
          title?: string | null
          tone: Database["public"]["Enums"]["content_tone"]
          updated_at?: string
        }
        Update: {
          content?: string
          content_type?: Database["public"]["Enums"]["content_type"]
          created_at?: string
          created_by?: string | null
          id?: string
          organization_id?: string
          prompt?: string | null
          title?: string | null
          tone?: Database["public"]["Enums"]["content_tone"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "generated_content_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          company_size: Database["public"]["Enums"]["company_size"] | null
          created_at: string
          created_by: string | null
          id: string
          industry: Database["public"]["Enums"]["industry_type"] | null
          name: string
          updated_at: string
          website: string | null
        }
        Insert: {
          company_size?: Database["public"]["Enums"]["company_size"] | null
          created_at?: string
          created_by?: string | null
          id?: string
          industry?: Database["public"]["Enums"]["industry_type"] | null
          name: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          company_size?: Database["public"]["Enums"]["company_size"] | null
          created_at?: string
          created_by?: string | null
          id?: string
          industry?: Database["public"]["Enums"]["industry_type"] | null
          name?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          onboarding_completed: boolean
          organization_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean
          organization_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean
          organization_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_codes: {
        Row: {
          code: string
          created_at: string
          id: string
          is_active: boolean
          organization_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          organization_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          organization_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_codes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_rewards: {
        Row: {
          granted_at: string
          id: string
          invitee_credit_delta: number
          inviter_credit_delta: number
          referral_id: string
        }
        Insert: {
          granted_at?: string
          id?: string
          invitee_credit_delta: number
          inviter_credit_delta: number
          referral_id: string
        }
        Update: {
          granted_at?: string
          id?: string
          invitee_credit_delta?: number
          inviter_credit_delta?: number
          referral_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_rewards_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: true
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          referral_code_id: string
          referred_user_id: string
          referrer_user_id: string
          source: string | null
          status: Database["public"]["Enums"]["referral_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          referral_code_id: string
          referred_user_id: string
          referrer_user_id: string
          source?: string | null
          status?: Database["public"]["Enums"]["referral_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          referral_code_id?: string
          referred_user_id?: string
          referrer_user_id?: string
          source?: string | null
          status?: Database["public"]["Enums"]["referral_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referral_code_id_fkey"
            columns: ["referral_code_id"]
            isOneToOne: false
            referencedRelation: "referral_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      social_posts: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          id: string
          media_urls: string[] | null
          organization_id: string
          platforms: Database["public"]["Enums"]["social_platform"][]
          published_at: string | null
          scheduled_at: string | null
          status: Database["public"]["Enums"]["post_status"]
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          media_urls?: string[] | null
          organization_id: string
          platforms: Database["public"]["Enums"]["social_platform"][]
          published_at?: string | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["post_status"]
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          media_urls?: string[] | null
          organization_id?: string
          platforms?: Database["public"]["Enums"]["social_platform"][]
          published_at?: string | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["post_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_posts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          created_by: string | null
          due_date: string | null
          due_time: string | null
          id: string
          organization_id: string
          title: string
          updated_at: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          due_time?: string | null
          id?: string
          organization_id: string
          title: string
          updated_at?: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          due_time?: string | null
          id?: string
          organization_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_credit_ledger: {
        Row: {
          created_at: string
          delta: number
          id: string
          organization_id: string | null
          reason: Database["public"]["Enums"]["usage_credit_reason"]
          reference_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          delta: number
          id?: string
          organization_id?: string | null
          reason: Database["public"]["Enums"]["usage_credit_reason"]
          reference_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          delta?: number
          id?: string
          organization_id?: string | null
          reason?: Database["public"]["Enums"]["usage_credit_reason"]
          reference_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usage_credit_ledger_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_referral: { Args: { p_code: string; p_source?: string }; Returns: string }
      consume_usage_credit: {
        Args: {
          p_amount?: number
          p_reason?: Database["public"]["Enums"]["usage_credit_reason"]
          p_reference_id?: string
        }
        Returns: number
      }
      get_user_org_id: { Args: { _user_id: string }; Returns: string }
      get_or_create_referral_code: { Args: Record<PropertyKey, never>; Returns: Database["public"]["Tables"]["referral_codes"]["Row"] }
      grant_referral_reward: { Args: { p_referral_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      user_belongs_to_org: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "member" | "viewer"
      campaign_status: "draft" | "scheduled" | "active" | "paused" | "completed"
      company_size:
        | "1-10"
        | "11-50"
        | "51-200"
        | "201-500"
        | "501-1000"
        | "1000+"
      competitor_status: "pending" | "analyzing" | "analyzed" | "failed"
      content_tone: "professional" | "casual" | "friendly" | "persuasive"
      content_type: "blog" | "social" | "ad" | "email"
      industry_type:
        | "technology"
        | "healthcare"
        | "finance"
        | "retail"
        | "education"
        | "manufacturing"
        | "services"
        | "other"
      post_status: "draft" | "scheduled" | "published"
      referral_status: "pending" | "signed_up" | "qualified" | "rewarded" | "rejected"
      social_platform: "twitter" | "instagram" | "linkedin" | "facebook"
      usage_credit_reason: "referral_reward" | "usage_deduction" | "admin_adjustment"
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
    Enums: {
      app_role: ["admin", "member", "viewer"],
      campaign_status: ["draft", "scheduled", "active", "paused", "completed"],
      company_size: ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"],
      competitor_status: ["pending", "analyzing", "analyzed", "failed"],
      content_tone: ["professional", "casual", "friendly", "persuasive"],
      content_type: ["blog", "social", "ad", "email"],
      industry_type: [
        "technology",
        "healthcare",
        "finance",
        "retail",
        "education",
        "manufacturing",
        "services",
        "other",
      ],
      post_status: ["draft", "scheduled", "published"],
      referral_status: ["pending", "signed_up", "qualified", "rewarded", "rejected"],
      social_platform: ["twitter", "instagram", "linkedin", "facebook"],
      usage_credit_reason: ["referral_reward", "usage_deduction", "admin_adjustment"],
    },
  },
} as const
