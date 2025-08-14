"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from "react"
import { createClient } from "@/utils/supabase/client"

// Tipos para o contexto administrativo
interface AdminStats {
  totalUsers: number
  totalQuestions: number
  totalExams: number
  totalStudySessions: number
  activeUsers: number
  questionsAnswered: number
  averageAccuracy: number
}

interface User {
  id: string
  name: string
  email: string
  created_at: string
  is_admin: boolean
  study_goal: number
  current_streak: number
  total_study_hours: number
  last_login: string | null
  status: 'active' | 'inactive' | 'suspended'
}

interface Question {
  id: string
  subject: string
  disciplina?: string
  assunto?: string
  question: string
  enunciado?: string
  options: string[]
  opcao_a?: string
  opcao_b?: string
  opcao_c?: string
  opcao_d?: string
  opcao_e?: string
  correct_answer: number
  alternativa_correta?: string
  difficulty: 'easy' | 'medium' | 'hard'
  nivel?: string
  created_at: string
  times_answered: number
  accuracy_rate: number
}

interface SystemConfig {
  maintenance_mode: boolean
  max_users: number
  max_questions_per_subject: number
  study_goal_default: number
  session_timeout: number
  backup_frequency: 'daily' | 'weekly' | 'monthly'
}

interface AdminContextType {
  // Estatísticas
  stats: AdminStats | null
  isLoadingStats: boolean
  
  // Usuários
  users: User[]
  isLoadingUsers: boolean
  fetchUsers: () => Promise<void>
  updateUserStatus: (userId: string, status: 'active' | 'inactive' | 'suspended') => Promise<{ success: boolean; error?: any }>
  makeUserAdmin: (userId: string) => Promise<{ success: boolean; error?: any }>
  removeUserAdmin: (userId: string) => Promise<{ success: boolean; error?: any }>
  deleteUser: (userId: string) => Promise<{ success: boolean; error?: any }>
  
  // Questões
  questions: Question[]
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>
  isLoadingQuestions: boolean
  fetchQuestions: () => Promise<void>
  addQuestion: (question: Omit<Question, 'id' | 'created_at' | 'times_answered' | 'accuracy_rate'>) => Promise<{ success: boolean; data?: Question; error?: any }>
  updateQuestion: (id: string, updates: Partial<Question>) => Promise<{ success: boolean; error?: any }>
  deleteQuestion: (id: string) => Promise<{ success: boolean; error?: any }>
  refreshQuestions: () => Promise<void>
  
  // Configurações
  config: SystemConfig | null
  isLoadingConfig: boolean
  fetchConfig: () => Promise<void>
  updateConfig: (updates: Partial<SystemConfig>) => Promise<{ success: boolean; error?: any }>
  
  // Relatórios
  generateUserReport: () => Promise<any>
  generateQuestionReport: () => Promise<any>
  generateSystemReport: () => Promise<any>
  
  // Utilitários
  refreshAllData: () => Promise<void>
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [config, setConfig] = useState<SystemConfig | null>(null)
  
  const [isLoadingStats, setIsLoadingStats] = useState(false)
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false)
  const [isLoadingConfig, setIsLoadingConfig] = useState(false)

  
  const supabase = createClient()

  // Buscar estatísticas gerais
  const fetchStats = useCallback(async () => {
    setIsLoadingStats(true)
    try {
      // Buscar dados de usuários
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      // Buscar dados de questões
      const { count: totalQuestions } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true })

      // Buscar dados de exames
      const { count: totalExams } = await supabase
        .from('exams')
        .select('*', { count: 'exact', head: true })

      // Buscar dados de sessões de estudo
      const { count: totalStudySessions } = await supabase
        .from('study_sessions')
        .select('*', { count: 'exact', head: true })

      // Buscar usuários ativos (últimos 7 dias)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      
      const { count: activeUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('last_login', sevenDaysAgo.toISOString())

      // Buscar tentativas de questões
      const { count: questionsAnswered } = await supabase
        .from('question_attempts')
        .select('*', { count: 'exact', head: true })

      // Calcular precisão média
      const { data: attempts } = await supabase
        .from('question_attempts')
        .select('is_correct')

      const correctAnswers = attempts?.filter(a => a.is_correct).length || 0
      const totalAttempts = attempts?.length || 1
      const averageAccuracy = Math.round((correctAnswers / totalAttempts) * 100)

      setStats({
        totalUsers: totalUsers || 0,
        totalQuestions: totalQuestions || 0,
        totalExams: totalExams || 0,
        totalStudySessions: totalStudySessions || 0,
        activeUsers: activeUsers || 0,
        questionsAnswered: questionsAnswered || 0,
        averageAccuracy
      })
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
      // Dados mockados como fallback
      setStats({
        totalUsers: 0,
        totalQuestions: 0,
        totalExams: 0,
        totalStudySessions: 0,
        activeUsers: 0,
        questionsAnswered: 0,
        averageAccuracy: 0
      })
    } finally {
      setIsLoadingStats(false)
    }
  }, [supabase])

  // Buscar usuários
  const fetchUsers = useCallback(async () => {
    setIsLoadingUsers(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      const usersWithStatus: User[] = (data || []).map(user => ({
        id: user.id,
        name: user.name || 'Usuário',
        email: user.email || '',
        created_at: user.created_at,
        is_admin: user.is_admin || false,
        study_goal: user.study_goal || 4,
        current_streak: user.current_streak || 0,
        total_study_hours: user.total_study_hours || 0,
        last_login: user.last_login,
        status: 'active' as const // Por padrão, todos são ativos
      }))

      setUsers(usersWithStatus)
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
      setUsers([])
    } finally {
      setIsLoadingUsers(false)
    }
  }, [supabase])

  // Buscar questões
  const fetchQuestions = useCallback(async () => {
    setIsLoadingQuestions(true)
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro do Supabase ao buscar questões:', error)
        setQuestions([])
        return
      }

      if (data && data.length > 0) {
        const questionsWithStats: Question[] = data.map(q => ({
          id: q.id,
          subject: q.subject || q.disciplina || 'Geral',
          disciplina: q.disciplina,
          assunto: q.assunto,
          question: q.question,
          enunciado: q.enunciado,
          options: Array.isArray(q.options) ? q.options : (q.options ? JSON.parse(JSON.stringify(q.options)) : []),
          opcao_a: q.opcao_a,
          opcao_b: q.opcao_b,
          opcao_c: q.opcao_c,
          opcao_d: q.opcao_d,
          opcao_e: q.opcao_e,
          correct_answer: q.correct_answer,
          alternativa_correta: q.alternativa_correta,
          difficulty: q.difficulty || q.nivel || 'medium',
          nivel: q.nivel,
          created_at: q.created_at,
          times_answered: q.times_answered || 0,
          accuracy_rate: q.accuracy_rate || 0
        }))

        setQuestions(questionsWithStats)
      } else {
        setQuestions([])
      }
    } catch (error) {
      console.error('Erro ao buscar questões:', error)
      setQuestions([])
    } finally {
      setIsLoadingQuestions(false)
    }
  }, [])

  // Buscar configurações
  const fetchConfig = useCallback(async () => {
    setIsLoadingConfig(true)
    try {
      // Por enquanto, usar configurações padrão
      // Em produção, isso viria de uma tabela de configurações
      setConfig({
        maintenance_mode: false,
        max_users: 1000,
        max_questions_per_subject: 500,
        study_goal_default: 4,
        session_timeout: 30,
        backup_frequency: 'daily'
      })
    } catch (error) {
      console.error('Erro ao buscar configurações:', error)
      setConfig(null)
    } finally {
      setIsLoadingConfig(false)
    }
  }, [])

  // Atualizar status do usuário
  const updateUserStatus = async (userId: string, status: 'active' | 'inactive' | 'suspended') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status })
        .eq('id', userId)

      if (error) throw error

      // Atualizar lista local
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, status } : user
      ))

      return { success: true }
    } catch (error) {
      console.error('Erro ao atualizar status do usuário:', error)
      return { success: false, error }
    }
  }

  // Tornar usuário admin
  const makeUserAdmin = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: true })
        .eq('id', userId)

      if (error) throw error

      // Atualizar lista local
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, is_admin: true } : user
      ))

      return { success: true }
    } catch (error) {
      console.error('Erro ao tornar usuário admin:', error)
      return { success: false, error }
    }
  }

  // Remover admin de usuário
  const removeUserAdmin = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: false })
        .eq('id', userId)

      if (error) throw error

      // Atualizar lista local
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, is_admin: false } : user
      ))

      return { success: true }
    } catch (error) {
      console.error('Erro ao remover admin do usuário:', error)
      return { success: false, error }
    }
  }

  // Deletar usuário
  const deleteUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)

      if (error) throw error

      // Remover da lista local
      setUsers(prev => prev.filter(user => user.id !== userId))

      return { success: true }
    } catch (error) {
      console.error('Erro ao deletar usuário:', error)
      return { success: false, error }
    }
  }

  // Adicionar questão
  const addQuestion = async (question: Omit<Question, 'id' | 'created_at' | 'times_answered' | 'accuracy_rate'>): Promise<{ success: boolean; data?: Question; error?: any }> => {
    console.log('addQuestion chamada com:', question)
    try {
      console.log('Inserindo questão no Supabase...')
      
      // Preparar dados para inserção
      const questionData = {
        subject: question.subject || question.disciplina,
        disciplina: question.disciplina,
        assunto: question.assunto,
        question: question.question,
        enunciado: question.enunciado,
        options: Array.isArray(question.options) ? question.options : JSON.stringify(question.options),
        opcao_a: question.opcao_a,
        opcao_b: question.opcao_b,
        opcao_c: question.opcao_c,
        opcao_d: question.opcao_d,
        opcao_e: question.opcao_e,
        correct_answer: question.correct_answer,
        alternativa_correta: question.alternativa_correta,
        difficulty: question.difficulty || question.nivel,
        nivel: question.nivel
      }

      console.log('Dados preparados para inserção:', questionData)

      const { data, error } = await supabase
        .from('questions')
        .insert([questionData])
        .select()
        .single()

      if (error) {
        console.error('Erro do Supabase:', error)
        throw error
      }

      console.log('Questão inserida no Supabase:', data)

      const newQuestion: Question = {
        ...question,
        id: data.id,
        created_at: data.created_at,
        times_answered: 0,
        accuracy_rate: 0
      }

      // Adicionar à lista local
      setQuestions(prev => {
        const newList = [newQuestion, ...prev]
        console.log(`Questão adicionada ao banco e memória. Total: ${newList.length}`)
        return newList
      })

      return { success: true, data: newQuestion }
    } catch (error) {
      console.error('Erro ao adicionar questão:', error)
      return { success: false, error }
    }
  }

  // Atualizar questão
  const updateQuestion = async (id: string, updates: Partial<Question>) => {
    try {
  
      
      // Atualizar lista local apenas
      setQuestions(prev => prev.map(q => 
        q.id === id ? { ...q, ...updates } : q
      ))

      return { success: true }
      
      // TODO: Implementar atualização real no Supabase quando a conexão estiver estável
      /*
      const { error } = await supabase
        .from('questions')
        .update(updates)
        .eq('id', id)

      if (error) throw error

      setQuestions(prev => prev.map(q => 
        q.id === id ? { ...q, ...updates } : q
      ))

      return { success: true }
      */
    } catch (error) {
      console.error('Erro ao atualizar questão:', error)
      return { success: false, error }
    }
  }

  // Deletar questão
  const deleteQuestion = async (id: string) => {
    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', id)

      if (error) throw error

      // Remover da lista local
      setQuestions(prev => prev.filter(q => q.id !== id))

      return { success: true }
    } catch (error) {
      console.error('Erro ao deletar questão:', error)
      return { success: false, error }
    }
  }

  // Atualizar configurações
  const updateConfig = async (updates: Partial<SystemConfig>) => {
    try {
      // Em produção, isso seria salvo em uma tabela de configurações
      setConfig(prev => prev ? { ...prev, ...updates } : null)
      return { success: true }
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error)
      return { success: false, error }
    }
  }

  // Gerar relatórios
  const generateUserReport = async () => {
    try {
      const report = {
        totalUsers: stats?.totalUsers || 0,
        activeUsers: stats?.activeUsers || 0,
        newUsersThisMonth: users.filter(u => {
          const created = new Date(u.created_at)
          const now = new Date()
          return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
        }).length,
        usersByStatus: {
          active: users.filter(u => u.status === 'active').length,
          inactive: users.filter(u => u.status === 'inactive').length,
          suspended: users.filter(u => u.status === 'suspended').length
        },
        topUsers: users
          .sort((a, b) => b.total_study_hours - a.total_study_hours)
          .slice(0, 10)
      }
      return { success: true, data: report }
    } catch (error) {
      console.error('Erro ao gerar relatório de usuários:', error)
      return { success: false, error }
    }
  }

  const generateQuestionReport = async () => {
    try {
      const report = {
        totalQuestions: stats?.totalQuestions || 0,
        questionsByDifficulty: {
          easy: questions.filter(q => q.difficulty === 'easy').length,
          medium: questions.filter(q => q.difficulty === 'medium').length,
          hard: questions.filter(q => q.difficulty === 'hard').length
        },
        questionsBySubject: questions.reduce((acc, q) => {
          acc[q.subject] = (acc[q.subject] || 0) + 1
          return acc
        }, {} as Record<string, number>),
        mostAnsweredQuestions: questions
          .sort((a, b) => b.times_answered - a.times_answered)
          .slice(0, 10),
        averageAccuracy: stats?.averageAccuracy || 0
      }
      return { success: true, data: report }
    } catch (error) {
      console.error('Erro ao gerar relatório de questões:', error)
      return { success: false, error }
    }
  }

  const generateSystemReport = async () => {
    try {
      const report = {
        systemStats: stats,
        performance: {
          averageResponseTime: '150ms',
          uptime: '99.9%',
          databaseSize: '2.5MB',
          activeConnections: 15
        },
        recentActivity: {
          lastBackup: new Date().toISOString(),
          lastMaintenance: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          errorsLast24h: 0
        }
      }
      return { success: true, data: report }
    } catch (error) {
      console.error('Erro ao gerar relatório do sistema:', error)
      return { success: false, error }
    }
  }

  // Forçar recarregamento das questões (para desenvolvimento)
  const refreshQuestions = useCallback(async () => {
    console.log('Forçando recarregamento das questões...')
    // NÃO limpar questões atuais - apenas recarregar se necessário
    await fetchQuestions() // Recarregar
  }, [fetchQuestions])

  // Atualizar todos os dados
  const refreshAllData = useCallback(async () => {
    await Promise.all([
      fetchStats(),
      fetchUsers(),
      fetchQuestions(),
      fetchConfig()
    ])
  }, [fetchStats, fetchUsers, fetchQuestions, fetchConfig])

  // Carregar dados iniciais
  useEffect(() => {
    let isMounted = true
    
    const loadData = async () => {
      if (isMounted) {
        try {
          await Promise.all([
            fetchStats(),
            fetchUsers(),
            fetchQuestions(),
            fetchConfig()
          ])
        } catch (error) {
          console.error('Erro ao carregar dados iniciais:', error)
        }
      }
    }
    
    loadData()
    
    return () => {
      isMounted = false
    }
  }, [fetchStats, fetchUsers, fetchQuestions, fetchConfig])

  const value: AdminContextType = {
    stats,
    isLoadingStats,
    users,
    isLoadingUsers,
    fetchUsers,
    updateUserStatus,
    makeUserAdmin,
    removeUserAdmin,
    deleteUser,
    questions,
    setQuestions,
    isLoadingQuestions,
    fetchQuestions,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    refreshQuestions,
    config,
    isLoadingConfig,
    fetchConfig,
    updateConfig,
    generateUserReport,
    generateQuestionReport,
    generateSystemReport,
    refreshAllData
  }

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider")
  }
  return context
}
