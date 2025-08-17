import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Circle, Target, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useStudy } from "@/lib/study-context"
import { useAuth } from "@/lib/auth-context"
import { useState, useEffect } from "react"

export function TodayGoals() {
  const { dailyGoals, updateGoalProgress } = useStudy()
  const { user } = useAuth()
  const [todayGoals, setTodayGoals] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadTodayGoals = async () => {
      if (!user?.id) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        
        // Filtrar metas de hoje
        const today = new Date().toISOString().split('T')[0]
        const todayGoalsData = dailyGoals.filter(goal => 
          goal.deadline === today || goal.type === 'daily'
        )

        // Atualizar progresso das metas baseado nos dados reais
        const updatedGoals = todayGoalsData.map(goal => {
          let current = goal.current
          
          // Se for meta de questões, buscar dados reais
          if (goal.category === 'questions') {
            // Aqui você pode implementar a busca de questões respondidas hoje
            // Por enquanto, manter o valor atual
          }
          
          // Se for meta de horas, buscar dados reais
          if (goal.category === 'hours') {
            // Aqui você pode implementar a busca de horas estudadas hoje
            // Por enquanto, manter o valor atual
          }

          return {
            ...goal,
            current: Math.min(current, goal.target),
            completed: current >= goal.target
          }
        })

        setTodayGoals(updatedGoals)
      } catch (error) {
        console.error('Erro ao carregar metas de hoje:', error)
        setTodayGoals([])
      } finally {
        setIsLoading(false)
      }
    }

    loadTodayGoals()
  }, [user?.id, dailyGoals])

  const handleGoalClick = (goalId: string) => {
    const goal = todayGoals.find(g => g.id === goalId)
    if (goal && !goal.completed) {
      const newCurrent = Math.min(goal.current + 1, goal.target)
      updateGoalProgress(goalId, newCurrent)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Metas de Hoje
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-600" />
          Metas de Hoje
        </CardTitle>
      </CardHeader>
      <CardContent>
        {todayGoals.length === 0 ? (
          <div className="text-center py-8">
            <Target className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 mb-4">Nenhuma meta definida para hoje</p>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <Plus className="h-4 w-4" />
              Definir Metas
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {todayGoals.map((goal) => {
              const progressPercentage = Math.min((goal.current / goal.target) * 100, 100)
              return (
                <div key={goal.id} className="space-y-2">
                  <div 
                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                    onClick={() => handleGoalClick(goal.id)}
                  >
                    {goal.completed ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Circle className="h-4 w-4 text-gray-400" />
                    )}
                    <span className={`text-sm font-medium flex-1 ${goal.completed ? "line-through text-gray-500" : ""}`}>
                      {goal.title}
                    </span>
                  </div>
                  {!goal.completed && (
                    <div className="ml-6 space-y-1">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>
                          {goal.current} de {goal.target}
                        </span>
                        <span>{Math.round(progressPercentage)}%</span>
                      </div>
                      <Progress value={progressPercentage} className="h-1.5" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
