import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Clock, Target, TrendingUp } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useStudy } from "@/lib/study-context"

export function StatsCards() {
  const { user } = useAuth()
  const { getWeeklyStats } = useStudy()
  
  const weeklyStats = getWeeklyStats()
  
  // Buscar dados reais do usuário
  const totalStudyHours = user?.totalStudyHours || 0
  const currentStreak = user?.currentStreak || 0
  const totalQuestionsAnswered = weeklyStats.totalQuestions || 0
  const accuracyRate = weeklyStats.accuracy || 0

  const stats = [
    {
      title: "Horas Estudadas",
      value: totalStudyHours,
      unit: "h",
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Sequência Atual",
      value: currentStreak,
      unit: "dias",
      icon: Target,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Questões Resolvidas",
      value: totalQuestionsAnswered,
      unit: "",
      icon: BookOpen,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Taxa de Acerto",
      value: Math.round(accuracyRate),
      unit: "%",
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
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
