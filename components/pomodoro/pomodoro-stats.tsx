import { Card, CardContent } from "@/components/ui/card"
import { Timer, Target, TrendingUp, Clock } from "lucide-react"

interface PomodoroStatsProps {
  sessionsToday: number
  totalMinutes: number
  averageSession: number
  streak: number
}

export function PomodoroStats({ sessionsToday, totalMinutes, averageSession, streak }: PomodoroStatsProps) {
  const stats = [
    {
      title: "Sessões Hoje",
      value: sessionsToday,
      icon: Timer,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Minutos Totais",
      value: totalMinutes,
      icon: Clock,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Média por Sessão",
      value: `${averageSession}min`,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Sequência",
      value: `${streak} dias`,
      icon: Target,
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
                <p className="text-lg font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
