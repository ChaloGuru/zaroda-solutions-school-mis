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
      election_candidates: {
        Row: {
          created_at: string
          grade: string | null
          id: string
          manifesto: string | null
          photo_url: string | null
          position_id: string
          stream: string | null
          student_id: string | null
          student_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          grade?: string | null
          id?: string
          manifesto?: string | null
          photo_url?: string | null
          position_id: string
          stream?: string | null
          student_id?: string | null
          student_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          grade?: string | null
          id?: string
          manifesto?: string | null
          photo_url?: string | null
          position_id?: string
          stream?: string | null
          student_id?: string | null
          student_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "election_candidates_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "election_positions"
            referencedColumns: ["id"]
          },
        ]
      }
      election_positions: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          is_default: boolean | null
          max_candidates: number | null
          name: string
          school_id: string
          scope: Database["public"]["Enums"]["election_scope"]
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          max_candidates?: number | null
          name: string
          school_id: string
          scope?: Database["public"]["Enums"]["election_scope"]
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          max_candidates?: number | null
          name?: string
          school_id?: string
          scope?: Database["public"]["Enums"]["election_scope"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "election_positions_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      election_votes: {
        Row: {
          candidate_id: string
          election_id: string
          id: string
          position_id: string
          voted_at: string
          voter_identifier: string
        }
        Insert: {
          candidate_id: string
          election_id: string
          id?: string
          position_id: string
          voted_at?: string
          voter_identifier: string
        }
        Update: {
          candidate_id?: string
          election_id?: string
          id?: string
          position_id?: string
          voted_at?: string
          voter_identifier?: string
        }
        Relationships: [
          {
            foreignKeyName: "election_votes_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "election_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "election_votes_election_id_fkey"
            columns: ["election_id"]
            isOneToOne: false
            referencedRelation: "elections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "election_votes_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "election_positions"
            referencedColumns: ["id"]
          },
        ]
      }
      elections: {
        Row: {
          created_at: string
          description: string | null
          end_date: string
          id: string
          is_active: boolean | null
          school_id: string
          start_date: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date: string
          id?: string
          is_active?: boolean | null
          school_id: string
          start_date: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string
          id?: string
          is_active?: boolean | null
          school_id?: string
          start_date?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "elections_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
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
          school_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          school_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          school_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          categories: string[] | null
          contact_email: string
          contact_name: string
          contact_phone: string | null
          county: string | null
          created_at: string
          id: string
          name: string
          school_code: string
          school_type: string | null
          status: string | null
          sub_county: string | null
          updated_at: string
          zone: string | null
        }
        Insert: {
          categories?: string[] | null
          contact_email: string
          contact_name: string
          contact_phone?: string | null
          county?: string | null
          created_at?: string
          id?: string
          name: string
          school_code: string
          school_type?: string | null
          status?: string | null
          sub_county?: string | null
          updated_at?: string
          zone?: string | null
        }
        Update: {
          categories?: string[] | null
          contact_email?: string
          contact_name?: string
          contact_phone?: string | null
          county?: string | null
          created_at?: string
          id?: string
          name?: string
          school_code?: string
          school_type?: string | null
          status?: string | null
          sub_county?: string | null
          updated_at?: string
          zone?: string | null
        }
        Relationships: []
      }
      sports_events: {
        Row: {
          category: string
          created_at: string
          description: string | null
          event_date: string | null
          event_type: string
          id: string
          name: string
          school_id: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          event_date?: string | null
          event_type: string
          id?: string
          name: string
          school_id: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          event_date?: string | null
          event_type?: string
          id?: string
          name?: string
          school_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sports_events_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      sports_matches: {
        Row: {
          away_score: number | null
          away_team_id: string | null
          away_team_name: string | null
          created_at: string
          event_id: string
          home_score: number | null
          home_team_id: string | null
          home_team_name: string | null
          id: string
          match_date: string | null
          notes: string | null
          status: string | null
          updated_at: string
          venue: string | null
        }
        Insert: {
          away_score?: number | null
          away_team_id?: string | null
          away_team_name?: string | null
          created_at?: string
          event_id: string
          home_score?: number | null
          home_team_id?: string | null
          home_team_name?: string | null
          id?: string
          match_date?: string | null
          notes?: string | null
          status?: string | null
          updated_at?: string
          venue?: string | null
        }
        Update: {
          away_score?: number | null
          away_team_id?: string | null
          away_team_name?: string | null
          created_at?: string
          event_id?: string
          home_score?: number | null
          home_team_id?: string | null
          home_team_name?: string | null
          id?: string
          match_date?: string | null
          notes?: string | null
          status?: string | null
          updated_at?: string
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sports_matches_away_team_id_fkey"
            columns: ["away_team_id"]
            isOneToOne: false
            referencedRelation: "sports_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sports_matches_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "sports_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sports_matches_home_team_id_fkey"
            columns: ["home_team_id"]
            isOneToOne: false
            referencedRelation: "sports_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      sports_participants: {
        Row: {
          admission_number: string | null
          created_at: string
          date_of_birth: string | null
          gender: string | null
          grade: string | null
          id: string
          school_id: string
          stream: string | null
          student_name: string
          updated_at: string
        }
        Insert: {
          admission_number?: string | null
          created_at?: string
          date_of_birth?: string | null
          gender?: string | null
          grade?: string | null
          id?: string
          school_id: string
          stream?: string | null
          student_name: string
          updated_at?: string
        }
        Update: {
          admission_number?: string | null
          created_at?: string
          date_of_birth?: string | null
          gender?: string | null
          grade?: string | null
          id?: string
          school_id?: string
          stream?: string | null
          student_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sports_participants_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      sports_performances: {
        Row: {
          created_at: string
          event_id: string
          id: string
          is_best: boolean | null
          notes: string | null
          participant_id: string
          performance_numeric: number | null
          performance_value: string
          position: number | null
          recorded_at: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          is_best?: boolean | null
          notes?: string | null
          participant_id: string
          performance_numeric?: number | null
          performance_value: string
          position?: number | null
          recorded_at?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          is_best?: boolean | null
          notes?: string | null
          participant_id?: string
          performance_numeric?: number | null
          performance_value?: string
          position?: number | null
          recorded_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sports_performances_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "sports_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sports_performances_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "sports_participants"
            referencedColumns: ["id"]
          },
        ]
      }
      sports_team_members: {
        Row: {
          created_at: string
          id: string
          is_captain: boolean | null
          jersey_number: number | null
          participant_id: string
          position: string | null
          team_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_captain?: boolean | null
          jersey_number?: number | null
          participant_id: string
          position?: string | null
          team_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_captain?: boolean | null
          jersey_number?: number | null
          participant_id?: string
          position?: string | null
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sports_team_members_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "sports_participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sports_team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "sports_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      sports_teams: {
        Row: {
          category: string | null
          created_at: string
          id: string
          name: string
          school_id: string
          sport: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          name: string
          school_id: string
          sport: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          name?: string
          school_id?: string
          sport?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sports_teams_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "school_admin" | "teacher" | "parent" | "student"
      election_scope: "stream" | "category" | "whole_school"
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
      app_role: ["admin", "school_admin", "teacher", "parent", "student"],
      election_scope: ["stream", "category", "whole_school"],
    },
  },
} as const
