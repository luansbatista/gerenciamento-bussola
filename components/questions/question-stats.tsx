import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, CheckCircle, Target, TrendingUp } from "lucide-react"

interface QuestionStatsProps {
  totalQuestions: number
  answeredCount: number
  correctCount: number
  isLoading?: boolean
}

export function QuestionStats({ totalQuestions, answeredCount, correctCount, isLoading = false }: QuestionStatsProps) {
  // Log para debug
  console.log('📊 QuestionStats recebeu:', { totalQuestions, answeredCount, correctCount, isLoading })
  
  const accuracyPercentage = answeredCount > 0 ? (correctCount / answeredCount) * 100 : 0
  const progressPercentage = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0

  // Garantir que os valores sejam números válidos
  const safeAnsweredCount = typeof answeredCount === 'number' ? answeredCount : 0
  const safeCorrectCount = typeof correctCount === 'number' ? correctCount : 0
  const safeAccuracyPercentage = safeAnsweredCount > 0 ? (safeCorrectCount / safeAnsweredCount) * 100 : 0

  const stats = [
    {
      title: "Total de Questões",
      value: totalQuestions,
      icon: BookOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Respondidas",
      value: safeAnsweredCount,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Acertos",
      value: safeCorrectCount,
      icon: Target,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Taxa de Acerto",
      value: `${Math.round(safeAccuracyPercentage)}%`,
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
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
                ) : (
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                )}
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">{stat.title}</p>
                {isLoading ? (
                  <div className="animate-pulse bg-gray-200 h-6 w-8 rounded"></div>
                ) : (
                  <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
