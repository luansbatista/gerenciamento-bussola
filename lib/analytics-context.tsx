"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"
import { useStudy } from "./study-context"
import { useCoach } from "./coach-context"
import { useAuth } from "./auth-context"
import { createClient } from "@/utils/supabase/client"

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
  getRanking: (period?: string, subject?: string) => Promise<StudentRanking[]>
  getQuestionStats: (userId?: string) => Promise<QuestionStats>
  getStudyAnalytics: (userId?: string) => Promise<StudyAnalytics>
  updateUserStats: (questionsAnswered: number, correctAnswers: number, timeSpent: number, subject: string) => void
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined)

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const { getWeeklyStats } = useStudy()
  const { studiedTopics } = useCoach()
  const { user } = useAuth()
  const [userStats, setUserStats] = useState<QuestionStats>({
    totalAnswered: 0,
    correctAnswers: 0,
    accuracy: 0,
    averageTime: 0,
    subjectBreakdown: {},
  })

  const getRanking = async (period = "month", subject = "all"): Promise<StudentRanking[]> => {
    const supabase = createClient()
    
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

  const getQuestionStats = async (userId?: string): Promise<QuestionStats> => {
    const supabase = createClient()
    
    // Se não foi passado userId, usar o usuário atual
    let currentUserId = userId
    if (!currentUserId) {
      currentUserId = user?.id
    }

    if (!currentUserId) {
      console.warn('getQuestionStats - Usuário não encontrado')
      return {
        totalAnswered: 0,
        correctAnswers: 0,
        accuracy: 0,
        averageTime: 0,
        subjectBreakdown: {}
      }
    }

    try {
      // Buscar estatísticas reais por disciplina do usuário
      const { data: subjectStats, error } = await supabase
        .from('question_attempts')
        .select(`
          *,
          questions!inner(
            subject_id,
            subjects!inner(name)
          )
        `)
        .eq('user_id', currentUserId)
        .gte('attempted_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

      if (error) {
        console.error('Erro ao buscar estatísticas por disciplina:', error)
        return {
          totalAnswered: 0,
          correctAnswers: 0,
          accuracy: 0,
          averageTime: 0,
          subjectBreakdown: {}
        }
      }

      // Calcular estatísticas por disciplina
      const breakdown: Record<string, { answered: number; correct: number; accuracy: number }> = {}
      let totalAnswered = 0
      let totalCorrect = 0
      
      subjectStats?.forEach(attempt => {
        const subjectName = attempt.questions?.subjects?.name || 'Geral'
        if (!breakdown[subjectName]) {
          breakdown[subjectName] = { answered: 0, correct: 0, accuracy: 0 }
        }
        breakdown[subjectName].answered++
        totalAnswered++
        if (attempt.is_correct) {
          breakdown[subjectName].correct++
          totalCorrect++
        }
      })

      // Calcular accuracy para cada disciplina
      Object.keys(breakdown).forEach(subjectName => {
        const stats = breakdown[subjectName]
        stats.accuracy = stats.answered > 0 ? Math.round((stats.correct / stats.answered) * 100) : 0
      })

      const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0

      return {
        totalAnswered,
        correctAnswers: totalCorrect,
        accuracy,
        averageTime: 2.5,
        subjectBreakdown: breakdown
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas de questões:', error)
      return {
        totalAnswered: 0,
        correctAnswers: 0,
        accuracy: 0,
        averageTime: 0,
        subjectBreakdown: {}
      }
    }
  }

  const getStudyAnalytics = async (userId?: string): Promise<StudyAnalytics> => {
    const supabase = createClient()
    
    // Se não foi passado userId, usar o usuário atual
    let currentUserId = userId
    if (!currentUserId) {
      currentUserId = user?.id
    }

    if (!currentUserId) {
      console.warn('getStudyAnalytics - Usuário não encontrado')
      return {
        dailyQuestions: [0, 0, 0, 0, 0, 0, 0],
        weeklyHours: [0, 0, 0, 0, 0, 0, 0],
        monthlyProgress: [],
        subjectDistribution: {},
        performanceTrend: "stable"
      }
    }

    try {
      // Buscar dados reais de estudo dos últimos 7 dias
      const { data: dailyData, error: dailyError } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', currentUserId)
        .gte('started_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('started_at', { ascending: true })

      // Buscar distribuição por disciplina
      const { data: subjectData, error: subjectError } = await supabase
        .from('question_attempts')
        .select(`
          *,
          questions!inner(
            subject_id,
            subjects!inner(name)
          )
        `)
        .eq('user_id', currentUserId)
        .gte('attempted_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

      // Calcular dados diários
      const dailyQuestions = [0, 0, 0, 0, 0, 0, 0]
      const dailyHours = [0, 0, 0, 0, 0, 0, 0]
      
      dailyData?.forEach(session => {
        const dayIndex = new Date(session.started_at).getDay()
        dailyQuestions[dayIndex] += session.questions_answered || 0
        dailyHours[dayIndex] += session.duration || 0
      })

      // Calcular distribuição por disciplina
      const subjectDistribution: Record<string, number> = {}
      let totalAttempts = 0
      
      subjectData?.forEach(attempt => {
        const subjectName = attempt.questions?.subjects?.name || 'Geral'
        subjectDistribution[subjectName] = (subjectDistribution[subjectName] || 0) + 1
        totalAttempts++
      })

      // Converter para porcentagens
      Object.keys(subjectDistribution).forEach(subjectName => {
        subjectDistribution[subjectName] = totalAttempts > 0 
          ? Math.round((subjectDistribution[subjectName] / totalAttempts) * 100) 
          : 0
      })

      return {
        dailyQuestions,
        weeklyHours: dailyHours,
        monthlyProgress: [],
        subjectDistribution,
        performanceTrend: "stable"
      }
    } catch (error) {
      console.error('Erro ao buscar analytics de estudo:', error)
      return {
        dailyQuestions: [0, 0, 0, 0, 0, 0, 0],
        weeklyHours: [0, 0, 0, 0, 0, 0, 0],
        monthlyProgress: [],
        subjectDistribution: {},
        performanceTrend: "stable"
      }
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
