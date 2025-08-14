"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Clock, Target, TrendingUp, Users, Sparkles, Zap } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useStudy } from "@/lib/study-context"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { SubjectProgress } from "@/components/dashboard/subject-progress"
import { StudyChart } from "@/components/dashboard/study-chart"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { TodayGoals } from "@/components/dashboard/today-goals"

export default function DashboardPage() {
  const { user } = useAuth()
  const { getWeeklyStats } = useStudy()

  if (!user) return null

  const weeklyStats = getWeeklyStats()
  const todayStudyHours = weeklyStats.todayHours || 0
  const dailyGoal = user.studyGoal || 4
  const progressPercentage = dailyGoal > 0 ? (todayStudyHours / dailyGoal) * 100 : 0

  return (
    <div>
      <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-transparent"></div>

        <div className="relative px-8 py-12 animate-fade-in-up">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg animate-bounce-subtle">
              <Sparkles className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-blue-100 text-lg mt-2">
                Transforme seus estudos em conquistas. Acompanhe seu progresso rumo à aprovação na PMBA
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 px-8 py-8 space-y-8">
        <div className="animate-fade-in-up delay-100">
          <StatsCards />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna principal */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="shadow-soft border-0 hover:shadow-lg transition-all duration-300 animate-fade-in-up animation-delay-200">
              <CardHeader className="pb-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-4 text-2xl font-bold text-slate-800">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg animate-pulse-subtle">
                      <Target className="h-6 w-6 text-white" />
                    </div>
                    Progresso Diário
                    <Zap className="h-5 w-5 text-yellow-500 animate-bounce" />
                  </CardTitle>
                  <Badge className="text-lg font-bold px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white animate-pulse-subtle">
                    {Math.round(progressPercentage)}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between text-base font-medium">
                    <span className="text-slate-600">Meta: {dailyGoal}h</span>
                    <span className="font-bold text-slate-800">{todayStudyHours}h estudadas</span>
                  </div>
                  <Progress value={progressPercentage} className="h-4" />
                </div>
                <div className="flex items-center gap-8 text-base">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Clock className="h-5 w-5" />
                    <span className="font-medium">Restam {Math.max(0, dailyGoal - todayStudyHours).toFixed(1)}h</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <TrendingUp className="h-5 w-5" />
                    <span className="font-medium">Sequência: {user.currentStreak} dias</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="animate-fade-in-up animation-delay-300">
              <StudyChart />
            </div>

            <div className="animate-fade-in-up animation-delay-400">
              <SubjectProgress />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="animate-fade-in-up animation-delay-500">
              <QuickActions />
            </div>

            <div className="animate-fade-in-up animation-delay-600">
              <TodayGoals />
            </div>

            <Card className="shadow-soft border-0 hover:shadow-lg transition-all duration-300 animate-fade-in-up animation-delay-700">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-4 text-2xl font-bold text-slate-800">
                  <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg animate-pulse-subtle">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  Atividade Recente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 animate-fade-in">
                  <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg animate-bounce-subtle">
                    <Users className="h-10 w-10 text-slate-400" />
                  </div>
                  <h4 className="font-bold text-xl text-slate-800 mb-3">Nenhuma atividade ainda</h4>
                  <p className="text-base text-slate-600 leading-relaxed max-w-sm mx-auto">
                    Comece sua jornada de estudos para ver suas conquistas aparecerem aqui
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
