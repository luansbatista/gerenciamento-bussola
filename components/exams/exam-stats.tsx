import { Card, CardContent } from "@/components/ui/card"
import { Trophy, Clock, Target, TrendingUp } from "lucide-react"

export function ExamStats() {
  const stats = [
    {
      title: "Simulados Realizados",
      value: 0,
      icon: Trophy,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Tempo Médio",
      value: "--",
      icon: Clock,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Melhor Resultado",
      value: "--",
      icon: Target,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Média Geral",
      value: "--",
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
                <p className="text-lg font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
