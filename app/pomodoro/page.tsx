"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Pause, Square, Settings, Clock, TrendingUp, Target, Timer, Zap } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { usePomodoro } from "@/lib/pomodoro-context"

export default function PomodoroPage() {
  const {
    timerState,
    sessionType,
    timeLeft,
    selectedSubject,
    sessionsCompleted,
    totalFocusTime,
    settings,
    startTimer,
    pauseTimer,
    stopTimer,
    setSelectedSubject,
    updateSettings,
    formatTime,
    getSessionLabel,
    getSessionColor,
    progress,
  } = usePomodoro()

  const [showSettings, setShowSettings] = useState(false)
  const [subjects, setSubjects] = useState<any[]>([])
  const supabase = createClient()

  // Carregar disciplinas do Supabase
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const { data, error } = await supabase
          .from('assuntos_edital')
          .select('disciplina')
          .order('disciplina')
        
        if (error) {
          console.error('Erro ao buscar disciplinas:', error)
          return
        }

        if (data) {
          const uniqueSubjects = Array.from(new Set(data.map(item => item.disciplina)))
          setSubjects(uniqueSubjects.map((disciplina, index) => ({
            id: index.toString(),
            name: disciplina
          })))
        }
      } catch (error) {
        console.error('Erro ao buscar disciplinas:', error)
      }
    }

    fetchSubjects()
  }, [supabase])

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100">
      {/* Animated Header */}
      <div className="relative bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-float"></div>
          <div className="absolute top-32 right-20 w-16 h-16 bg-white/10 rounded-full animate-float-delayed"></div>
          <div className="absolute bottom-10 left-1/3 w-12 h-12 bg-white/10 rounded-full animate-bounce-subtle"></div>
        </div>
        <div className="relative z-10 px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade-in-up">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 animate-pulse-subtle">
                <Timer className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-red-100 bg-clip-text text-transparent">
                  Técnica Pomodoro
                </h1>
                <p className="text-red-100 text-lg">Mantenha o foco com intervalos estruturados de estudo</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowSettings(!showSettings)}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/30 text-white shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in-right"
            >
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </Button>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "Sessões Hoje", value: sessionsCompleted, icon: Target, color: "from-red-500 to-red-600" },
            { title: "Tempo Focado", value: `${totalFocusTime}min`, icon: Clock, color: "from-blue-500 to-blue-600" },
            {
              title: "Próxima Pausa",
              value: settings.sessionsUntilLongBreak - (sessionsCompleted % settings.sessionsUntilLongBreak),
              icon: TrendingUp,
              color: "from-green-500 to-green-600",
            },
          ].map((stat, index) => (
            <Card
              key={index}
              className="shadow-xl border-0 bg-white/90 backdrop-blur-sm hover:shadow-2xl hover:scale-105 transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className={`bg-gradient-to-r ${stat.color} p-3 rounded-lg`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm animate-fade-in-up">
            <CardHeader className="bg-gradient-to-r from-red-500/10 to-orange-500/10">
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-red-600" />
                <span>Configurações do Timer</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium">Foco (min)</label>
                  <Select
                    value={settings.workDuration.toString()}
                    onValueChange={(value) => updateSettings({ ...settings, workDuration: Number.parseInt(value) })}
                  >
                    <SelectTrigger className="border-red-200 focus:border-red-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="30">30</SelectItem>
                      <SelectItem value="45">45</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Pausa Curta (min)</label>
                  <Select
                    value={settings.shortBreakDuration.toString()}
                    onValueChange={(value) =>
                      updateSettings({ ...settings, shortBreakDuration: Number.parseInt(value) })
                    }
                  >
                    <SelectTrigger className="border-red-200 focus:border-red-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Pausa Longa (min)</label>
                  <Select
                    value={settings.longBreakDuration.toString()}
                    onValueChange={(value) =>
                      updateSettings({ ...settings, longBreakDuration: Number.parseInt(value) })
                    }
                  >
                    <SelectTrigger className="border-red-200 focus:border-red-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="30">30</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Sessões até pausa longa</label>
                  <Select
                    value={settings.sessionsUntilLongBreak.toString()}
                    onValueChange={(value) =>
                      updateSettings({ ...settings, sessionsUntilLongBreak: Number.parseInt(value) })
                    }
                  >
                    <SelectTrigger className="border-red-200 focus:border-red-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="6">6</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Timer */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card
              className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm animate-fade-in-up"
              style={{ animationDelay: "300ms" }}
            >
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  <div className="flex justify-center">
                    <Badge className={`bg-gradient-to-r ${getSessionColor()} text-white px-6 py-3 text-lg shadow-lg`}>
                      <Zap className="w-4 h-4 mr-2" />
                      {getSessionLabel()}
                    </Badge>
                  </div>

                  <div className="relative">
                    <div className="text-8xl font-mono font-bold text-gray-900 animate-pulse-subtle">
                      {formatTime(timeLeft)}
                    </div>
                    <Progress value={progress} className="mt-6 h-4 shadow-inner" />
                  </div>

                  {sessionType === "work" && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Matéria de Estudo</label>
                      <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                        <SelectTrigger className="max-w-xs mx-auto border-red-200 focus:border-red-500">
                          <SelectValue placeholder="Selecione uma matéria" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map((subject) => (
                            <SelectItem key={subject.id} value={subject.id}>
                              {subject.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="flex justify-center gap-4">
                    {timerState === "idle" && (
                      <Button
                        onClick={startTimer}
                        size="lg"
                        className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <Play className="w-5 h-5 mr-2" />
                        Iniciar
                      </Button>
                    )}

                    {timerState === "running" && (
                      <Button
                        onClick={pauseTimer}
                        size="lg"
                        className="bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <Pause className="w-5 h-5 mr-2" />
                        Pausar
                      </Button>
                    )}

                    {timerState === "paused" && (
                      <>
                        <Button
                          onClick={startTimer}
                          size="lg"
                          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          <Play className="w-5 h-5 mr-2" />
                          Continuar
                        </Button>
                        <Button
                          onClick={stopTimer}
                          size="lg"
                          variant="outline"
                          className="shadow-lg hover:shadow-xl transition-all duration-300 bg-transparent"
                        >
                          <Square className="w-5 h-5 mr-2" />
                          Parar
                        </Button>
                      </>
                    )}

                    {timerState !== "idle" && (
                      <Button
                        onClick={stopTimer}
                        size="lg"
                        className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <Square className="w-5 h-5 mr-2" />
                        Parar
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Session History */}
          <div>
            <Card
              className="shadow-xl border-0 bg-white/90 backdrop-blur-sm animate-fade-in-up"
              style={{ animationDelay: "400ms" }}
            >
              <CardHeader className="bg-gradient-to-r from-red-500/10 to-orange-500/10">
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-red-600" />
                  <span>Histórico de Hoje</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {Array.from({ length: sessionsCompleted }, (_, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg shadow-sm animate-fade-in-right"
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      <div className="w-3 h-3 bg-gradient-to-r from-red-500 to-red-600 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Sessão {i + 1}</p>
                        <p className="text-xs text-gray-500">{settings.workDuration} minutos</p>
                      </div>
                    </div>
                  ))}

                  {sessionsCompleted === 0 && (
                    <div className="text-center py-8">
                      <div className="bg-gradient-to-r from-red-500 to-orange-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Target className="w-6 w-6 text-white" />
                      </div>
                      <p className="text-sm text-gray-500">Nenhuma sessão completada hoje. Comece agora!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
