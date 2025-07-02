import AsyncStorage from "@react-native-async-storage/async-storage"
import { createClient } from "@supabase/supabase-js"
import "react-native-url-polyfill/auto"

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

console.log("Supabase URL:", supabaseUrl)
console.log("Supabase Key exists:", !!supabaseAnonKey)

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables. Please check your .env file.")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

// Test connection
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error("Supabase connection error:", error)
  } else {
    console.log("Supabase connected successfully")
  }
})

// Database types
export interface Database {
  public: {
    Tables: {
      notes: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          summary: string | null
          tags: string[]
          is_from_interview: boolean
          interview_id: string | null
          created_at: string
          updated_at: string
          is_favorite: boolean
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content: string
          summary?: string | null
          tags?: string[]
          is_from_interview?: boolean
          interview_id?: string | null
          created_at?: string
          updated_at?: string
          is_favorite?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string
          summary?: string | null
          tags?: string[]
          is_from_interview?: boolean
          interview_id?: string | null
          created_at?: string
          updated_at?: string
          is_favorite?: boolean
        }
      }
      profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
