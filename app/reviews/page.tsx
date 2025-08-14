"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  RotateCcw,
  Clock,
  Calendar,
  Brain,
  Target,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  BookOpen,
  Zap,
} from "lucide-react"
import { useReviews } from "@/lib/review-context"

export default function ReviewsPage() {
  const { reviewItems, getDueReviews, getUpcomingReviews, completeReview, getReviewStats } = useReviews()
  const [selectedSubject, setSelectedSubject] = useState<string>("all")
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)

  const stats = getReviewStats()
  const dueReviews = getDueReviews()
  const upcomingReviews = getUpcomingReviews(7)

  const filteredDueReviews =
    selectedSubject === "all" ? dueReviews : dueReviews.filter((item) => item.subject === selectedSubject)

  const currentReview = filteredDueReviews[currentReviewIndex]

  const handleReviewResult = (result: "easy" | "good" | "hard" | "again") => {
    if (!currentReview) return

    completeReview(currentReview.id, result)
    setShowAnswer(false)

    if (currentReviewIndex < filteredDueReviews.length - 1) {
      setCurrentReviewIndex(currentReviewIndex + 1)
    } else {
      setCurrentReviewIndex(0)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "hard":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getIntervalText = (interval: number) => {
    if (interval === 1) return "1 dia"
    if (interval < 30) return `${interval} dias`
    if (interval < 365) return `${Math.floor(interval / 30)} meses`
    return `${Math.floor(interval / 365)} anos`
  }

  const subjects = Array.from(new Set(reviewItems.map((item) => item.subject)))

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-transparent"></div>

        <div className="relative px-8 py-12 animate-fade-in-up">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg animate-bounce-subtle">
              <RotateCcw className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-indigo-100 bg-clip-text text-transparent">
                Sistema de Revisões
              </h1>
              <p className="text-indigo-100 text-lg mt-2">
                Baseado na curva do esquecimento para otimizar sua retenção de conhecimento
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-fade-in-up animation-delay-100">
          <Card className="shadow-soft border-0 hover:shadow-lg hover:scale-105 transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100/50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <BookOpen className="w-6 h-6 text-blue-600 animate-pulse-subtle" />
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total de Tópicos</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft border-0 hover:shadow-lg hover:scale-105 transition-all duration-300 bg-gradient-to-br from-red-50 to-red-100/50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-6 h-6 text-red-600 animate-pulse-subtle" />
                <div>
                  <p className="text-sm text-gray-600 font-medium">Para Revisar Hoje</p>
                  <p className="text-3xl font-bold">{stats.due}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft border-0 hover:shadow-lg hover:scale-105 transition-all duration-300 bg-gradient-to-br from-yellow-50 to-yellow-100/50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Clock className="w-6 h-6 text-yellow-600 animate-pulse-subtle" />
                <div>
                  <p className="text-sm text-gray-600 font-medium">Próximos 7 Dias</p>
                  <p className="text-3xl font-bold">{stats.upcoming}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft border-0 hover:shadow-lg hover:scale-105 transition-all duration-300 bg-gradient-to-br from-green-50 to-green-100/50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-600 animate-pulse-subtle" />
                <div>
                  <p className="text-sm text-gray-600 font-medium">Já Revisados</p>
                  <p className="text-3xl font-bold">{stats.completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="review" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm shadow-lg">
            <TabsTrigger
              value="review"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
            >
              Revisar Agora
            </TabsTrigger>
            <TabsTrigger
              value="schedule"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
            >
              Cronograma
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
            >
              Histórico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="review" className="space-y-6">
            {filteredDueReviews.length > 0 ? (
              <div className="space-y-6">
                {/* Filter */}
                <Card className="shadow-soft border-0 animate-fade-in-up">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-indigo-600" />
                      Filtrar por Matéria
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                        <SelectTrigger className="w-64">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas as Matérias ({dueReviews.length})</SelectItem>
                          {subjects.map((subject) => {
                            const count = dueReviews.filter((item) => item.subject === subject).length
                            return (
                              <SelectItem key={subject} value={subject}>
                                {subject} ({count})
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                      <div className="text-sm text-muted-foreground">
                        {currentReviewIndex + 1} de {filteredDueReviews.length} tópicos
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Review Card */}
                {currentReview && (
                  <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm animate-fade-in-up">
                    <CardHeader className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-2xl">{currentReview.topic}</CardTitle>
                          <p className="text-muted-foreground mt-1">{currentReview.subject}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getDifficultyColor(currentReview.difficulty)}>
                            {currentReview.difficulty === "easy"
                              ? "Fácil"
                              : currentReview.difficulty === "medium"
                                ? "Médio"
                                : "Difícil"}
                          </Badge>
                          <Badge variant="outline">Revisão #{currentReview.reviewCount + 1}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-8">
                      <div className="space-y-6">
                        <div className="text-center">
                          <div className="bg-gradient-to-r from-indigo-100 to-purple-100 p-8 rounded-xl">
                            <Brain className="h-16 w-16 text-indigo-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">Lembre-se deste tópico</h3>
                            <p className="text-muted-foreground">
                              Tente recordar os principais conceitos e informações sobre este assunto antes de ver a
                              resposta.
                            </p>
                          </div>
                        </div>

                        <div className="text-center">
                          <Button
                            onClick={() => setShowAnswer(!showAnswer)}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                            size="lg"
                          >
                            {showAnswer ? "Ocultar Resposta" : "Mostrar Resposta"}
                          </Button>
                        </div>

                        {showAnswer && (
                          <div className="space-y-6 animate-fade-in-up">
                            <div className="bg-gray-50 p-6 rounded-xl">
                              <h4 className="font-semibold mb-3">Informações do Tópico:</h4>
                              <div className="space-y-2 text-sm">
                                <p>
                                  <strong>Matéria:</strong> {currentReview.subject}
                                </p>
                                <p>
                                  <strong>Estudado em:</strong>{" "}
                                  {new Date(currentReview.studiedAt).toLocaleDateString("pt-BR")}
                                </p>
                                <p>
                                  <strong>Próxima revisão seria em:</strong> {getIntervalText(currentReview.interval)}
                                </p>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <h4 className="font-semibold text-center">Como foi sua recordação?</h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <Button
                                  onClick={() => handleReviewResult("again")}
                                  variant="outline"
                                  className="border-red-300 hover:bg-red-50 text-red-700"
                                >
                                  <AlertTriangle className="w-4 h-4 mr-2" />
                                  Não Lembrei
                                </Button>
                                <Button
                                  onClick={() => handleReviewResult("hard")}
                                  variant="outline"
                                  className="border-orange-300 hover:bg-orange-50 text-orange-700"
                                >
                                  <Clock className="w-4 h-4 mr-2" />
                                  Difícil
                                </Button>
                                <Button
                                  onClick={() => handleReviewResult("good")}
                                  variant="outline"
                                  className="border-blue-300 hover:bg-blue-50 text-blue-700"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Bom
                                </Button>
                                <Button
                                  onClick={() => handleReviewResult("easy")}
                                  variant="outline"
                                  className="border-green-300 hover:bg-green-50 text-green-700"
                                >
                                  <Zap className="w-4 h-4 mr-2" />
                                  Muito Fácil
                                </Button>
                              </div>
                              <div className="text-xs text-muted-foreground text-center">
                                Sua resposta determinará quando este tópico aparecerá novamente para revisão
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card className="shadow-soft border-0 animate-fade-in-up">
                <CardContent className="text-center py-16">
                  <div className="max-w-md mx-auto">
                    <div className="p-4 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                      <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Parabéns! Nenhuma revisão pendente</h3>
                    <p className="text-muted-foreground mb-6">
                      Você está em dia com suas revisões. Continue estudando novos tópicos para manter o aprendizado
                      ativo.
                    </p>
                    <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Estudar Novos Tópicos
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <Card className="shadow-soft border-0 animate-fade-in-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-indigo-600" />
                  Cronograma de Revisões
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3 text-red-600">Para Hoje ({stats.due})</h4>
                      {dueReviews.length > 0 ? (
                        <div className="space-y-2">
                          {dueReviews.slice(0, 5).map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-2 bg-red-50 rounded">
                              <div>
                                <p className="font-medium text-sm">{item.topic}</p>
                                <p className="text-xs text-muted-foreground">{item.subject}</p>
                              </div>
                              <Badge className={getDifficultyColor(item.difficulty)} variant="outline">
                                {item.difficulty === "easy"
                                  ? "Fácil"
                                  : item.difficulty === "medium"
                                    ? "Médio"
                                    : "Difícil"}
                              </Badge>
                            </div>
                          ))}
                          {dueReviews.length > 5 && (
                            <p className="text-sm text-muted-foreground">E mais {dueReviews.length - 5} tópicos...</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Nenhuma revisão pendente para hoje</p>
                      )}
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3 text-yellow-600">Próximos 7 Dias ({stats.upcoming})</h4>
                      {upcomingReviews.length > 0 ? (
                        <div className="space-y-2">
                          {upcomingReviews.slice(0, 5).map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                              <div>
                                <p className="font-medium text-sm">{item.topic}</p>
                                <p className="text-xs text-muted-foreground">
                                  {item.subject} • {new Date(item.nextReviewDate).toLocaleDateString("pt-BR")}
                                </p>
                              </div>
                              <Badge className={getDifficultyColor(item.difficulty)} variant="outline">
                                {item.difficulty === "easy"
                                  ? "Fácil"
                                  : item.difficulty === "medium"
                                    ? "Médio"
                                    : "Difícil"}
                              </Badge>
                            </div>
                          ))}
                          {upcomingReviews.length > 5 && (
                            <p className="text-sm text-muted-foreground">
                              E mais {upcomingReviews.length - 5} tópicos...
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Nenhuma revisão agendada para os próximos 7 dias
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card className="shadow-soft border-0 animate-fade-in-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-indigo-600" />
                  Histórico de Revisões
                </CardTitle>
              </CardHeader>
              <CardContent>
                {reviewItems.filter((item) => item.reviewCount > 0).length > 0 ? (
                  <div className="space-y-3">
                    {reviewItems
                      .filter((item) => item.reviewCount > 0)
                      .sort((a, b) => new Date(b.nextReviewDate).getTime() - new Date(a.nextReviewDate).getTime())
                      .slice(0, 10)
                      .map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{item.topic}</h4>
                            <p className="text-sm text-muted-foreground">
                              {item.subject} • {item.reviewCount} revisões
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge className={getDifficultyColor(item.difficulty)} variant="outline">
                              {item.difficulty === "easy"
                                ? "Fácil"
                                : item.difficulty === "medium"
                                  ? "Médio"
                                  : "Difícil"}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              Próxima: {new Date(item.nextReviewDate).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="bg-gradient-to-r from-indigo-100 to-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <TrendingUp className="w-8 w-8 text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">Nenhuma revisão realizada ainda</h3>
                    <p className="text-gray-500">Comece a revisar tópicos para ver seu histórico aqui</p>
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
