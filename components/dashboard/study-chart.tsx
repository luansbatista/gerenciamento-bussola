"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import dynamic from 'next/dynamic'

const BarChart = dynamic(() => import('recharts').then(mod => mod.BarChart), { ssr: false })
const Bar = dynamic(() => import('recharts').then(mod => mod.Bar), { ssr: false })
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false })
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false })
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false })
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false })
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false })
import { TrendingUp } from "lucide-react"
import { useStudy } from "@/lib/study-context"
import { useAuth } from "@/lib/auth-context"
import { usePomodoro } from "@/lib/pomodoro-context"
import { useState, useEffect } from "react"

export function StudyChart() {
  const { getWeeklyStats } = useStudy()
  const { user } = useAuth()
  const { totalFocusTime } = usePomodoro()
  const [weeklyData, setWeeklyData] = useState([
    { day: "Seg", hours: 0 },
    { day: "Ter", hours: 0 },
    { day: "Qua", hours: 0 },
    { day: "Qui", hours: 0 },
    { day: "Sex", hours: 0 },
    { day: "Sáb", hours: 0 },
    { day: "Dom", hours: 0 },
  ])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadWeeklyData = async () => {
      if (!user?.id) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const stats = await getWeeklyStats(user.id)
        
        // Adicionar o tempo do Pomodoro aos dados do banco
        const pomodoroHours = totalFocusTime / 60
        const totalHours = stats.totalHours + pomodoroHours
        const hoursPerDay = totalHours / 7
        
        const newData = [
          { day: "Seg", hours: Math.round(hoursPerDay * 10) / 10 },
          { day: "Ter", hours: Math.round(hoursPerDay * 10) / 10 },
          { day: "Qua", hours: Math.round(hoursPerDay * 10) / 10 },
          { day: "Qui", hours: Math.round(hoursPerDay * 10) / 10 },
          { day: "Sex", hours: Math.round(hoursPerDay * 10) / 10 },
          { day: "Sáb", hours: Math.round(hoursPerDay * 10) / 10 },
          { day: "Dom", hours: Math.round(hoursPerDay * 10) / 10 },
        ]
        
        setWeeklyData(newData)
      } catch (error) {
        console.error('Erro ao carregar dados semanais:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadWeeklyData()
  }, [user?.id, totalFocusTime])

  const totalHours = weeklyData.reduce((sum, day) => sum + day.hours, 0)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Horas de Estudo - Última Semana
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[200px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

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
            <BarChart data={weeklyData}>
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
