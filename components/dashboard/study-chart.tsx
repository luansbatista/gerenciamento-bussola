"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { TrendingUp } from "lucide-react"
import { useStudy } from "@/lib/study-context"

export function StudyChart() {
  const { getWeeklyStats } = useStudy()
  const weeklyStats = getWeeklyStats()
  
  // Buscar dados reais da semana atual
  const data = [
    { day: "Seg", hours: weeklyStats.dailyHours?.monday || 0 },
    { day: "Ter", hours: weeklyStats.dailyHours?.tuesday || 0 },
    { day: "Qua", hours: weeklyStats.dailyHours?.wednesday || 0 },
    { day: "Qui", hours: weeklyStats.dailyHours?.thursday || 0 },
    { day: "Sex", hours: weeklyStats.dailyHours?.friday || 0 },
    { day: "Sáb", hours: weeklyStats.dailyHours?.saturday || 0 },
    { day: "Dom", hours: weeklyStats.dailyHours?.sunday || 0 },
  ]

  const totalHours = data.reduce((sum, day) => sum + day.hours, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-600" />
          Horas de Estudo - Última Semana
        </CardTitle>
      </CardHeader>
      <CardContent>
        {totalHours === 0 ? (
          <div className="flex items-center justify-center h-[200px] text-gray-500">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>Nenhuma sessão de estudo registrada ainda</p>
              <p className="text-sm">Comece estudando para ver seu progresso aqui</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value}h`, "Horas estudadas"]} labelStyle={{ color: "#374151" }} />
              <Bar dataKey="hours" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
