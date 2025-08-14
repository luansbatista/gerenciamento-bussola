"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { usePomodoro } from "./pomodoro-context"
import { createClient } from "@/utils/supabase/client"

interface StudySession {
  id: string
  subject: string
  topic: string
  duration: number // in minutes
  questionsAnswered: number
  correctAnswers: number
  date: string
  type: "pomodoro" | "questions" | "exam"
}

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
  addStudySession: (session: Omit<StudySession, "id" | "date">) => void
  updateGoalProgress: (goalId: string, progress: number) => void
  createGoal: (goal: Omit<DailyGoal, "id" | "current" | "completed">) => void
  deleteGoal: (goalId: string) => void
  getTodayStudyTime: () => number
  getTodayQuestionsCount: () => number
  getWeeklyStats: (userId?: string) => Promise<{ totalHours: number; totalQuestions: number; accuracy: number }>
  getSubjectProgress: (subject: string, userId?: string) => Promise<{ hours: number; questions: number; accuracy: number }>
  getSubjects: () => Promise<{ id: string; name: string; color: string }[]>
}

const StudyContext = createContext<StudyContextType | undefined>(undefined)

export function StudyProvider({ children }: { children: ReactNode }) {
  const [studySessions, setStudySessions] = useState<StudySession[]>([])
  const [dailyGoals, setDailyGoals] = useState<DailyGoal[]>([])
  const { totalFocusTime, sessionsCompleted } = usePomodoro()

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
  }, [totalFocusTime])

  const addStudySession = (session: Omit<StudySession, "id" | "date">) => {
    const newSession: StudySession = {
      ...session,
      id: Date.now().toString(),
      date: new Date().toISOString(),
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
    const today = new Date().toDateString()
    return studySessions
      .filter((session) => new Date(session.date).toDateString() === today)
      .reduce((total, session) => total + session.duration, 0)
  }

  const getTodayQuestionsCount = () => {
    const today = new Date().toDateString()
    return studySessions
      .filter((session) => new Date(session.date).toDateString() === today)
      .reduce((total, session) => total + session.questionsAnswered, 0)
  }

  const getWeeklyStats = async (userId?: string) => {
    console.log('StudyContext - getWeeklyStats iniciado para usuário:', userId)
    try {
      const supabase = createClient()
      
      // Se não foi passado userId, tentar obter do auth
      let currentUserId = userId
      if (!currentUserId) {
        const { data: { user } } = await supabase.auth.getUser()
        currentUserId = user?.id
      }

      if (!currentUserId) {
        console.warn('StudyContext - getWeeklyStats: Nenhum usuário fornecido')
        return { totalHours: 0, totalQuestions: 0, accuracy: 0 }
      }

      console.log('StudyContext - getWeeklyStats: Buscando tentativas para usuário:', currentUserId)

      const { data: attempts, error } = await supabase
        .from('question_attempts')
        .select('*')
        .eq('user_id', currentUserId)
        .gte('attempted_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

      if (error) {
        console.error('StudyContext - getWeeklyStats: Erro ao buscar tentativas:', error)
        return { totalHours: 0, totalQuestions: 0, accuracy: 0 }
      }

      console.log('StudyContext - getWeeklyStats: Tentativas encontradas:', attempts?.length || 0)

      if (!attempts || !Array.isArray(attempts)) {
        console.warn('StudyContext - getWeeklyStats: Dados de tentativas não encontrados ou formato inválido')
        return { totalHours: 0, totalQuestions: 0, accuracy: 0 }
      }

      const totalQuestions = attempts.length
      const correctAnswers = attempts.filter(a => a.is_correct).length
      const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0
      const totalHours = totalQuestions * 2 / 60 // Estimativa: 2 minutos por questão

      const result = { totalHours, totalQuestions, accuracy }
      console.log('StudyContext - getWeeklyStats: Resultado:', result)
      return result
    } catch (error) {
      console.error('StudyContext - getWeeklyStats: Erro geral:', error)
      return { totalHours: 0, totalQuestions: 0, accuracy: 0 }
    }
  }

  const getSubjectProgress = async (subject: string, userId?: string) => {
    try {
      const supabase = createClient()
      
      // Se não foi passado userId, tentar obter do auth
      let currentUserId = userId
      if (!currentUserId) {
        const { data: { user } } = await supabase.auth.getUser()
        currentUserId = user?.id
      }

      console.log('getSubjectProgress - Buscando progresso para matéria:', subject, 'usuário:', currentUserId)

      if (!currentUserId) {
        console.warn('getSubjectProgress - Usuário não encontrado')
        return { hours: 0, questions: 0, accuracy: 0 }
      }

      // Buscar tentativas de questões por matéria do usuário atual
      const { data: attempts, error } = await supabase
        .from('question_attempts')
        .select(`
          *,
          questions!inner(
            subject_id,
            subjects!inner(name)
          )
        `)
        .eq('user_id', currentUserId)
        .eq('questions.subjects.name', subject)

      if (error) {
        console.error('Erro ao buscar progresso da matéria:', error)
        return { hours: 0, questions: 0, accuracy: 0 }
      }

      console.log('getSubjectProgress - Tentativas encontradas para', subject, ':', attempts)

      // Verificar se attempts existe e é um array
      if (!attempts || !Array.isArray(attempts)) {
        console.warn('Dados de tentativas não encontrados ou formato inválido para', subject)
        return { hours: 0, questions: 0, accuracy: 0 }
      }

      const questions = attempts.length
      const correct = attempts.filter(a => a.is_correct).length
      const accuracy = questions > 0 ? (correct / questions) * 100 : 0

      // Calcular horas de estudo (estimativa baseada em tempo médio por questão)
      const hours = questions * 2 / 60 // 2 minutos por questão

      console.log('getSubjectProgress - Resultados para', subject, ':', { hours, questions, accuracy })

      return { hours, questions, accuracy }
    } catch (error) {
      console.error('Erro ao buscar progresso da matéria:', error)
      return { hours: 0, questions: 0, accuracy: 0 }
    }
  }

  const getSubjects = async () => {
    console.log('StudyContext - getSubjects iniciado')
    try {
      const supabase = createClient()
      
      console.log('StudyContext - getSubjects: Fazendo consulta ao banco...')
      
      // Buscar disciplinas que realmente existem através das questões cadastradas
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select(`
          subject_id,
          subjects!inner(
            id,
            name,
            color
          )
        `)
        .not('subject_id', 'is', null)

      console.log('StudyContext - getSubjects - Questões encontradas:', questionsData?.length || 0)
      console.log('StudyContext - getSubjects - Erro (se houver):', questionsError)
      console.log('StudyContext - getSubjects - Dados brutos (primeiros 3):', questionsData?.slice(0, 3))
      console.log('StudyContext - getSubjects - Estrutura da primeira questão:', questionsData?.[0])

      if (questionsError) {
        console.error('Erro ao buscar questões:', questionsError)
        console.error('Detalhes do erro:', {
          message: questionsError.message,
          details: questionsError.details,
          hint: questionsError.hint,
          code: questionsError.code
        })
        return []
      }

      if (!questionsData || !Array.isArray(questionsData) || questionsData.length === 0) {
        console.warn('StudyContext - getSubjects: Nenhuma questão encontrada no banco')
        return []
      }

      // Extrair disciplinas únicas baseadas nas questões cadastradas
      const uniqueSubjects = new Map()
      
      questionsData.forEach((question: any, index: number) => {
        console.log(`StudyContext - getSubjects - Processando questão ${index + 1}:`, question)
        if (question.subjects && question.subjects.id) {
          const subject = question.subjects
          console.log(`StudyContext - getSubjects - Disciplina encontrada:`, subject)
          if (!uniqueSubjects.has(subject.id)) {
            uniqueSubjects.set(subject.id, {
              id: subject.id,
              name: subject.name,
              color: subject.color
            })
          }
        } else {
          console.warn(`StudyContext - getSubjects - Questão ${index + 1} sem disciplina válida:`, question)
        }
      })

      const subjects = Array.from(uniqueSubjects.values())
      console.log('StudyContext - getSubjects - Disciplinas únicas encontradas:', subjects)
      console.log('StudyContext - getSubjects - Total de disciplinas:', subjects.length)

      return subjects
    } catch (error) {
      console.error('Erro ao buscar disciplinas:', error)
      console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace')
      return []
    }
  }

  const value: StudyContextType = {
    studySessions,
    dailyGoals,
    addStudySession,
    updateGoalProgress,
    createGoal,
    deleteGoal,
    getTodayStudyTime,
    getTodayQuestionsCount,
    getWeeklyStats,
    getSubjectProgress,
    getSubjects,
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
