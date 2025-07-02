import AsyncStorage from "@react-native-async-storage/async-storage"
import type { Session, User } from "@supabase/supabase-js"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import { supabase } from "../config/supabase"

interface AuthState {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
  pendingEmailConfirmation: string | null // Email waiting for confirmation

  // Actions
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string; needsConfirmation?: boolean }>
  signUp: (
    email: string,
    password: string,
    fullName: string,
  ) => Promise<{ success: boolean; error?: string; needsConfirmation?: boolean }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>
  resendConfirmation: (email: string) => Promise<{ success: boolean; error?: string }>
  initialize: () => Promise<void>
  clearError: () => void
  clearPendingConfirmation: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isLoading: true,
      isAuthenticated: false,
      error: null,
      pendingEmailConfirmation: null,

      signIn: async (email: string, password: string) => {
        console.log("Attempting sign in for:", email)
        set({ isLoading: true, error: null })

        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          console.log("Sign in response:", { data: !!data, error })

          if (error) {
            console.error("Sign in error:", error)

            // Handle specific error cases
            if (error.message.includes("Email not confirmed")) {
              set({
                isLoading: false,
                error: "Please check your email and click the confirmation link before signing in.",
                pendingEmailConfirmation: email,
              })
              return { success: false, error: "Email not confirmed", needsConfirmation: true }
            }

            if (error.message.includes("Invalid login credentials")) {
              set({
                isLoading: false,
                error: "Invalid email or password. Please check your credentials and try again.",
              })
              return { success: false, error: "Invalid credentials" }
            }

            set({ isLoading: false, error: error.message })
            return { success: false, error: error.message }
          }

          console.log("Sign in successful")
          set({
            user: data.user,
            session: data.session,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            pendingEmailConfirmation: null,
          })

          return { success: true }
        } catch (error) {
          console.error("Sign in catch error:", error)
          const errorMessage = "An unexpected error occurred. Please try again."
          set({ isLoading: false, error: errorMessage })
          return { success: false, error: errorMessage }
        }
      },

      signUp: async (email: string, password: string, fullName: string) => {
        console.log("Attempting sign up for:", email)
        set({ isLoading: true, error: null })

        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName,
              },
            },
          })

          console.log("Sign up response:", { data: !!data, error, user: !!data?.user, session: !!data?.session })

          if (error) {
            console.error("Sign up error:", error)

            // Handle specific error cases
            if (error.message.includes("User already registered")) {
              set({ isLoading: false, error: "An account with this email already exists. Please sign in instead." })
              return { success: false, error: "User already exists" }
            }

            if (error.message.includes("Password should be at least")) {
              set({ isLoading: false, error: "Password must be at least 6 characters long." })
              return { success: false, error: "Password too short" }
            }

            set({ isLoading: false, error: error.message })
            return { success: false, error: error.message }
          }

          // Check if user needs email confirmation
          if (data.user && !data.session) {
            console.log("User created but needs email confirmation")
            set({
              isLoading: false,
              error: null,
              pendingEmailConfirmation: email,
            })

            // Create profile for the user even though they haven't confirmed email yet
            if (data.user) {
              console.log("Creating profile for user:", data.user.id)
              const { error: profileError } = await supabase.from("profiles").insert({
                user_id: data.user.id,
                full_name: fullName,
              })

              if (profileError) {
                console.error("Profile creation error:", profileError)
              }
            }

            return { success: true, needsConfirmation: true }
          }

          // User is automatically signed in (email confirmation disabled)
          if (data.user && data.session) {
            console.log("User created and automatically signed in")

            // Create profile
            const { error: profileError } = await supabase.from("profiles").insert({
              user_id: data.user.id,
              full_name: fullName,
            })

            if (profileError) {
              console.error("Profile creation error:", profileError)
            }

            set({
              user: data.user,
              session: data.session,
              isAuthenticated: true,
              isLoading: false,
              error: null,
              pendingEmailConfirmation: null,
            })

            return { success: true }
          }

          set({ isLoading: false, error: null })
          return { success: true }
        } catch (error) {
          console.error("Sign up catch error:", error)
          const errorMessage = "An unexpected error occurred. Please try again."
          set({ isLoading: false, error: errorMessage })
          return { success: false, error: errorMessage }
        }
      },

      signOut: async () => {
        console.log("Signing out")
        try {
          await supabase.auth.signOut()
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            error: null,
            pendingEmailConfirmation: null,
          })
        } catch (error) {
          console.error("Sign out error:", error)
        }
      },

      resetPassword: async (email: string) => {
        console.log("Resetting password for:", email)
        set({ error: null })

        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: "intelliprep://auth/reset-password",
          })

          if (error) {
            console.error("Reset password error:", error)
            return { success: false, error: error.message }
          }

          return { success: true }
        } catch (error) {
          console.error("Reset password catch error:", error)
          return { success: false, error: "An unexpected error occurred" }
        }
      },

      resendConfirmation: async (email: string) => {
        console.log("Resending confirmation email for:", email)
        set({ error: null })

        try {
          const { error } = await supabase.auth.resend({
            type: "signup",
            email: email,
          })

          if (error) {
            console.error("Resend confirmation error:", error)
            return { success: false, error: error.message }
          }

          return { success: true }
        } catch (error) {
          console.error("Resend confirmation catch error:", error)
          return { success: false, error: "An unexpected error occurred" }
        }
      },

      initialize: async () => {
        console.log("Initializing auth...")
        set({ isLoading: true })

        try {
          const {
            data: { session },
          } = await supabase.auth.getSession()

          console.log("Initial session:", !!session)

          set({
            user: session?.user ?? null,
            session,
            isAuthenticated: !!session,
            isLoading: false,
            error: null,
          })

          // Listen for auth changes
          supabase.auth.onAuthStateChange((event, session) => {
            console.log("Auth state changed:", event, !!session)

            if (event === "SIGNED_IN") {
              set({
                user: session?.user ?? null,
                session,
                isAuthenticated: !!session,
                pendingEmailConfirmation: null,
              })
            } else if (event === "SIGNED_OUT") {
              set({
                user: null,
                session: null,
                isAuthenticated: false,
              })
            }
          })
        } catch (error) {
          console.error("Initialize auth error:", error)
          set({ isLoading: false, error: "Failed to initialize authentication" })
        }
      },

      clearError: () => set({ error: null }),
      clearPendingConfirmation: () => set({ pendingEmailConfirmation: null }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        isAuthenticated: state.isAuthenticated,
        pendingEmailConfirmation: state.pendingEmailConfirmation,
      }),
    },
  ),
)
