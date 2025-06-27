"use client"

import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    orderBy,
    query,
    Timestamp,
    updateDoc,
    where,
} from "firebase/firestore"
import { useEffect, useState } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth, db } from "../config/firebase"

export interface Note {
  id: string
  title: string
  content: string
  summary?: string
  tags: string[]
  createdAt: Timestamp
  updatedAt: Timestamp
  source: "manual" | "intelliprep"
  interviewId?: string
  userId: string
}

export function useNotes() {
  const [user] = useAuthState(auth)
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setNotes([])
      setLoading(false)
      return
    }

    const notesRef = collection(db, "notes")
    const q = query(notesRef, where("userId", "==", user.uid), orderBy("updatedAt", "desc"))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Note[]
        setNotes(notesData)
        setLoading(false)
        setError(null)
      },
      (err) => {
        console.error("Error fetching notes:", err)
        setError("Failed to fetch notes")
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [user])

  const addNote = async (noteData: Omit<Note, "id" | "createdAt" | "updatedAt" | "userId">) => {
    if (!user) throw new Error("User not authenticated")

    try {
      const now = Timestamp.now()
      await addDoc(collection(db, "notes"), {
        ...noteData,
        userId: user.uid,
        createdAt: now,
        updatedAt: now,
      })
    } catch (err) {
      console.error("Error adding note:", err)
      throw new Error("Failed to add note")
    }
  }

  const updateNote = async (id: string, updates: Partial<Note>) => {
    if (!user) throw new Error("User not authenticated")

    try {
      const noteRef = doc(db, "notes", id)
      await updateDoc(noteRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      })
    } catch (err) {
      console.error("Error updating note:", err)
      throw new Error("Failed to update note")
    }
  }

  const deleteNote = async (id: string) => {
    if (!user) throw new Error("User not authenticated")

    try {
      await deleteDoc(doc(db, "notes", id))
    } catch (err) {
      console.error("Error deleting note:", err)
      throw new Error("Failed to delete note")
    }
  }

  const summarizeNote = async (id: string) => {
    const note = notes.find((n) => n.id === id)
    if (!note) throw new Error("Note not found")

    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: note.content }),
      })

      if (!response.ok) throw new Error("Failed to summarize")

      const { summary } = await response.json()
      await updateNote(id, { summary })
    } catch (err) {
      console.error("Error summarizing note:", err)
      throw new Error("Failed to summarize note")
    }
  }

  const addInterviewNote = async (interviewId: string, content: string, title?: string) => {
    await addNote({
      title: title || `Interview Notes - ${new Date().toLocaleDateString()}`,
      content,
      tags: ["interview", "intelliprep"],
      source: "intelliprep",
      interviewId,
    })
  }

  return {
    notes,
    loading,
    error,
    addNote,
    updateNote,
    deleteNote,
    summarizeNote,
    addInterviewNote,
  }
}
