"use client"

import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from "firebase/auth"
import { useState } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "../config/firebase"

export function useAuth() {
  const [user, loading, error] = useAuthState(auth)
  const [authLoading, setAuthLoading] = useState(false)

  const signUp = async (email: string, password: string, displayName: string) => {
    setAuthLoading(true)
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(result.user, { displayName })
      return result.user
    } catch (error: any) {
      throw new Error(error.message)
    } finally {
      setAuthLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    setAuthLoading(true)
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      return result.user
    } catch (error: any) {
      throw new Error(error.message)
    } finally {
      setAuthLoading(false)
    }
  }

  const logout = async () => {
    setAuthLoading(true)
    try {
      await signOut(auth)
    } catch (error: any) {
      throw new Error(error.message)
    } finally {
      setAuthLoading(false)
    }
  }

  return {
    user,
    loading: loading || authLoading,
    error,
    signUp,
    signIn,
    logout,
  }
}
