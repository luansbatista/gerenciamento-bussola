"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Plus, Target, Calendar, Clock, BookOpen, Edit, Trash2, Zap, Timer, CheckCircle } from "lucide-react"
import { useStudy } from "@/lib/study-context"
import { usePomodoro } from "@/lib/pomodoro-context"

export default function GoalsPage() {
  const { dailyGoals, createGoal, deleteGoal, getTodayStudyTime, getTodayQuestionsCount } = useStudy()
  const { totalFocusTime, formatTime } = usePomodoro()

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newGoal, setNewGoal] = useState({
    title: "",
    type: "daily" as "daily" | "weekly" | "monthly",
    category: "questions" as "questions" | "hours" | "exams",
    target: 0,
    deadline: "",
  })

  const handleCreateGoal = () => {
    if (!newGoal.title || !newGoal.target || !newGoal.deadline) return

    createGoal(newGoal)
    setNewGoal({
      title: "",
      type: "daily",
      category: "questions",
      target: 0,
      deadline: "",
    })
    setShowCreateForm(false)
  }

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "questions":
        return <BookOpen className="h-4 w-4" />
      case "hours":
        return <Clock className="h-4 w-4" />
      case "exams":
        return <Target className="h-4 w-4" />
      default:
        return <Target className="h-4 w-4" />
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "questions":
        return "Questões"
      case "hours":
        return "Horas"
      case "exams":
        return "Simulados"
      default:
        return "Meta"
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "daily":
        return "Diária"
      case "weekly":
        return "Semanal"
      case "monthly":
        return "Mensal"
      default:
        return "Meta"
    }
  }

  const getRealTimeProgress = (goal: any) => {
    if (goal.category === "hours") {
      return Math.floor((totalFocusTime / 60) * 100) / 100 // Convert minutes to hours
    }
    if (goal.category === "questions") {
      return getTodayQuestionsCount()
    }
    return goal.current
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100">
      {/* Animated Header */}
      <div className="relative bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-float"></div>
          <div className="absolute top-32 right-20 w-16 h-16 bg-white/10 rounded-full animate-float-delayed"></div>
          <div className="absolute bottom-10 left-1/3 w-12 h-12 bg-white/10 rounded-full animate-bounce-subtle"></div>
        </div>
        <div className="relative z-10 px-8 py-12">
          <div className="flex items-center justify-between animate-fade-in-up">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 animate-pulse-subtle">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-orange-100 bg-clip-text text-transparent">
                  Metas de Estudo
                </h1>
              </div>
              <p className="text-orange-100 text-lg">Defina e acompanhe suas metas para o concurso da PMBA</p>
            </div>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/30 text-white shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in-right"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Meta
            </Button>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up">
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-lg">
                  <Timer className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tempo Estudado Hoje</p>
                  <p className="text-2xl font-bold">{formatTime(totalFocusTime * 60)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-3 rounded-lg">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Questões Hoje</p>
                  <p className="text-2xl font-bold">{getTodayQuestionsCount()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-3 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Metas Concluídas</p>
                  <p className="text-2xl font-bold">{dailyGoals.filter((g) => g.completed).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {showCreateForm && (
          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm animate-fade-in-up">
            <CardHeader className="bg-gradient-to-r from-orange-500/10 to-red-500/10">
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-orange-600" />
                <span>Criar Nova Meta</span>
              </CardTitle>
              <CardDescription>Defina uma nova meta para acompanhar seu progresso</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título da Meta</Label>
                  <Input
                    id="title"
                    placeholder="Ex: Questões de Direito Constitucional"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                    className="border-orange-200 focus:border-orange-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select value={newGoal.type} onValueChange={(value: any) => setNewGoal({ ...newGoal, type: value })}>
                    <SelectTrigger className="border-orange-200 focus:border-orange-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Diária</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="monthly">Mensal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select
                    value={newGoal.category}
                    onValueChange={(value: any) => setNewGoal({ ...newGoal, category: value })}
                  >
                    <SelectTrigger className="border-orange-200 focus:border-orange-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="questions">Questões</SelectItem>
                      <SelectItem value="hours">Horas de Estudo</SelectItem>
                      <SelectItem value="exams">Simulados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target">Meta</Label>
                  <Input
                    id="target"
                    type="number"
                    placeholder="Ex: 50"
                    value={newGoal.target || ""}
                    onChange={(e) => setNewGoal({ ...newGoal, target: Number.parseInt(e.target.value) || 0 })}
                    className="border-orange-200 focus:border-orange-500"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="deadline">Prazo</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={newGoal.deadline}
                    onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                    className="border-orange-200 focus:border-orange-500"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleCreateGoal}
                  className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                >
                  Criar Meta
                </Button>
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dailyGoals.map((goal, index) => {
            const currentProgress = getRealTimeProgress(goal)
            const isCompleted = currentProgress >= goal.target

            return (
              <Card
                key={goal.id}
                className="relative shadow-xl border-0 bg-white/90 backdrop-blur-sm hover:shadow-2xl hover:scale-105 transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-lg text-white">
                        {getCategoryIcon(goal.category)}
                      </div>
                      <CardTitle className="text-lg">{goal.title}</CardTitle>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="hover:bg-orange-100">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteGoal(goal.id)}
                        className="hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                      {getTypeLabel(goal.type)}
                    </Badge>
                    <Badge variant="outline" className="border-orange-300">
                      {getCategoryLabel(goal.category)}
                    </Badge>
                    {isCompleted && (
                      <Badge className="bg-green-500 text-white">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Concluída
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progresso</span>
                      <span className="font-medium">
                        {goal.category === "hours" ? `${currentProgress.toFixed(1)}h` : currentProgress} /{" "}
                        {goal.category === "hours" ? `${goal.target}h` : goal.target}
                      </span>
                    </div>
                    <Progress
                      value={getProgressPercentage(currentProgress, goal.target)}
                      className={`h-3 ${isCompleted ? "bg-green-100" : ""}`}
                    />
                    <div className="text-xs text-muted-foreground text-center">
                      {getProgressPercentage(currentProgress, goal.target).toFixed(0)}% concluído
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Prazo: {new Date(goal.deadline).toLocaleDateString("pt-BR")}</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {dailyGoals.length === 0 && !showCreateForm && (
          <Card className="text-center py-12 shadow-xl border-0 bg-white/90 backdrop-blur-sm animate-fade-in-up">
            <CardContent>
              <div className="bg-gradient-to-r from-orange-500 to-red-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Nenhuma meta definida</h3>
              <p className="text-muted-foreground mb-4">
                Comece definindo suas primeiras metas de estudo para o concurso da PMBA
              </p>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeira Meta
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
