"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
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
  refreshStats: () => void
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
    try {
      const supabase = createClient()
      
      // Se não foi passado userId, tentar obter do auth
      let currentUserId = userId
      if (!currentUserId) {
        const { data: { user } } = await supabase.auth.getUser()
        currentUserId = user?.id
      }

      if (!currentUserId) {
        return { totalHours: 0, totalQuestions: 0, accuracy: 0 }
      }

      const { data: attempts, error } = await supabase
        .from('question_attempts')
        .select('*')
        .eq('user_id', currentUserId)
        .gte('attempted_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

      if (error) {
        return { totalHours: 0, totalQuestions: 0, accuracy: 0 }
      }

      if (!attempts || !Array.isArray(attempts)) {
        return { totalHours: 0, totalQuestions: 0, accuracy: 0 }
      }

      const totalQuestions = attempts.length
      const correctAnswers = attempts.filter(a => a.is_correct).length
      const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0
      const totalHours = totalQuestions * 2 / 60 // Estimativa: 2 minutos por questão

      return { totalHours, totalQuestions, accuracy }
    } catch (error) {
      return { totalHours: 0, totalQuestions: 0, accuracy: 0 }
    }
  }

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
      
      const subjects = Array.from(uniqueSubjects).map((subjectName: string) => ({
        id: subjectName, // Usar o nome como ID temporário
        name: subjectName,
        color: '#3B82F6' // Cor padrão
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
    refreshStats,
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
