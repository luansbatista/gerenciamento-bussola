"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"
import { useStudy } from "./study-context"
import { useCoach } from "./coach-context"

interface StudentRanking {
  id: string
  name: string
  email: string
  score: number
  questionsAnswered: number
  accuracy: number
  studyHours: number
  position: number
  avatar?: string
  streak: number
}

interface QuestionStats {
  totalAnswered: number
  correctAnswers: number
  accuracy: number
  averageTime: number
  subjectBreakdown: Record<
    string,
    {
      answered: number
      correct: number
      accuracy: number
    }
  >
}

interface StudyAnalytics {
  dailyQuestions: number[]
  weeklyHours: number[]
  monthlyProgress: number[]
  subjectDistribution: Record<string, number>
  performanceTrend: "improving" | "stable" | "declining"
}

interface AnalyticsContextType {
  getRanking: (period?: string, subject?: string) => StudentRanking[]
  getQuestionStats: () => QuestionStats
  getStudyAnalytics: () => StudyAnalytics
  updateUserStats: (questionsAnswered: number, correctAnswers: number, timeSpent: number, subject: string) => void
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined)

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const { getWeeklyStats } = useStudy()
  const { studiedTopics } = useCoach()
  const [userStats, setUserStats] = useState<QuestionStats>({
    totalAnswered: 0,
    correctAnswers: 0,
    accuracy: 0,
    averageTime: 0,
    subjectBreakdown: {},
  })

  const getRanking = async (period = "month", subject = "all"): Promise<StudentRanking[]> => {
    const weeklyStats = getWeeklyStats()

    // Calculate user's score based on questions answered and accuracy
    const userScore = Math.round(weeklyStats.totalQuestions * (weeklyStats.accuracy / 100))

    try {
      // Buscar ranking real do banco de dados
      const { data: rankings, error } = await supabase
        .from('profiles')
        .select('id, name, email, total_questions_answered, accuracy_rate, total_study_hours, current_streak')
        .order('total_questions_answered', { ascending: false })
        .limit(10)

      if (error) {
        console.error('Erro ao buscar ranking:', error)
        return []
      }

    const rankingsList: StudentRanking[] = rankings?.map((user, index) => ({
      id: user.id,
      name: user.name || 'Usuário',
      email: user.email || '',
      score: Math.round((user.total_questions_answered || 0) * ((user.accuracy_rate || 0) / 100)),
      questionsAnswered: user.total_questions_answered || 0,
      accuracy: user.accuracy_rate || 0,
      studyHours: user.total_study_hours || 0,
      position: index + 1,
      streak: user.current_streak || 0,
    })) || []

      return rankingsList
    } catch (error) {
      console.error('Erro ao buscar ranking:', error)
      return []
    }
  }

  const getQuestionStats = async (): Promise<QuestionStats> => {
    const weeklyStats = getWeeklyStats()

    // Buscar estatísticas reais por disciplina
    const { data: subjectStats, error } = await supabase
      .from('question_attempts')
      .select(`
        *,
        questions!inner(disciplina)
      `)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

    if (error) {
      console.error('Erro ao buscar estatísticas por disciplina:', error)
      return {
        totalAnswered: weeklyStats.totalQuestions,
        correctAnswers: Math.round(weeklyStats.totalQuestions * (weeklyStats.accuracy / 100)),
        accuracy: weeklyStats.accuracy,
        averageTime: 2.5,
        subjectBreakdown: {}
      }
    }

    // Calcular estatísticas por disciplina
    const breakdown: Record<string, { answered: number; correct: number; accuracy: number }> = {}
    
    subjectStats?.forEach(attempt => {
      const disciplina = attempt.questions?.disciplina || 'Geral'
      if (!breakdown[disciplina]) {
        breakdown[disciplina] = { answered: 0, correct: 0, accuracy: 0 }
      }
      breakdown[disciplina].answered++
      if (attempt.is_correct) {
        breakdown[disciplina].correct++
      }
    })

    // Calcular accuracy para cada disciplina
    Object.keys(breakdown).forEach(disciplina => {
      const stats = breakdown[disciplina]
      stats.accuracy = stats.answered > 0 ? Math.round((stats.correct / stats.answered) * 100) : 0
    })

    return {
      totalAnswered: weeklyStats.totalQuestions,
      correctAnswers: Math.round(weeklyStats.totalQuestions * (weeklyStats.accuracy / 100)),
      accuracy: weeklyStats.accuracy,
      averageTime: 2.5,
      subjectBreakdown: breakdown
    }
  }

  const getStudyAnalytics = async (): Promise<StudyAnalytics> => {
    const weeklyStats = getWeeklyStats()

    // Buscar dados reais de estudo dos últimos 7 dias
    const { data: dailyData, error: dailyError } = await supabase
      .from('study_sessions')
      .select('*')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: true })

    // Buscar distribuição por disciplina
    const { data: subjectData, error: subjectError } = await supabase
      .from('question_attempts')
      .select(`
        *,
        questions!inner(disciplina)
      `)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

    // Calcular dados diários
    const dailyQuestions = [0, 0, 0, 0, 0, 0, 0]
    const dailyHours = [0, 0, 0, 0, 0, 0, 0]
    
    dailyData?.forEach(session => {
      const dayIndex = new Date(session.created_at).getDay()
      dailyQuestions[dayIndex] += session.questions_answered || 0
      dailyHours[dayIndex] += session.duration_minutes || 0
    })

    // Calcular distribuição por disciplina
    const subjectDistribution: Record<string, number> = {}
    let totalAttempts = 0
    
    subjectData?.forEach(attempt => {
      const disciplina = attempt.questions?.disciplina || 'Geral'
      subjectDistribution[disciplina] = (subjectDistribution[disciplina] || 0) + 1
      totalAttempts++
    })

    // Converter para porcentagens
    Object.keys(subjectDistribution).forEach(disciplina => {
      subjectDistribution[disciplina] = Math.round((subjectDistribution[disciplina] / totalAttempts) * 100)
    })

    return {
      dailyQuestions,
      weeklyHours: dailyHours,
      monthlyProgress: [65, 72, 78, 85], // Mantido como fallback
      subjectDistribution,
      performanceTrend: weeklyStats.accuracy > 75 ? "improving" : weeklyStats.accuracy > 60 ? "stable" : "declining",
    }
  }

  const updateUserStats = (questionsAnswered: number, correctAnswers: number, timeSpent: number, subject: string) => {
    setUserStats((prev) => ({
      ...prev,
      totalAnswered: prev.totalAnswered + questionsAnswered,
      correctAnswers: prev.correctAnswers + correctAnswers,
      accuracy: ((prev.correctAnswers + correctAnswers) / (prev.totalAnswered + questionsAnswered)) * 100,
      averageTime: (prev.averageTime + timeSpent) / 2,
      subjectBreakdown: {
        ...prev.subjectBreakdown,
        [subject]: {
          answered: (prev.subjectBreakdown[subject]?.answered || 0) + questionsAnswered,
          correct: (prev.subjectBreakdown[subject]?.correct || 0) + correctAnswers,
          accuracy:
            (((prev.subjectBreakdown[subject]?.correct || 0) + correctAnswers) /
              ((prev.subjectBreakdown[subject]?.answered || 0) + questionsAnswered)) *
            100,
        },
      },
    }))
  }

  return (
    <AnalyticsContext.Provider
      value={{
        getRanking,
        getQuestionStats,
        getStudyAnalytics,
        updateUserStats,
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  )
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext)
  if (context === undefined) {
    throw new Error("useAnalytics must be used within an AnalyticsProvider")
  }
  return context
}
