"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import {
  Calendar,
  Clock,
  Settings,
  Target,
  TrendingUp,
  CheckCircle,
  RotateCcw,
  BookOpen,
  Coffee,
  Zap,
} from "lucide-react"
import { useSchedule } from "@/lib/schedule-context"

const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
const timePreferences = [
  { value: "morning", label: "Manhã (8h-12h)" },
  { value: "afternoon", label: "Tarde (14h-18h)" },
  { value: "evening", label: "Noite (19h-22h)" },
  { value: "night", label: "Madrugada (22h-24h)" },
]

export default function SchedulePage() {
  const {
    preferences,
    currentWeekSchedule,
    updatePreferences,
    generateSchedule,
    markItemCompleted,
    getScheduleForDate,
    getWeeklyProgress,
  } = useSchedule()

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [showSettings, setShowSettings] = useState(false)

  const progress = getWeeklyProgress()
  const todaySchedule = getScheduleForDate(selectedDate)

  const handlePreferenceChange = (key: keyof typeof preferences, value: any) => {
    updatePreferences({ [key]: value })
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "study":
        return <BookOpen className="h-4 w-4" />
      case "review":
        return <RotateCcw className="h-4 w-4" />
      case "practice":
        return <Target className="h-4 w-4" />
      case "break":
        return <Coffee className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "study":
        return "bg-blue-100 text-blue-800"
      case "review":
        return "bg-purple-100 text-purple-800"
      case "practice":
        return "bg-green-100 text-green-800"
      case "break":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCurrentWeekDates = () => {
    if (!currentWeekSchedule) return []

    const weekStart = new Date(currentWeekSchedule.weekStart)
    const dates = []

    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart)
      date.setDate(weekStart.getDate() + i)
      dates.push(date)
    }

    return dates
  }

  const weekDates = getCurrentWeekDates()

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 to-transparent"></div>

        <div className="relative px-8 py-12 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg animate-bounce-subtle">
                <Calendar className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-cyan-100 bg-clip-text text-transparent">
                  Cronograma Inteligente
                </h1>
                <p className="text-cyan-100 text-lg mt-2">
                  Planejamento personalizado baseado em suas metas e performance
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowSettings(!showSettings)}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </Button>
              <Button onClick={generateSchedule} className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Zap className="h-4 w-4 mr-2" />
                Gerar Novo
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-fade-in-up animation-delay-100">
          <Card className="shadow-soft border-0 hover:shadow-lg hover:scale-105 transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100/50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Target className="w-6 h-6 text-blue-600 animate-pulse-subtle" />
                <div>
                  <p className="text-sm text-gray-600 font-medium">Horas Planejadas</p>
                  <p className="text-3xl font-bold">{progress.planned.toFixed(1)}h</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft border-0 hover:shadow-lg hover:scale-105 transition-all duration-300 bg-gradient-to-br from-green-50 to-green-100/50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-600 animate-pulse-subtle" />
                <div>
                  <p className="text-sm text-gray-600 font-medium">Horas Concluídas</p>
                  <p className="text-3xl font-bold">{progress.completed.toFixed(1)}h</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft border-0 hover:shadow-lg hover:scale-105 transition-all duration-300 bg-gradient-to-br from-purple-50 to-purple-100/50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-6 h-6 text-purple-600 animate-pulse-subtle" />
                <div>
                  <p className="text-sm text-gray-600 font-medium">Progresso Semanal</p>
                  <p className="text-3xl font-bold">{progress.percentage.toFixed(0)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft border-0 hover:shadow-lg hover:scale-105 transition-all duration-300 bg-gradient-to-br from-orange-50 to-orange-100/50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Clock className="w-6 h-6 text-orange-600 animate-pulse-subtle" />
                <div>
                  <p className="text-sm text-gray-600 font-medium">Sessões Hoje</p>
                  <p className="text-3xl font-bold">{todaySchedule.filter((item) => item.type !== "break").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm animate-fade-in-up">
            <CardHeader className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-cyan-600" />
                Configurações do Cronograma
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Horas de Estudo por Dia</Label>
                  <Input
                    type="number"
                    min="1"
                    max="12"
                    value={preferences.studyHoursPerDay}
                    onChange={(e) => handlePreferenceChange("studyHoursPerDay", Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Dias de Estudo por Semana</Label>
                  <Input
                    type="number"
                    min="1"
                    max="7"
                    value={preferences.studyDaysPerWeek}
                    onChange={(e) => handlePreferenceChange("studyDaysPerWeek", Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Duração da Sessão (min)</Label>
                  <Input
                    type="number"
                    min="15"
                    max="120"
                    value={preferences.sessionDuration}
                    onChange={(e) => handlePreferenceChange("sessionDuration", Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Duração da Pausa (min)</Label>
                  <Input
                    type="number"
                    min="5"
                    max="30"
                    value={preferences.breakDuration}
                    onChange={(e) => handlePreferenceChange("breakDuration", Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label>Horários Preferidos</Label>
                <div className="grid grid-cols-2 gap-3">
                  {timePreferences.map((time) => (
                    <div key={time.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={time.value}
                        checked={preferences.preferredStudyTimes.includes(time.value)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handlePreferenceChange("preferredStudyTimes", [
                              ...preferences.preferredStudyTimes,
                              time.value,
                            ])
                          } else {
                            handlePreferenceChange(
                              "preferredStudyTimes",
                              preferences.preferredStudyTimes.filter((t) => t !== time.value),
                            )
                          }
                        }}
                      />
                      <Label htmlFor={time.value} className="text-sm">
                        {time.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="prioritizeWeak"
                    checked={preferences.prioritizeWeakSubjects}
                    onCheckedChange={(checked) => handlePreferenceChange("prioritizeWeakSubjects", checked)}
                  />
                  <Label htmlFor="prioritizeWeak">Priorizar matérias com baixo desempenho</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeReviews"
                    checked={preferences.includeReviews}
                    onCheckedChange={(checked) => handlePreferenceChange("includeReviews", checked)}
                  />
                  <Label htmlFor="includeReviews">Incluir revisões no cronograma</Label>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={generateSchedule} className="bg-gradient-to-r from-cyan-600 to-blue-600">
                  Aplicar e Gerar Cronograma
                </Button>
                <Button variant="outline" onClick={() => setShowSettings(false)}>
                  Fechar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="week" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm shadow-lg">
            <TabsTrigger
              value="week"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:text-white"
            >
              Visão Semanal
            </TabsTrigger>
            <TabsTrigger
              value="day"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:text-white"
            >
              Visão Diária
            </TabsTrigger>
          </TabsList>

          <TabsContent value="week" className="space-y-6">
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm animate-fade-in-up">
              <CardHeader className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-cyan-600" />
                  Cronograma da Semana
                </CardTitle>
                <div className="mt-4">
                  <Progress value={progress.percentage} className="h-3" />
                  <p className="text-sm text-muted-foreground mt-2">
                    {progress.completed.toFixed(1)}h de {progress.planned.toFixed(1)}h concluídas (
                    {progress.percentage.toFixed(0)}%)
                  </p>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {currentWeekSchedule ? (
                  <div className="grid grid-cols-7 gap-4">
                    {weekDates.map((date, index) => {
                      const dateStr = date.toISOString().split("T")[0]
                      const daySchedule = getScheduleForDate(dateStr)
                      const isToday = dateStr === new Date().toISOString().split("T")[0]

                      return (
                        <div
                          key={dateStr}
                          className={`space-y-2 p-3 rounded-lg border ${
                            isToday ? "bg-cyan-50 border-cyan-200" : "bg-gray-50"
                          }`}
                        >
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">{daysOfWeek[index]}</p>
                            <p className={`font-semibold ${isToday ? "text-cyan-600" : ""}`}>{date.getDate()}</p>
                          </div>
                          <div className="space-y-1">
                            {daySchedule.slice(0, 3).map((item) => (
                              <div
                                key={item.id}
                                className={`text-xs p-2 rounded ${
                                  item.completed ? "bg-green-100 text-green-800" : getTypeColor(item.type)
                                }`}
                              >
                                <div className="flex items-center gap-1">
                                  {getTypeIcon(item.type)}
                                  <span className="truncate">{item.subject}</span>
                                </div>
                                <p className="text-xs opacity-75">
                                  {item.startTime}-{item.endTime}
                                </p>
                              </div>
                            ))}
                            {daySchedule.length > 3 && (
                              <p className="text-xs text-muted-foreground text-center">
                                +{daySchedule.length - 3} mais
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">Nenhum cronograma gerado</h3>
                    <p className="text-gray-500 mb-4">Clique em "Gerar Novo" para criar seu cronograma personalizado</p>
                    <Button onClick={generateSchedule} className="bg-gradient-to-r from-cyan-600 to-blue-600">
                      <Zap className="h-4 w-4 mr-2" />
                      Gerar Cronograma
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="day" className="space-y-6">
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm animate-fade-in-up">
              <CardHeader className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-cyan-600" />
                  Cronograma do Dia
                </CardTitle>
                <div className="mt-4">
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-48"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {todaySchedule.length > 0 ? (
                  <div className="space-y-3">
                    {todaySchedule.map((item, index) => (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-300 animate-fade-in-up ${
                          item.completed ? "bg-green-50 border-green-200" : "hover:shadow-md"
                        }`}
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${getTypeColor(item.type)}`}>{getTypeIcon(item.type)}</div>
                          <div>
                            <h4 className="font-semibold">{item.subject}</h4>
                            {item.topic && <p className="text-sm text-muted-foreground">{item.topic}</p>}
                            <p className="text-sm text-muted-foreground">
                              {item.startTime} - {item.endTime} ({item.estimatedDuration} min)
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityColor(item.priority)}>
                            {item.priority === "high" ? "Alta" : item.priority === "medium" ? "Média" : "Baixa"}
                          </Badge>
                          {!item.completed ? (
                            <Button
                              size="sm"
                              onClick={() => markItemCompleted(item.id)}
                              className="bg-gradient-to-r from-green-500 to-green-600"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Concluir
                            </Button>
                          ) : (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Concluído
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">Nenhuma atividade agendada</h3>
                    <p className="text-gray-500 mb-4">
                      Não há atividades programadas para este dia ou o cronograma não foi gerado ainda
                    </p>
                    <Button onClick={generateSchedule} className="bg-gradient-to-r from-cyan-600 to-blue-600">
                      <Zap className="h-4 w-4 mr-2" />
                      Gerar Cronograma
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
