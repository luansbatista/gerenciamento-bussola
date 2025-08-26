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

  // Forçar admin temporariamente para o email específico
  const forceAdminForEmail = (email: string) => {
    return email === 'luansalescontact@gmail.com'
  }

  const isAdmin = user?.isAdmin === true || user?.role === "admin" || forceAdminForEmail(user?.email || '')

  useEffect(() => {
    // Check current session
    const checkAuth = async () => {
      try {
        console.log('🔄 Iniciando verificação de autenticação...')
        
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ Erro ao verificar sessão:', error)
          setIsLoading(false)
          return
        }

        console.log('📋 Sessão encontrada:', session ? 'Sim' : 'Não')
        
        if (session?.user) {
          console.log('🔍 Sessão encontrada, buscando perfil para:', session.user.id)
          console.log('📧 Email do usuário:', session.user.email)
          console.log('🆔 ID do usuário:', session.user.id)
          
          // Buscar dados do perfil para verificar se é admin
          let profile = null
          
          try {
            console.log('🔍 Tentando buscar perfil com ID:', session.user.id)
            
            // Primeiro, testar se conseguimos acessar a tabela
            const { data: testAccess, error: testError } = await supabase
              .from('profiles')
              .select('count')
              .limit(1)
            
            if (testError) {
              console.error('❌ Erro no teste de acesso à tabela:', testError)
              throw new Error(`Erro de acesso: ${testError.message}`)
            }
            
            console.log('✅ Acesso à tabela funcionando')
            
            const { data, error: profileError } = await supabase
              .from('profiles')
              .select('role, is_admin, avatar_url, full_name, study_goal, current_streak, total_study_hours')
              .eq('id', session.user.id)
              .single()

            if (profileError) {
              console.error('❌ Erro ao buscar perfil por ID:', profileError)
              console.log('🔍 Tentando buscar perfil por email como fallback...')
              
              // Fallback: tentar buscar por email
              const { data: emailData, error: emailError } = await supabase
                .from('profiles')
                .select('role, is_admin, avatar, avatar_url, full_name, study_goal, current_streak, total_study_hours')
                .eq('email', session.user.email)
                .single()

              if (emailError) {
                console.error('❌ Erro ao buscar perfil por email:', emailError)
                console.log('🔍 Criando perfil padrão...')
                
                // Se não encontrar, criar um perfil padrão
                profile = {
                  role: forceAdminForEmail(session.user.email || '') ? 'admin' : 'student',
                  is_admin: forceAdminForEmail(session.user.email || ''),
                  avatar_url: null,
                  full_name: session.user.user_metadata?.name || 'Usuário',
                  study_goal: 4,
                  current_streak: 0,
                  total_study_hours: 0
                }
              } else {
                profile = emailData
              }
            } else {
              profile = data
            }

            console.log('✅ Perfil encontrado:', profile)
            
            // Criar objeto de usuário completo
            const userData: User = {
              id: session.user.id,
              email: session.user.email || '',
              name: profile?.full_name || session.user.user_metadata?.name || 'Usuário',
              role: profile?.role || (forceAdminForEmail(session.user.email || '') ? 'admin' : 'student'),
              isAdmin: profile?.is_admin || forceAdminForEmail(session.user.email || ''),
              avatar: profile?.avatar_url || undefined,
              studyGoal: profile?.study_goal || 4,
              currentStreak: profile?.current_streak || 0,
              totalStudyHours: profile?.total_study_hours || 0,
              createdAt: new Date(session.user.created_at)
            }

            console.log('✅ Usuário configurado:', userData)
            setUser(userData)
          } catch (error) {
            console.error('❌ Erro ao processar perfil:', error)
            
            // Criar usuário básico em caso de erro
            const basicUser: User = {
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
            }
            
            console.log('✅ Usuário básico configurado:', basicUser)
            setUser(basicUser)
          }
        } else {
          console.log('❌ Nenhuma sessão encontrada')
          setUser(null)
        }
      } catch (error) {
        console.error('❌ Erro geral na verificação de autenticação:', error)
        setUser(null)
      } finally {
        console.log('✅ Verificação de autenticação concluída')
        setIsLoading(false)
      }
    }

    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state change:', event, session?.user?.id)
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('🔄 SIGNED_IN - buscando perfil para:', session.user.id)
          console.log('📧 Email do usuário (SIGNED_IN):', session.user.email)
          console.log('🆔 ID do usuário (SIGNED_IN):', session.user.id)
          
          // Buscar dados do perfil para verificar se é admin
          let profile = null
          
          try {
            console.log('🔍 Tentando buscar perfil com ID (SIGNED_IN):', session.user.id)
            
            // Primeiro, testar se conseguimos acessar a tabela
            const { data: testAccess, error: testError } = await supabase
              .from('profiles')
              .select('count')
              .limit(1)
            
            if (testError) {
              console.error('❌ Erro no teste de acesso à tabela (SIGNED_IN):', testError)
              throw new Error(`Erro de acesso (SIGNED_IN): ${testError.message}`)
            }
            
            console.log('✅ Acesso à tabela funcionando (SIGNED_IN)')
            
            const { data, error: profileError } = await supabase
              .from('profiles')
              .select('role, is_admin, avatar_url, full_name, study_goal, current_streak, total_study_hours')
              .eq('id', session.user.id)
              .single()

            if (profileError) {
              console.error('❌ Erro ao buscar perfil (SIGNED_IN por ID):', profileError)
              console.log('🔍 Tentando buscar perfil por email como fallback (SIGNED_IN)...')
              
              // Fallback: tentar buscar por email
              const { data: emailData, error: emailError } = await supabase
                .from('profiles')
                .select('role, is_admin, avatar, avatar_url, full_name, study_goal, current_streak, total_study_hours')
                .eq('email', session.user.email)
                .single()

              if (emailError) {
                console.error('❌ Erro ao buscar perfil por email (SIGNED_IN):', emailError)
                console.log('🔍 Criando perfil padrão (SIGNED_IN)...')
                
                // Se não encontrar, criar um perfil padrão
                profile = {
                  role: forceAdminForEmail(session.user.email || '') ? 'admin' : 'student',
                  is_admin: forceAdminForEmail(session.user.email || ''),
                  avatar_url: null,
                  full_name: session.user.user_metadata?.name || 'Usuário',
                  study_goal: 4,
                  current_streak: 0,
                  total_study_hours: 0
                }
              } else {
                profile = emailData
              }
            } else {
              profile = data
            }
          } catch (error) {
            console.error('❌ Erro ao buscar perfil (SIGNED_IN catch):', error)
            console.log('🔍 Criando perfil padrão devido ao erro (SIGNED_IN)...')
            
            // Criar perfil padrão em caso de erro
            profile = {
              role: forceAdminForEmail(session.user.email || '') ? 'admin' : 'student',
              is_admin: forceAdminForEmail(session.user.email || ''),
              avatar_url: null,
              full_name: session.user.user_metadata?.name || 'Usuário',
              study_goal: 4,
              current_streak: 0,
              total_study_hours: 0
            }
          }

          // Create user data with profile data
          const userData: User = {
            id: session.user.id,
            name: profile?.full_name || session.user.user_metadata?.name || 'Usuário',
            email: session.user.email || '',
            avatar: profile?.avatar_url || session.user.user_metadata?.avatar_url || "/abstract-profile.png",
            createdAt: new Date(session.user.created_at),
            studyGoal: profile?.study_goal || 4,
            currentStreak: profile?.current_streak || 0,
            totalStudyHours: profile?.total_study_hours || 0,
            isAdmin: profile?.is_admin === true || profile?.role === 'admin' || session.user.user_metadata?.role === 'admin' || forceAdminForEmail(session.user.email || ''),
            role: profile?.role || session.user.user_metadata?.role || (forceAdminForEmail(session.user.email || '') ? 'admin' : 'student')
          }
          
          console.log('👤 User data criado (SIGNED_IN):', {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            isAdmin: userData.isAdmin
          })
          
          setUser(userData)
        } else if (event === 'SIGNED_OUT') {
          console.log('🚪 Usuário deslogado')
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
        password,
      })

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Erro no login:', error)
      throw error
    }
  }

  const signup = async (name: string, email: string, password: string) => {
    try {
      console.log('🔄 AuthContext: Iniciando signup para:', email)
      
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

      console.log('🔄 AuthContext: Resposta do signup:', { data, error })

      if (error) {
        console.error('❌ AuthContext: Erro do Supabase:', error)
        throw error
      }

      console.log('✅ AuthContext: Signup realizado com sucesso')
    } catch (error) {
      console.error('❌ AuthContext: Erro no signup:', error)
      console.error('❌ AuthContext: Tipo do erro:', typeof error)
      console.error('❌ AuthContext: Erro completo:', JSON.stringify(error, null, 2))
      
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
        console.error('Erro no logout:', error)
      }
    } catch (error) {
      console.error('Erro no logout:', error)
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

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
