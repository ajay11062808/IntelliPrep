import { create } from "zustand"
import { supabase } from "../config/supabase"
import { useAuthStore } from "./authStore"

export interface Note {
  id: string
  user_id: string
  title: string
  content: string
  summary?: string
  tags: string[]
  is_from_interview: boolean
  interview_id?: string
  created_at: string
  updated_at: string
  is_favorite: boolean
}

interface NotesState {
  notes: Note[]
  searchQuery: string
  selectedTags: string[]
  isLoading: boolean
  error: string | null

  // Actions
  fetchNotes: () => Promise<void>
  addNote: (note: Omit<Note, "id" | "user_id" | "created_at" | "updated_at">) => Promise<void>
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>
  deleteNote: (id: string) => Promise<void>
  toggleFavorite: (id: string) => Promise<void>
  setSearchQuery: (query: string) => void
  setSelectedTags: (tags: string[]) => void
  clearError: () => void
  summarizeNote: (id: string) => Promise<void>
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  searchQuery: "",
  selectedTags: [],
  isLoading: false,
  error: null,

  fetchNotes: async () => {
    const user = useAuthStore.getState().user
    if (!user) {
      console.log("No user found, skipping notes fetch")
      return
    }

    console.log("Fetching notes for user:", user.id)
    set({ isLoading: true })
    try {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })

      if (error) {
        console.error("Fetch notes error:", error)
        throw error
      }

      console.log("Fetched notes:", data?.length || 0)
      set({ notes: data || [], error: null })
    } catch (error) {
      console.error("Fetch notes catch error:", error)
      set({ error: (error as Error).message })
    } finally {
      set({ isLoading: false })
    }
  },

  addNote: async (noteData) => {
    const user = useAuthStore.getState().user
    if (!user) return

    console.log("Adding note:", noteData.title)
    try {
      const { data, error } = await supabase
        .from("notes")
        .insert({
          ...noteData,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) {
        console.error("Add note error:", error)
        throw error
      }

      console.log("Note added successfully")
      set((state) => ({
        notes: [data, ...state.notes],
      }))
    } catch (error) {
      console.error("Add note catch error:", error)
      set({ error: (error as Error).message })
    }
  },

  updateNote: async (id, updates) => {
    console.log("Updating note:", id)
    try {
      const { data, error } = await supabase.from("notes").update(updates).eq("id", id).select().single()

      if (error) {
        console.error("Update note error:", error)
        throw error
      }

      console.log("Note updated successfully")
      set((state) => ({
        notes: state.notes.map((note) => (note.id === id ? data : note)),
      }))
    } catch (error) {
      console.error("Update note catch error:", error)
      set({ error: (error as Error).message })
    }
  },

  deleteNote: async (id) => {
    console.log("Deleting note:", id)
    try {
      const { error } = await supabase.from("notes").delete().eq("id", id)

      if (error) {
        console.error("Delete note error:", error)
        throw error
      }

      console.log("Note deleted successfully")
      set((state) => ({
        notes: state.notes.filter((note) => note.id !== id),
      }))
    } catch (error) {
      console.error("Delete note catch error:", error)
      set({ error: (error as Error).message })
    }
  },

  toggleFavorite: async (id) => {
    const note = get().notes.find((n) => n.id === id)
    if (!note) return

    await get().updateNote(id, { is_favorite: !note.is_favorite })
  },

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedTags: (tags) => set({ selectedTags: tags }),
  clearError: () => set({ error: null }),

  summarizeNote: async (id) => {
    const note = get().notes.find((n) => n.id === id)
    if (!note) return

    const summary = `Summary: ${note.content.substring(0, 100)}...`
    await get().updateNote(id, { summary })
  },
}))
