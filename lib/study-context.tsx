"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { createClient } from "@/utils/supabase/client"
import type { Subject, Question, StudySession } from "./types"

interface DailyGoal {
  id: string
  title: string
  type: "daily" | "weekly" | "monthly"
  category: "questions" | "hours" | "exams"
  target: number
  current: number
  deadline: string
  completed: boolean
  subjects?: string[] // For hour-based goals
}

interface StudyContextType {
  studySessions: StudySession[]
  dailyGoals: DailyGoal[]
  setDailyGoals: (goals: DailyGoal[]) => void
  addStudySession: (session: Omit<StudySession, "id" | "date">) => void
  updateGoalProgress: (goalId: string, progress: number) => void
  createGoal: (goal: Omit<DailyGoal, "id" | "current" | "completed">) => void
  deleteGoal: (goalId: string) => void
  getTodayStudyTime: () => number
  getTodayQuestionsCount: () => Promise<number>
  getWeeklyStats: (userId?: string) => Promise<{ totalHours: number; totalQuestions: number; accuracy: number }>
  getSubjectProgress: (subject: string, userId?: string) => Promise<{ hours: number; questions: number; accuracy: number }>
  getSubjects: () => Promise<{ id: string; name: string; color: string }[]>
  refreshStats: () => void
  updateStudyTime: (minutes: number, subject?: string) => void
  syncPomodoroTime: (pomodoroTime: number) => void
}

const StudyContext = createContext<StudyContextType | undefined>(undefined)

export function StudyProvider({ children }: { children: ReactNode }) {
  const [studySessions, setStudySessions] = useState<StudySession[]>([])
  const [dailyGoals, setDailyGoals] = useState<DailyGoal[]>([])
  const [totalFocusTime, setTotalFocusTime] = useState(0)

  // Load data from localStorage
  useEffect(() => {
    const savedSessions = localStorage.getItem("study-sessions")
    const savedGoals = localStorage.getItem("daily-goals")

    if (savedSessions) {
      try {
        setStudySessions(JSON.parse(savedSessions))
      } catch (error) {
        console.error("Error loading study sessions:", error)
      }
    }

    if (savedGoals) {
      try {
        setDailyGoals(JSON.parse(savedGoals))
      } catch (error) {
        console.error("Error loading daily goals:", error)
      }
    } else {
      // Create default daily goals
      const defaultGoals: DailyGoal[] = [
        {
          id: "default-questions",
          title: "Questões Diárias",
          type: "daily",
          category: "questions",
          target: 50,
          current: 0,
          deadline: new Date().toISOString().split("T")[0],
          completed: false,
        },
        {
          id: "default-hours",
          title: "Horas de Estudo Diárias",
          type: "daily",
          category: "hours",
          target: 4,
          current: 0,
          deadline: new Date().toISOString().split("T")[0],
          completed: false,
        },
      ]
      setDailyGoals(defaultGoals)
    }
  }, [])

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem("study-sessions", JSON.stringify(studySessions))
  }, [studySessions])

  useEffect(() => {
    localStorage.setItem("daily-goals", JSON.stringify(dailyGoals))
  }, [dailyGoals])

  // Update hour-based goals when Pomodoro sessions are completed
  useEffect(() => {
    const todayHours = Math.floor((totalFocusTime / 60) * 100) / 100 // Convert to hours with 2 decimal places

    setDailyGoals((prev) =>
      prev.map((goal) => {
        if (goal.category === "hours" && goal.type === "daily") {
          return {
            ...goal,
            current: todayHours,
            completed: todayHours >= goal.target,
          }
        }
        return goal
      }),
    )

    // Disparar evento de atualização de estatísticas
    window.dispatchEvent(new CustomEvent('statsUpdated'))
  }, [totalFocusTime])

  const addStudySession = (session: Omit<StudySession, "id">) => {
    const newSession: StudySession = {
      ...session,
      id: Date.now().toString(),
    }

    setStudySessions((prev) => [...prev, newSession])

    // Update question-based goals
    if (session.questionsAnswered > 0) {
      setDailyGoals((prev) =>
        prev.map((goal) => {
          if (goal.category === "questions" && goal.type === "daily") {
            const newCurrent = goal.current + session.questionsAnswered
            return {
              ...goal,
              current: newCurrent,
              completed: newCurrent >= goal.target,
            }
          }
          return goal
        }),
      )
    }
  }

  const updateGoalProgress = (goalId: string, progress: number) => {
    setDailyGoals((prev) =>
      prev.map((goal) => {
        if (goal.id === goalId) {
          const newCurrent = Math.min(goal.current + progress, goal.target)
          return {
            ...goal,
            current: newCurrent,
            completed: newCurrent >= goal.target,
          }
        }
        return goal
      }),
    )
  }

  const createGoal = (goal: Omit<DailyGoal, "id" | "current" | "completed">) => {
    const newGoal: DailyGoal = {
      ...goal,
      id: Date.now().toString(),
      current: 0,
      completed: false,
    }
    setDailyGoals((prev) => [...prev, newGoal])
  }

  const deleteGoal = (goalId: string) => {
    setDailyGoals((prev) => prev.filter((goal) => goal.id !== goalId))
  }

  const getTodayStudyTime = () => {
    // Usar o tempo do Pomodoro convertido para horas
    return totalFocusTime / 60
  }

  const getTodayQuestionsCount = useCallback(async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user?.id) {
        return 0
      }

      const today = new Date().toISOString().split('T')[0]
      
      const { data, error } = await supabase
        .from('question_attempts')
        .select('id')
        .eq('user_id', user.id)
        .gte('attempted_at', today + 'T00:00:00')
        .lt('attempted_at', today + 'T23:59:59')

      if (error) {
        console.warn('Erro ao buscar questões de hoje:', error)
        return 0
      }

      return data?.length || 0
    } catch (error) {
      console.error('Erro em getTodayQuestionsCount:', error)
      return 0
    }
  }, [])

  const getWeeklyStats = useCallback(async (userId?: string) => {
    try {
      const supabase = createClient()
      
      let currentUserId = userId
      if (!currentUserId) {
        const { data: { user } } = await supabase.auth.getUser()
        currentUserId = user?.id
      }
      
      if (!currentUserId) {
        return { totalHours: 0, totalQuestions: 0, accuracy: 0 }
      }

      // Buscar tentativas da última semana
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      
      const { data, error } = await supabase
        .from('question_attempts')
        .select('*')
        .eq('user_id', currentUserId)
        .gte('attempted_at', oneWeekAgo)

      if (error) {
        console.error('❌ Erro ao buscar tentativas:', error)
        return { totalHours: 0, totalQuestions: 0, accuracy: 0 }
      }

      const attempts = data || []

      if (!attempts || !Array.isArray(attempts)) {
        return { totalHours: 0, totalQuestions: 0, accuracy: 0 }
      }

      const totalQuestions = attempts.length
      const correctAnswers = attempts.filter(a => a.is_correct).length
      const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0
      
      // Retornar apenas os dados do banco, o tempo do Pomodoro será adicionado pelos componentes
      return { totalHours: 0, totalQuestions, accuracy }
    } catch (error) {
      console.error('❌ Erro em getWeeklyStats:', {
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        userId: userId
      })
      return { totalHours: 0, totalQuestions: 0, accuracy: 0 }
    }
  }, [])

  const getSubjectProgress = useCallback(async (subject: string, userId?: string) => {
    try {
      const supabase = createClient()
      
      let currentUserId = userId
      if (!currentUserId) {
        const { data: { user } } = await supabase.auth.getUser()
        currentUserId = user?.id
      }
      
      if (!currentUserId) {
        return { hours: 0, questions: 0, accuracy: 0 }
      }
      
      // Buscar questões da matéria usando disciplina ou subject
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('id')
        .or('disciplina.eq.' + subject + ',subject.eq.' + subject)
      
      if (questionsError) {
        return { hours: 0, questions: 0, accuracy: 0 }
      }
      
      if (!questionsData || questionsData.length === 0) {
        return { hours: 0, questions: 0, accuracy: 0 }
      }
      
      // Pegar os IDs das questões
      const questionIds = questionsData.map(q => q.id)
      
      // Agora buscar as tentativas do usuário para essas questões
      const { data: attempts, error } = await supabase
        .from('question_attempts')
        .select('*')
        .eq('user_id', currentUserId)
        .in('question_id', questionIds)
      
      if (error) {
        return { hours: 0, questions: 0, accuracy: 0 }
      }
      
      if (!attempts || !Array.isArray(attempts)) {
        return { hours: 0, questions: 0, accuracy: 0 }
      }
      
      const questions = attempts.length
      const correct = attempts.filter(a => a.is_correct).length
      const accuracy = questions > 0 ? (correct / questions) * 100 : 0
      
      const hours = questions * 2 / 60
      
      return { hours, questions, accuracy }
    } catch (error) {
      return { hours: 0, questions: 0, accuracy: 0 }
    }
  }, [])

  const getSubjects = useCallback(async () => {
    try {
      const supabase = createClient()
      
      // Primeiro, tentar buscar da tabela subjects
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('subjects')
        .select('*')
        .order('name')
      
      if (!subjectsError && subjectsData && subjectsData.length > 0) {
        // Se subjects tem dados, usar subjects
        const subjects = subjectsData.map((subject: any) => ({
          id: subject.id,
          name: subject.name,
          color: subject.color || '#3B82F6'
        }))
        
        return subjects
      }
      
      // Se subjects não tem dados, buscar da tabela questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('disciplina, subject, assunto')
        .or('disciplina.not.is.null,subject.not.is.null')
      
      if (questionsError) {
        return []
      }
      
      if (!questionsData || !Array.isArray(questionsData) || questionsData.length === 0) {
        return []
      }
      
      // Extrair disciplinas únicas das questões
      const uniqueSubjects = new Set<string>()
      
      questionsData.forEach((question: any) => {
        if (question.disciplina) {
          uniqueSubjects.add(question.disciplina)
        }
        if (question.subject && question.subject !== question.disciplina) {
          uniqueSubjects.add(question.subject)
        }
      })
      
      const subjects = Array.from(uniqueSubjects).map((subjectName: string, index: number) => ({
        id: subjectName, // Usar o nome como ID temporário
        name: subjectName,
        color: [
          '#3B82F6', // Azul
          '#10B981', // Verde
          '#F59E0B', // Amarelo
          '#EF4444', // Vermelho
          '#8B5CF6', // Roxo
          '#06B6D4', // Ciano
          '#84CC16', // Verde lima
          '#F97316', // Laranja
          '#EC4899', // Rosa
          '#6366F1', // Índigo
        ][index % 10]
      }))
      
      return subjects
    } catch (error) {
      return []
    }
  }, [])

  // Função para forçar atualização das estatísticas
  const refreshStats = useCallback(() => {
    // Disparar evento customizado para notificar outros componentes
    window.dispatchEvent(new CustomEvent('statsUpdated'))
  }, [])

  // Função para atualizar o tempo de estudo
  const updateStudyTime = useCallback((minutes: number, subject?: string) => {
    // Atualizar tempo total de foco
    setTotalFocusTime(prev => prev + minutes)
    
    // Atualizar metas baseadas em horas
    setDailyGoals(prev => prev.map(goal => {
      if (goal.category === 'hours' && goal.type === 'daily') {
        const newTotalTime = totalFocusTime + minutes
        const currentHours = Math.floor((newTotalTime / 60) * 100) / 100
        return {
          ...goal,
          current: currentHours
        }
      }
      return goal
    }))
  }, [totalFocusTime])

  // Função para sincronizar tempo do pomodoro
  const syncPomodoroTime = useCallback((pomodoroTime: number) => {
    setTotalFocusTime(pomodoroTime)
    
    // Atualizar metas baseadas em horas
    setDailyGoals(prev => prev.map(goal => {
      if (goal.category === 'hours' && goal.type === 'daily') {
        const currentHours = Math.floor((pomodoroTime / 60) * 100) / 100
        return {
          ...goal,
          current: currentHours
        }
      }
      return goal
    }))
  }, [])

  const value: StudyContextType = {
            studySessions,
        dailyGoals,
        setDailyGoals,
        addStudySession,
        updateGoalProgress,
        createGoal,
        deleteGoal,
        getTodayStudyTime,
        getTodayQuestionsCount,
        getWeeklyStats,
        getSubjectProgress,
        getSubjects,
        refreshStats,
        updateStudyTime,
        syncPomodoroTime,
  }

  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>
}

export function useStudy() {
  const context = useContext(StudyContext)
  if (context === undefined) {
    throw new Error("useStudy must be used within a StudyProvider")
  }
  return context
}
