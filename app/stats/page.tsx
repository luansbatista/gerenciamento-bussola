"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Target, Clock, BookOpen, Trophy, Calendar, TrendingUp, Award, Zap } from "lucide-react"
import { useAnalytics } from "@/lib/analytics-context"
import { useStudy } from "@/lib/study-context"
import { useCoach } from "@/lib/coach-context"
import { useAuth } from "@/lib/auth-context"
import { useState, useEffect } from "react"

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

export default function StatsPage() {
  const { getQuestionStats, getStudyAnalytics } = useAnalytics()
  const { getWeeklyStats } = useStudy()
  const { studiedTopics } = useCoach()
  const { user } = useAuth()
  
  const [questionStats, setQuestionStats] = useState<QuestionStats>({
    totalAnswered: 0,
    correctAnswers: 0,
    accuracy: 0,
    averageTime: 0,
    subjectBreakdown: {}
  })
  const [studyAnalytics, setStudyAnalytics] = useState<StudyAnalytics>({
    dailyQuestions: [0, 0, 0, 0, 0, 0, 0],
    weeklyHours: [0, 0, 0, 0, 0, 0, 0],
    monthlyProgress: [],
    subjectDistribution: {},
    performanceTrend: "stable"
  })
  const [weeklyStats, setWeeklyStats] = useState({
    totalHours: 0,
    totalQuestions: 0,
    accuracy: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      if (!user?.id) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        
        // Carregar estatísticas em paralelo
        const [questionStatsData, studyAnalyticsData, weeklyStatsData] = await Promise.all([
          getQuestionStats(user.id),
          getStudyAnalytics(user.id),
          getWeeklyStats(user.id)
        ])

        setQuestionStats(questionStatsData)
        setStudyAnalytics(studyAnalyticsData)
        setWeeklyStats(weeklyStatsData)
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [user?.id, getQuestionStats, getStudyAnalytics, getWeeklyStats])

  const subjectStats = Object.entries(questionStats.subjectBreakdown).map(([subject, stats]) => ({
    name: subject,
    ...stats,
    progress: stats.answered > 0 ? Math.round((stats.correct / stats.answered) * 100) : 0,
  }))

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg">Carregando estatísticas...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Animated Header */}
      <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-float"></div>
          <div className="absolute top-32 right-20 w-16 h-16 bg-white/10 rounded-full animate-float-delayed"></div>
          <div className="absolute bottom-10 left-1/3 w-12 h-12 bg-white/10 rounded-full animate-bounce-subtle"></div>
        </div>
        <div className="relative z-10 px-8 py-12">
          <div className="flex items-center space-x-3 animate-fade-in-up">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 animate-pulse-subtle">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                Estatísticas de Desempenho
              </h1>
              <p className="text-blue-100 text-lg">Acompanhe seu progresso e evolução nos estudos</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Overview Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "Questões Respondidas",
              value: questionStats.totalAnswered,
              subtitle: `${questionStats.correctAnswers} corretas`,
              icon: BookOpen,
              color: "from-blue-500 to-blue-600",
            },
            {
              title: "Taxa de Acerto",
              value: `${questionStats.accuracy.toFixed(1)}%`,
              subtitle: `${questionStats.correctAnswers} de ${questionStats.totalAnswered}`,
              icon: Target,
              color: "from-green-500 to-green-600",
            },
            {
              title: "Horas de Estudo",
              value: weeklyStats.totalHours.toFixed(1),
              subtitle: "nesta semana",
              icon: Clock,
              color: "from-purple-500 to-purple-600",
            },
            {
              title: "Tópicos Estudados",
              value: studiedTopics.length,
              subtitle: "diferentes assuntos",
              icon: Trophy,
              color: "from-yellow-500 to-yellow-600",
            },
          ].map((stat, index) => (
            <Card
              key={index}
              className="shadow-xl border-0 bg-white/90 backdrop-blur-sm hover:shadow-2xl hover:scale-105 transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`bg-gradient-to-r ${stat.color} p-2 rounded-lg`}>
                  <stat.icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Subject Performance */}
        <Card
          className="shadow-xl border-0 bg-white/90 backdrop-blur-sm animate-fade-in-up"
          style={{ animationDelay: "400ms" }}
        >
          <CardHeader className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10">
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span>Desempenho por Matéria</span>
            </CardTitle>
            <CardDescription>Progresso e taxa de acerto em cada disciplina</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            {subjectStats.length > 0 ? (
              subjectStats.map((subject, index) => (
                <div
                  key={subject.name}
                  className="space-y-2 animate-fade-in-right"
                  style={{ animationDelay: `${500 + index * 100}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{subject.name}</h4>
                      <Badge
                        className={
                          subject.accuracy >= 70
                            ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
                            : subject.accuracy >= 60
                              ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white"
                              : "bg-gradient-to-r from-red-500 to-red-600 text-white"
                        }
                      >
                        {subject.accuracy.toFixed(0)}% acerto
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">{subject.answered} questões</span>
                  </div>
                  <Progress value={subject.progress} className="h-3" />
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Nenhuma questão respondida ainda</p>
                <p className="text-sm text-muted-foreground">Comece a estudar para ver suas estatísticas por matéria</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Study Activity */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card
            className="shadow-xl border-0 bg-white/90 backdrop-blur-sm animate-fade-in-up"
            style={{ animationDelay: "600ms" }}
          >
            <CardHeader className="bg-gradient-to-r from-purple-500/10 to-pink-500/10">
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                <span>Atividade Semanal</span>
              </CardTitle>
              <CardDescription>Questões respondidas por dia</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {studyAnalytics.dailyQuestions.length > 0 && studyAnalytics.dailyQuestions.some((q) => q > 0) ? (
                  <div className="grid grid-cols-7 gap-2">
                    {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day, index) => (
                      <div key={day} className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">{day}</div>
                        <div
                          className={`h-8 rounded flex items-center justify-center text-xs font-medium ${
                            studyAnalytics.dailyQuestions[index] > 0
                              ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {studyAnalytics.dailyQuestions[index]}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32 text-muted-foreground">
                    <div className="text-center">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Calendar className="h-6 w-6 text-white" />
                      </div>
                      <p className="text-sm">Nenhuma atividade registrada</p>
                      <p className="text-xs">Comece a estudar para ver suas estatísticas</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card
            className="shadow-xl border-0 bg-white/90 backdrop-blur-sm animate-fade-in-up"
            style={{ animationDelay: "700ms" }}
          >
            <CardHeader className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10">
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-yellow-600" />
                <span>Tendência de Performance</span>
              </CardTitle>
              <CardDescription>Evolução do seu desempenho</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Tendência Atual:</span>
                  <Badge
                    className={
                      studyAnalytics.performanceTrend === "improving"
                        ? "bg-green-100 text-green-800"
                        : studyAnalytics.performanceTrend === "stable"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-red-100 text-red-800"
                    }
                  >
                    {studyAnalytics.performanceTrend === "improving" && <TrendingUp className="w-3 h-3 mr-1" />}
                    {studyAnalytics.performanceTrend === "stable" && <Target className="w-3 h-3 mr-1" />}
                    {studyAnalytics.performanceTrend === "declining" && (
                      <TrendingUp className="w-3 h-3 mr-1 rotate-180" />
                    )}
                    {studyAnalytics.performanceTrend === "improving"
                      ? "Melhorando"
                      : studyAnalytics.performanceTrend === "stable"
                        ? "Estável"
                        : "Em declínio"}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso Mensal:</span>
                    <span className="font-medium">
                      {studyAnalytics.monthlyProgress[studyAnalytics.monthlyProgress.length - 1]}%
                    </span>
                  </div>
                  <Progress
                    value={studyAnalytics.monthlyProgress[studyAnalytics.monthlyProgress.length - 1]}
                    className="h-2"
                  />
                </div>

                {weeklyStats.totalQuestions === 0 && studiedTopics.length === 0 ? (
                  <div className="text-center py-4">
                    <div className="bg-gradient-to-r from-yellow-500 to-orange-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Zap className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-sm text-muted-foreground">Comece a estudar para acompanhar sua evolução</p>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-sm font-medium">Continue assim!</p>
                    <p className="text-xs text-muted-foreground">Sua dedicação está gerando resultados</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
