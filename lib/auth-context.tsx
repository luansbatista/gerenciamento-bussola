"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import type { User } from "./types"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const isAdmin = user?.isAdmin === true || user?.role === "admin"

  useEffect(() => {
    // Check current session
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error("Error getting session:", error)
          setIsLoading(false)
          return
        }

        if (session?.user) {
          try {
            // Get user profile with admin status
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()

            if (profileError) {
              console.error("Error getting profile:", profileError.message || profileError)
              // If it's an RLS error, we'll create a default profile
              if (profileError.message && profileError.message.includes('infinite recursion')) {
                console.warn("RLS recursion detected, using default profile")
              }
            }

            const userData: User = {
              id: session.user.id,
              name: profile?.name || session.user.user_metadata?.name || 'Usuário',
              email: session.user.email || '',
              avatar: profile?.avatar_url || session.user.user_metadata?.avatar_url || "/abstract-profile.png",
              createdAt: new Date(session.user.created_at),
              studyGoal: profile?.study_goal || 4,
              currentStreak: profile?.current_streak || 0,
              totalStudyHours: profile?.total_study_hours || 0,
              isAdmin: profile?.is_admin || false,
              role: session.user.user_metadata?.role || 'student'
            }

            setUser(userData)
          } catch (profileError) {
            console.error("Error getting profile:", profileError)
            // Create user data without profile
            const userData: User = {
              id: session.user.id,
              name: session.user.user_metadata?.name || 'Usuário',
              email: session.user.email || '',
              avatar: session.user.user_metadata?.avatar_url || "/abstract-profile.png",
              createdAt: new Date(session.user.created_at),
              studyGoal: 4,
              currentStreak: 0,
              totalStudyHours: 0,
              isAdmin: false,
              role: session.user.user_metadata?.role || 'student'
            }
            setUser(userData)
          }
        }
      } catch (error) {
        console.error("Auth check error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          try {
            // Get user profile with admin status
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()

            if (profileError) {
              console.error("Error getting profile in auth change:", profileError.message || profileError)
              // If it's an RLS error, we'll create a default profile
              if (profileError.message && profileError.message.includes('infinite recursion')) {
                console.warn("RLS recursion detected in auth change, using default profile")
              }
            }

            const userData: User = {
              id: session.user.id,
              name: profile?.name || session.user.user_metadata?.name || 'Usuário',
              email: session.user.email || '',
              avatar: profile?.avatar_url || session.user.user_metadata?.avatar_url || "/abstract-profile.png",
              createdAt: new Date(session.user.created_at),
              studyGoal: profile?.study_goal || 4,
              currentStreak: profile?.current_streak || 0,
              totalStudyHours: profile?.total_study_hours || 0,
              isAdmin: profile?.is_admin || false,
              role: session.user.user_metadata?.role || 'student'
            }

            setUser(userData)
          } catch (profileError) {
            console.error("Error getting profile in auth change:", profileError)
            // Create user data without profile
            const userData: User = {
              id: session.user.id,
              name: session.user.user_metadata?.name || 'Usuário',
              email: session.user.email || '',
              avatar: session.user.user_metadata?.avatar_url || "/abstract-profile.png",
              createdAt: new Date(session.user.created_at),
              studyGoal: 4,
              currentStreak: 0,
              totalStudyHours: 0,
              isAdmin: false,
              role: session.user.user_metadata?.role || 'student'
            }
            setUser(userData)
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        throw new Error(error.message)
      }
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  const signup = async (name: string, email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role: 'student'
          }
        }
      })

      if (error) {
        throw new Error(error.message)
      }
    } catch (error) {
      console.error("Signup error:", error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
