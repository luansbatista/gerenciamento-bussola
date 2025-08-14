"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Medal, Trophy, Crown, Filter, TrendingUp, Award, Star } from "lucide-react"
import { useAnalytics } from "@/lib/analytics-context"

export default function RankingPage() {
  const { getRanking } = useAnalytics()
  const [selectedPeriod, setSelectedPeriod] = useState("month")
  const [selectedSubject, setSelectedSubject] = useState("all")

  const rankings = getRanking(selectedPeriod, selectedSubject)

  const getPodiumIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="h-8 w-8 text-yellow-600" />
      case 2:
        return <Medal className="h-8 w-8 text-gray-600" />
      case 3:
        return <Award className="h-8 w-8 text-orange-600" />
      default:
        return <Trophy className="h-6 w-6 text-gray-400" />
    }
  }

  const getPodiumColor = (position: number) => {
    switch (position) {
      case 1:
        return "from-yellow-50 to-yellow-100 border-yellow-200"
      case 2:
        return "from-gray-50 to-gray-100 border-gray-200"
      case 3:
        return "from-orange-50 to-orange-100 border-orange-200"
      default:
        return "from-white to-gray-50 border-gray-200"
    }
  }

  return (
    <div>
      {/* Header com gradiente */}
      <div className="relative overflow-hidden bg-gradient-to-r from-yellow-600 via-yellow-700 to-orange-600 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 px-8 py-12">
          <div className="flex items-center gap-4 animate-fade-in-up">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 shadow-lg animate-bounce-subtle">
              <Medal className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-yellow-100 bg-clip-text text-transparent">
                Ranking dos Alunos
              </h1>
              <p className="text-yellow-100 mt-2 text-lg">Classificação baseada em desempenho e dedicação</p>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
      </div>

      <div className="p-8 space-y-8">
        {/* Filtros */}
        <Card className="animate-fade-in-up shadow-soft border-0 bg-gradient-to-r from-white to-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-yellow-600" />
              Filtros de Classificação
            </CardTitle>
            <CardDescription>Personalize a visualização do ranking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Período</label>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Esta Semana</SelectItem>
                    <SelectItem value="month">Este Mês</SelectItem>
                    <SelectItem value="quarter">Este Trimestre</SelectItem>
                    <SelectItem value="year">Este Ano</SelectItem>
                    <SelectItem value="all">Todos os Tempos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Matéria</label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Matérias</SelectItem>
                    <SelectItem value="direito-constitucional">Direito Constitucional</SelectItem>
                    <SelectItem value="direito-administrativo">Direito Administrativo</SelectItem>
                    <SelectItem value="direito-penal">Direito Penal</SelectItem>
                    <SelectItem value="legislacao-pm">Legislação PM</SelectItem>
                    <SelectItem value="portugues">Português</SelectItem>
                    <SelectItem value="matematica">Matemática</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Critério</label>
                <Select defaultValue="score">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="score">Score Geral</SelectItem>
                    <SelectItem value="questions">Questões Resolvidas</SelectItem>
                    <SelectItem value="accuracy">Taxa de Acerto</SelectItem>
                    <SelectItem value="streak">Sequência de Estudos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {rankings.length > 0 ? (
          <>
            {/* Pódio dos Top 3 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up animation-delay-100">
              {rankings.slice(0, 3).map((student, index) => {
                const actualPosition = student.position
                const order = actualPosition === 1 ? 2 : actualPosition === 2 ? 1 : 3

                return (
                  <Card
                    key={student.id}
                    className={`shadow-soft border-0 bg-gradient-to-br ${getPodiumColor(actualPosition)} ${
                      actualPosition === 1
                        ? "transform md:scale-105 order-2 md:order-2"
                        : actualPosition === 2
                          ? "order-1 md:order-1"
                          : "order-3 md:order-3"
                    }`}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="mb-4 flex justify-center">{getPodiumIcon(actualPosition)}</div>
                      <Badge
                        className={
                          actualPosition === 1
                            ? "bg-yellow-600 text-white"
                            : actualPosition === 2
                              ? "bg-gray-600 text-white"
                              : "bg-orange-600 text-white"
                        }
                      >
                        {actualPosition}º Lugar
                      </Badge>
                      <div className="mt-4">
                        <Avatar className="w-16 h-16 mx-auto mb-3">
                          <AvatarImage src={student.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="text-lg font-bold">
                            {student.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <h3 className="font-bold text-lg">{student.name}</h3>
                        <div className="mt-3 space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Score:</span>
                            <span className="font-bold">{student.score}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Questões:</span>
                            <span className="font-bold">{student.questionsAnswered}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Acerto:</span>
                            <span className="font-bold">{student.accuracy.toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Horas:</span>
                            <span className="font-bold">{student.studyHours.toFixed(1)}h</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Ranking Completo */}
            <Card className="animate-fade-in-up animation-delay-200 shadow-soft border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  Classificação Geral
                </CardTitle>
                <CardDescription>Ranking baseado em questões resolvidas e taxa de acerto</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rankings.map((student, index) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-gradient-to-r from-white to-gray-50 hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-sm">
                          {student.position}
                        </div>
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={student.avatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            {student.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">{student.name}</h4>
                          <p className="text-sm text-muted-foreground">Score: {student.score}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <p className="font-semibold">{student.questionsAnswered}</p>
                          <p className="text-muted-foreground">Questões</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold">{student.accuracy.toFixed(1)}%</p>
                          <p className="text-muted-foreground">Acerto</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold">{student.studyHours.toFixed(1)}h</p>
                          <p className="text-muted-foreground">Estudo</p>
                        </div>
                        {student.position <= 3 && <div className="text-center">{getPodiumIcon(student.position)}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="animate-fade-in-up animation-delay-200 shadow-soft border-0">
            <CardContent className="text-center py-16">
              <Trophy className="h-16 w-16 mx-auto mb-6 opacity-50 text-yellow-600" />
              <h3 className="text-xl font-medium mb-3">Ranking em Construção</h3>
              <p className="text-sm max-w-md mx-auto text-muted-foreground">
                O ranking será atualizado conforme os alunos começarem a resolver questões e participar dos simulados.
                Seja o primeiro a aparecer aqui!
              </p>
              <div className="mt-8 flex items-center justify-center gap-6 text-xs">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>Score = Questões × Taxa de Acerto</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span>Atualizado em tempo real</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
