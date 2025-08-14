import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Circle, Target, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export function TodayGoals() {
  const dailyGoals: any[] = []

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-600" />
          Metas de Hoje
        </CardTitle>
      </CardHeader>
      <CardContent>
        {dailyGoals.length === 0 ? (
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
            {dailyGoals.map((goal) => {
              const progressPercentage = Math.min((goal.current / goal.target) * 100, 100)
              return (
                <div key={goal.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    {goal.completed ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Circle className="h-4 w-4 text-gray-400" />
                    )}
                    <span className={`text-sm font-medium ${goal.completed ? "line-through text-gray-500" : ""}`}>
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
