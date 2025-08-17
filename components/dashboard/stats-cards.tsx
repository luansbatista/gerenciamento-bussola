import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Clock, Target, TrendingUp } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useStudy } from "@/lib/study-context"
import { useState, useEffect } from "react"

export function StatsCards() {
  const { user } = useAuth()
  const { getWeeklyStats } = useStudy()
  const [stats, setStats] = useState({
    totalStudyHours: 0,
    currentStreak: 0,
    totalQuestionsAnswered: 0,
    accuracyRate: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  const loadStats = async () => {
    if (!user) {
      setIsLoading(false)
      return
    }

    // Timeout de segurança para evitar loading infinito
    const timeoutId = setTimeout(() => {
      setIsLoading(false)
      setStats({
        totalStudyHours: 0,
        currentStreak: user.currentStreak || 0,
        totalQuestionsAnswered: 0,
        accuracyRate: 0
      })
    }, 5000) // 5 segundos

    try {
      setIsLoading(true)
      const weeklyStats = await getWeeklyStats(user.id)
      
      setStats({
        totalStudyHours: weeklyStats.totalHours,
        currentStreak: user.currentStreak || 0,
        totalQuestionsAnswered: weeklyStats.totalQuestions,
        accuracyRate: weeklyStats.accuracy
      })
      clearTimeout(timeoutId)
    } catch (error) {
      // Manter dados padrão em caso de erro
      setStats({
        totalStudyHours: 0,
        currentStreak: user.currentStreak || 0,
        totalQuestionsAnswered: 0,
        accuracyRate: 0
      })
      clearTimeout(timeoutId)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [user?.id]) // Usar apenas user.id para evitar loops

  // Escutar evento de atualização de estatísticas
  useEffect(() => {
    const handleStatsUpdate = () => {
      loadStats()
    }

    window.addEventListener('statsUpdated', handleStatsUpdate)
    
    return () => {
      window.removeEventListener('statsUpdated', handleStatsUpdate)
    }
  }, [user?.id])

  const statsData = [
    {
      title: "Horas Estudadas",
      value: Math.round(stats.totalStudyHours * 10) / 10,
      unit: "h",
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Sequência Atual",
      value: stats.currentStreak,
      unit: "dias",
      icon: Target,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Questões Resolvidas",
      value: stats.totalQuestionsAnswered,
      unit: "",
      icon: BookOpen,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Taxa de Acerto",
      value: Math.round(stats.accuracyRate),
      unit: "%",
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statsData.map((stat) => (
        <Card key={stat.title}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">{stat.title}</p>
                <p className="text-lg font-bold text-gray-900">
                  {stat.value}
                  {stat.unit}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
