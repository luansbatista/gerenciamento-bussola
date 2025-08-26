"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { createSimpleClient } from "@/utils/supabase/simple-client"
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

export function AuthProviderSimple({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createSimpleClient()

  const forceAdminForEmail = (email: string) => {
    return email === 'luansalescontact@gmail.com'
  }

  const isAdmin = user?.isAdmin === true || user?.role === "admin" || forceAdminForEmail(user?.email || '')

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('🔄 [SIMPLE] Iniciando verificação de autenticação...')
        
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ [SIMPLE] Erro ao verificar sessão:', error)
          setIsLoading(false)
          return
        }

        console.log('📋 [SIMPLE] Sessão encontrada:', session ? 'Sim' : 'Não')
        
        if (session?.user) {
          console.log('✅ [SIMPLE] Usuário logado:', session.user.email)
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || 'Usuário',
            role: forceAdminForEmail(session.user.email || '') ? 'admin' : 'student',
            isAdmin: forceAdminForEmail(session.user.email || ''),
            avatar: undefined,
            studyGoal: 4,
            currentStreak: 0,
            totalStudyHours: 0,
            createdAt: new Date(session.user.created_at)
          })
        } else {
          console.log('❌ [SIMPLE] Nenhuma sessão encontrada')
          setUser(null)
        }
      } catch (error) {
        console.error('❌ [SIMPLE] Erro geral na verificação de autenticação:', error)
        setUser(null)
      } finally {
        console.log('✅ [SIMPLE] Verificação de autenticação concluída')
        setIsLoading(false)
      }
    }

    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 [SIMPLE] Auth state change:', event, session?.user?.id)
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('✅ [SIMPLE] Usuário logado:', session.user.email)
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || 'Usuário',
            role: forceAdminForEmail(session.user.email || '') ? 'admin' : 'student',
            isAdmin: forceAdminForEmail(session.user.email || ''),
            avatar: undefined,
            studyGoal: 4,
            currentStreak: 0,
            totalStudyHours: 0,
            createdAt: new Date(session.user.created_at)
          })
        } else if (event === 'SIGNED_OUT') {
          console.log('🚪 [SIMPLE] Usuário deslogado')
          setUser(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const login = async (email: string, password: string) => {
    try {
      console.log('🔄 [SIMPLE] Tentando login para:', email)
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('❌ [SIMPLE] Erro no login:', error)
        throw error
      }
      
      console.log('✅ [SIMPLE] Login realizado com sucesso')
    } catch (error) {
      console.error('❌ [SIMPLE] Erro no login:', error)
      throw error
    }
  }

  const signup = async (name: string, email: string, password: string) => {
    try {
      console.log('🔄 [SIMPLE] Tentando signup para:', email)
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role: 'student',
            is_admin: false
          }
        }
      })

      console.log('🔄 [SIMPLE] Resposta do signup:', { data, error })

      if (error) {
        console.error('❌ [SIMPLE] Erro do Supabase:', error)
        throw error
      }

      console.log('✅ [SIMPLE] Signup realizado com sucesso')
    } catch (error) {
      console.error('❌ [SIMPLE] Erro no signup:', error)
      console.error('❌ [SIMPLE] Tipo do erro:', typeof error)
      console.error('❌ [SIMPLE] Erro completo:', JSON.stringify(error, null, 2))
      
      // Se o erro é um objeto do Supabase, extrair a mensagem
      if (error && typeof error === 'object' && 'message' in error) {
        throw new Error(error.message as string)
      } else if (error && typeof error === 'object' && 'error_description' in error) {
        throw new Error((error as any).error_description as string)
      } else if (error && typeof error === 'object' && 'msg' in error) {
        throw new Error((error as any).msg as string)
      } else {
        // Se não conseguir extrair a mensagem, criar um erro genérico
        throw new Error('Erro desconhecido ao criar conta')
      }
    }
  }

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('❌ [SIMPLE] Erro no logout:', error)
      }
    } catch (error) {
      console.error('❌ [SIMPLE] Erro no logout:', error)
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      login,
      signup,
      logout,
      isLoading,
      isAdmin
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthSimple() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthSimple must be used within an AuthProviderSimple')
  }
  return context
}
