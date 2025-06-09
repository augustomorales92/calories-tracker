import { createClient } from './supabase/client'

export const supabase = createClient()

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      foods: {
        Row: {
          id: string
          user_id: string
          name: string
          calories_per_100g: number
          protein_per_100g: number
          carbs_per_100g: number
          fats_per_100g: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          calories_per_100g: number
          protein_per_100g?: number
          carbs_per_100g?: number
          fats_per_100g?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          calories_per_100g?: number
          protein_per_100g?: number
          carbs_per_100g?: number
          fats_per_100g?: number
          created_at?: string
        }
      }
      meal_sections: {
        Row: {
          id: string
          user_id: string
          name: string
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          order_index?: number
          created_at?: string
        }
      }
      meal_entries: {
        Row: {
          id: string
          user_id: string
          food_id: string
          meal_section_id: string
          date: string
          quantity: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          food_id: string
          meal_section_id: string
          date: string
          quantity: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          food_id?: string
          meal_section_id?: string
          date?: string
          quantity?: number
          created_at?: string
        }
      }
      daily_goals: {
        Row: {
          id: string
          user_id: string
          calories: number
          protein: number
          carbs: number
          fats: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          calories?: number
          protein?: number
          carbs?: number
          fats?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          calories?: number
          protein?: number
          carbs?: number
          fats?: number
          created_at?: string
          updated_at?: string
        }
      }
      weight_entries: {
        Row: {
          id: string
          user_id: string
          weight: number
          date: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          weight: number
          date: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          weight?: number
          date?: string
          notes?: string | null
          created_at?: string
        }
      }
      progress_photos: {
        Row: {
          id: string
          user_id: string
          photo_url: string
          date: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          photo_url: string
          date: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          photo_url?: string
          date?: string
          notes?: string | null
          created_at?: string
        }
      }
    }
  }
}
