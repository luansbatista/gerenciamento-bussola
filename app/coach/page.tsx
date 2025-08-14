"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Brain,
  Target,
  TrendingUp,
  Calendar,
  BookOpen,
  Clock,
  Award,
  Lightbulb,
  Plus,
  Filter,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Flame,
  Play,
  Heart,
  Zap,
  Star,
} from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { useCoach } from "@/lib/coach-context"
import { useStudy } from "@/lib/study-context"
import { useInsights } from "@/lib/insights-context"
import { StudyTopicModal } from "@/components/coach/study-topic-modal"

const topicsBySubject = {
  Português: [
    { name: "Compreensão e interpretação de textos", percentage: 57 },
    { name: "Pontuação", percentage: 9 },
    { name: "Concordância nominal e verbal", percentage: 9 },
    { name: "Uso do sinal indicativo de crase", percentage: 5 },
    { name: "Regência nominal e verbal", percentage: 5 },
    { name: "Tipologia textual e gêneros textuais", percentage: 4 },
    { name: "Significação das palavras", percentage: 3 },
    { name: "Ortografia oficial", percentage: 2 },
    { name: "Acentuação gráfica", percentage: 2 },
    { name: "Classes de palavras", percentage: 2 },
    { name: "Sintaxe da oração e do período", percentage: 2 },
  ],
  "História do Brasil": [
    { name: "Era Vargas (1930-1945)", percentage: 13 },
    { name: "Segundo Reinado (1831-1840)", percentage: 12 },
    { name: "Revolução de 1930", percentage: 12 },
    { name: "Independência do Brasil (1822)", percentage: 11 },
    { name: "Brasil Colônia (1530-1815)", percentage: 9 },
    { name: "Primeira República (1889-1930)", percentage: 9 },
    { name: "Primeiro Reinado (1822-1831)", percentage: 8 },
    { name: "Revolta de Canudos", percentage: 5 },
    { name: "Revolta dos Malês", percentage: 5 },
    { name: "Conjuração Baiana", percentage: 5 },
    { name: "Sabinada", percentage: 5 },
    { name: "Descobrimento do Brasil (1500)", percentage: 4 },
    { name: "História da Bahia", percentage: 3 },
    { name: "Independência da Bahia", percentage: 2 },
  ],
  "Geografia do Brasil": [
    { name: "Urbanização", percentage: 23 },
    { name: "Climas", percentage: 20 },
    { name: "Problemas Ambientais", percentage: 18 },
    { name: "Geografia da Bahia", percentage: 18 },
    { name: "Relevo brasileiro", percentage: 11 },
    { name: "Tipos de fontes de energia brasileira", percentage: 10 },
  ],
  Matemática: [
    { name: "Análise Combinatória", percentage: 35 },
    { name: "Geometria e Medidas", percentage: 25 },
    { name: "Sistemas lineares, Matrizes e Determinantes", percentage: 16 },
    { name: "Conjuntos numéricos", percentage: 13 },
    { name: "Funções", percentage: 5 },
    { name: "Trigonometria", percentage: 4 },
    { name: "Álgebra", percentage: 3 },
  ],
  Atualidades: [
    { name: "Globalização", percentage: 58 },
    { name: "Tecnologias de Informação e Comunicação", percentage: 22 },
    { name: "Multiculturalidade, Pluralidade e Diversidade Cultural", percentage: 20 },
  ],
  Informática: [
    { name: "Conceitos e modos de utilização de aplicativos para edição de textos", percentage: 62 },
    { name: "Sistemas operacionais Windows 7, Windows 10 e Linux", percentage: 25 },
    {
      name: "Conceitos básicos e modos de utilização de tecnologias, ferramentas, aplicativos e procedimentos associados à Internet e intranet",
      percentage: 4,
    },
    { name: "Correio eletrônico", percentage: 4 },
    { name: "Organização e gerenciamento de informações, arquivos, pastas e programas", percentage: 2 },
    { name: "Atalhos de teclado, ícones, área de trabalho e lixeira", percentage: 2 },
    { name: "Computação em nuvem", percentage: 1 },
  ],
  "Direito Constitucional": [
    { name: "Da Administração Pública", percentage: 49 },
    { name: "Dos princípios fundamentais", percentage: 31 },
    { name: "Da Segurança Pública", percentage: 10 },
    { name: "Dos Direitos e garantias fundamentais", percentage: 4 },
    { name: "Da organização do Estado", percentage: 3 },
    { name: "Dos militares dos Estados, do Distrito Federal e dos Territórios", percentage: 1 },
  ],
  "Direitos Humanos": [
    { name: "A Declaração Universal dos Direitos Humanos/1948", percentage: 64 },
    { name: "Pacto Internacional dos Direitos Econômicos, Sociais e Culturais", percentage: 18 },
    { name: "Declaração de Pequim Adotada pela Quarta Conferência Mundial sobre as Mulheres", percentage: 14 },
    { name: "Convenção Americana sobre Direitos Humanos/1969 (Pacto de São José da Costa Rica)", percentage: 4 },
  ],
  "Direito Administrativo": [
    { name: "Princípios fundamentais da administração pública", percentage: 35 },
    { name: "Poderes e deveres dos administradores públicos", percentage: 30 },
    { name: "Administração Pública", percentage: 23 },
    { name: "Servidores públicos: cargo, emprego e função públicos", percentage: 10 },
    { name: "Regime jurídico do militar estadual: Estatuto dos Policiais Militares do Estado da Bahia", percentage: 2 },
  ],
  "Direito Penal": [
    { name: "Dos crimes contra a vida", percentage: 24 },
    { name: "Corrupção passiva", percentage: 21 },
    { name: "Consumação e tentativa", percentage: 10 },
    { name: "Corrupção ativa", percentage: 10 },
    { name: "Dos crimes contra o patrimônio", percentage: 9 },
    { name: "Dos crimes contra a dignidade sexual", percentage: 8 },
    { name: "Causas de exclusão de ilicidade e culpabilidade", percentage: 7 },
    { name: "Desistência voluntária e arrependimento eficaz", percentage: 6 },
    { name: "Elementos", percentage: 3 },
    { name: "Lei n° 9.455 (Crimes de tortura)", percentage: 2 },
    { name: "Arrependimento posterior", percentage: 2 },
    { name: "Dos crimes contra a liberdade pessoal", percentage: 1 },
    { name: "Crime impossível", percentage: 1 },
  ],
  "Direito Penal Militar": [
    { name: "Dos crimes contra a autoridade ou disciplina militar", percentage: 19 },
    { name: "Da violência contra superior ou militar de serviço", percentage: 19 },
    { name: "Recusa de obediência", percentage: 19 },
    { name: "Reunião ilícita", percentage: 16 },
    { name: "Resistência mediante ameaça ou violência", percentage: 10 },
    { name: "Desrespeito a superior", percentage: 6 },
    { name: "Dos crimes contra o serviço militar e o dever militar", percentage: 3 },
    { name: "Crimes contra a Administração Militar", percentage: 3 },
    { name: "Dos crimes contra o dever funcional", percentage: 3 },
  ],
}

export default function CoachPage() {
  const { studiedTopics, recommendations, isTopicStudied, getTopicStudyData, getSubjectProgress } = useCoach()
  const { getWeeklyStats, getSubjects } = useStudy()
  const { getPersonalizedTips, getMotivationalMessage, getPerformanceAnalysis } = useInsights()
  const [selectedSubject, setSelectedSubject] = useState<string>("all")
  const [selectedTopicSubject, setSelectedTopicSubject] = useState<string>("Português")
  const [showStudyModal, setShowStudyModal] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState<{ subject: string; topic: string } | null>(null)
  const [availableSubjects, setAvailableSubjects] = useState<Array<{ id: string; name: string; color: string }>>([])
  const [weeklyStats, setWeeklyStats] = useState({ totalHours: 0, totalQuestions: 0, accuracy: 0 })

  const personalizedTips = getPersonalizedTips()
  const motivationalMessage = getMotivationalMessage()
  const performanceAnalysis = getPerformanceAnalysis()

  // Carregar disciplinas disponíveis
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const subjects = await getSubjects()
        setAvailableSubjects(subjects)
      } catch (error) {
        console.error('Erro ao carregar disciplinas:', error)
        setAvailableSubjects([])
      }
    }

    loadSubjects()
  }, [getSubjects])

  // Carregar estatísticas semanais
  useEffect(() => {
    const loadWeeklyStats = async () => {
      try {
        const stats = await getWeeklyStats()
        setWeeklyStats(stats)
      } catch (error) {
        console.error('Erro ao carregar estatísticas semanais:', error)
        setWeeklyStats({ totalHours: 0, totalQuestions: 0, accuracy: 0 })
      }
    }

    loadWeeklyStats()
  }, [getWeeklyStats])

  const handleStudyTopic = (subject: string, topic: string) => {
    setSelectedTopic({ subject, topic })
    setShowStudyModal(true)
  }

  const getSubjectPriorities = (subjectFilter: string) => {
    if (subjectFilter === "all") {
      return availableSubjects.map((subject) => {
        const progress = getSubjectProgress(subject.name)
        return {
          ...subject,
          priority:
            progress.accuracy < 60
              ? ("high" as const)
              : progress.accuracy < 80
                ? ("medium" as const)
                : ("low" as const),
          recommendation:
            progress.accuracy < 60
              ? "Prioridade alta - Performance abaixo da média"
              : progress.accuracy < 80
                ? "Continue praticando para melhorar"
                : "Ótimo desempenho! Mantenha a consistência",
          studyTime: Math.floor(progress.totalTime / 60),
          accuracy: Math.round(progress.accuracy),
          questionCount: progress.totalQuestions || 0,
        }
      })
    }

    const subject = availableSubjects.find((s) => s.id === subjectFilter)
    if (!subject) return []

    const progress = getSubjectProgress(subject.name)
    return [
      {
        ...subject,
        priority:
          progress.accuracy < 60 ? ("high" as const) : progress.accuracy < 80 ? ("medium" as const) : ("low" as const),
        recommendation:
          progress.accuracy < 60
            ? "Foque nesta matéria para melhorar seu desempenho"
            : progress.accuracy < 80
              ? "Continue praticando para melhorar"
              : "Excelente! Mantenha o bom trabalho",
        studyTime: Math.floor(progress.totalTime / 60),
        accuracy: Math.round(progress.accuracy),
        questionCount: progress.totalQuestions || 0,
      },
    ]
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertTriangle className="w-4 h-4" />
      case "medium":
        return <Clock className="w-4 h-4" />
      case "low":
        return <CheckCircle className="w-4 h-4" />
      default:
        return <BookOpen className="w-4 h-4" />
    }
  }

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 30) return "bg-red-100 text-red-800 border-red-200"
    if (percentage >= 15) return "bg-orange-100 text-orange-800 border-orange-200"
    if (percentage >= 5) return "bg-yellow-100 text-yellow-800 border-yellow-200"
    return "bg-green-100 text-green-800 border-green-200"
  }

  const getPercentageIcon = (percentage: number) => {
    if (percentage >= 30) return <Flame className="w-3 h-3" />
    if (percentage >= 15) return <AlertTriangle className="w-3 h-3" />
    if (percentage >= 5) return <TrendingUp className="w-3 h-3" />
    return <CheckCircle className="w-3 h-3" />
  }

  const subjectPriorities = getSubjectPriorities(selectedSubject)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      {/* Animated Header */}
      <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-float"></div>
          <div className="absolute top-32 right-20 w-16 h-16 bg-white/10 rounded-full animate-float-delayed"></div>
          <div className="absolute bottom-10 left-1/3 w-12 h-12 bg-white/10 rounded-full animate-bounce-subtle"></div>
        </div>
        <div className="relative z-10 px-8 py-12">
          <div className="flex items-center space-x-3 animate-fade-in-up">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 animate-pulse-subtle">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
                Seu Coach de Estudos
              </h1>
              <p className="text-purple-100 text-lg">Orientação personalizada para maximizar seu desempenho</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8">
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm animate-fade-in-up">
          <CardHeader className="bg-gradient-to-r from-purple-500/10 to-pink-500/10">
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-purple-600" />
              Filtrar por Matéria
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-full md:w-64 border-purple-200 focus:border-purple-500">
                <SelectValue placeholder="Selecione uma matéria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Matérias</SelectItem>
                {availableSubjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              title: "Tópicos Estudados",
              value: studiedTopics.length,
              icon: Target,
              color: "from-purple-500 to-purple-600",
            },
            {
              title: "Horas Esta Semana",
              value: `${weeklyStats.totalHours.toFixed(1)}h`,
              icon: Clock,
              color: "from-blue-500 to-blue-600",
            },
            {
              title: "Taxa de Acerto",
              value: `${weeklyStats.accuracy.toFixed(0)}%`,
              icon: TrendingUp,
              color: "from-green-500 to-green-600",
            },
            {
              title: "Questões Respondidas",
              value: weeklyStats.totalQuestions,
              icon: Award,
              color: "from-yellow-500 to-yellow-600",
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

        <Tabs defaultValue="topics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm shadow-lg">
            <TabsTrigger
              value="topics"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
            >
              Tópicos Prioritários
            </TabsTrigger>
            <TabsTrigger
              value="recommendations"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
            >
              Recomendações
            </TabsTrigger>
            <TabsTrigger
              value="progress"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
            >
              Progresso
            </TabsTrigger>
            <TabsTrigger
              value="insights"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
            >
              Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="topics" className="space-y-4">
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm animate-fade-in-up">
              <CardHeader className="bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  Tópicos que Mais Caem no Concurso
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Estude os tópicos ordenados por frequência de aparição em provas anteriores
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Select value={selectedTopicSubject} onValueChange={setSelectedTopicSubject}>
                    <SelectTrigger className="w-full md:w-64 border-purple-200 focus:border-purple-500">
                      <SelectValue placeholder="Selecione uma matéria" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(topicsBySubject).map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="space-y-3">
                    {topicsBySubject[selectedTopicSubject as keyof typeof topicsBySubject]?.map((topic, index) => {
                      const isStudied = isTopicStudied(selectedTopicSubject, topic.name)
                      const studyData = getTopicStudyData(selectedTopicSubject, topic.name)

                      return (
                        <div
                          key={index}
                          className={`border rounded-lg p-4 transition-colors shadow-md hover:shadow-lg animate-fade-in-right ${
                            isStudied ? "bg-green-50 border-green-200" : "hover:bg-gray-50"
                          }`}
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <Checkbox
                                checked={isStudied}
                                disabled
                                className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                              />
                              <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                              <h4 className={`font-medium ${isStudied ? "text-green-800" : "text-gray-900"}`}>
                                {topic.name}
                              </h4>
                            </div>
                            <Badge className={getPercentageColor(topic.percentage)}>
                              {getPercentageIcon(topic.percentage)}
                              <span className="ml-1">{topic.percentage}%</span>
                            </Badge>
                          </div>

                          <div className="mb-3">
                            <Progress value={topic.percentage} className="h-2" />
                          </div>

                          {isStudied && studyData && (
                            <div className="mb-3 p-2 bg-green-100 rounded text-sm">
                              <p className="text-green-800">
                                ✓ Estudado em {new Date(studyData.studiedAt).toLocaleDateString("pt-BR")} •
                                {studyData.timeSpent} min •
                                {studyData.questionsAnswered > 0 &&
                                  ` ${((studyData.correctAnswers / studyData.questionsAnswered) * 100).toFixed(0)}% acerto`}
                              </p>
                            </div>
                          )}

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleStudyTopic(selectedTopicSubject, topic.name)}
                              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                            >
                              <Play className="w-4 h-4 mr-2" />
                              {isStudied ? "Estudar Novamente" : "Estudar Tópico"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-purple-300 hover:bg-purple-50 bg-transparent"
                            >
                              <Target className="w-4 h-4 mr-2" />
                              Ver Questões
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm animate-fade-in-up">
              <CardHeader className="bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  Recomendações Personalizadas
                  <Badge variant="outline" className="border-purple-300">
                    {recommendations.length} ativas
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {recommendations.length > 0 ? (
                  <div className="space-y-4">
                    {recommendations.map((rec, index) => (
                      <div
                        key={rec.id}
                        className="border rounded-lg p-4 space-y-3 shadow-md hover:shadow-lg transition-all duration-300 animate-fade-in-up"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-lg">
                            {rec.type === "study_topic" && "📚 Estudar Tópico"}
                            {rec.type === "review_topic" && "🔄 Revisar Tópico"}
                            {rec.type === "practice_questions" && "🎯 Praticar Questões"}
                            {rec.type === "take_break" && "☕ Fazer Pausa"}
                          </h3>
                          <Badge className={getPriorityColor(rec.priority)}>
                            {getPriorityIcon(rec.priority)}
                            <span className="ml-1 capitalize">{rec.priority}</span>
                          </Badge>
                        </div>

                        <p className="text-gray-600">{rec.reason}</p>

                        {rec.topic && (
                          <p className="text-sm text-purple-600 font-medium">
                            {rec.subject} • {rec.topic}
                          </p>
                        )}

                        {rec.estimatedTime > 0 && (
                          <p className="text-sm text-gray-500">⏱️ Tempo estimado: {rec.estimatedTime} minutos</p>
                        )}

                        <div className="flex gap-2">
                          {rec.type === "study_topic" && rec.topic && (
                            <Button
                              size="sm"
                              onClick={() => {
                                if (rec.topic) {
                                  handleStudyTopic(rec.subject, rec.topic);
                                }
                              }}
                              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                            >
                              <Play className="w-4 h-4 mr-2" />
                              Estudar Agora
                            </Button>
                          )}
                          {rec.type === "practice_questions" && (
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                            >
                              <Target className="w-4 h-4 mr-2" />
                              Praticar Questões
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Brain className="w-8 w-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">Nenhuma recomendação disponível</h3>
                    <p className="text-gray-500 mb-4">
                      Comece a estudar para receber recomendações personalizadas do seu coach
                    </p>
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Iniciar Estudos
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Subject Priorities */}
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm animate-fade-in-up">
              <CardHeader className="bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  Priorização por Matéria
                  {selectedSubject !== "all" && (
                    <Badge variant="outline" className="border-purple-300">
                      {availableSubjects.find((s) => s.id === selectedSubject)?.name}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {subjectPriorities.length > 0 ? (
                  <div className="space-y-4">
                    {subjectPriorities.map((subject, index) => (
                      <div
                        key={subject.id}
                        className="border rounded-lg p-4 space-y-3 shadow-md hover:shadow-lg transition-all duration-300 animate-fade-in-up"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-lg">{subject.name}</h3>
                          <Badge className={getPriorityColor(subject.priority)}>
                            {getPriorityIcon(subject.priority)}
                            <span className="ml-1 capitalize">{subject.priority}</span>
                          </Badge>
                        </div>

                        <p className="text-gray-600">{subject.recommendation}</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Tempo Estudado:</span>
                            <p className="font-semibold">{subject.studyTime}h</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Taxa de Acerto:</span>
                            <p className="font-semibold">{subject.accuracy}%</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Questões:</span>
                            <p className="font-semibold">{subject.questionCount}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Cor:</span>
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: subject.color }}></div>
                              <span className="text-xs">{subject.color}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                          >
                            <BookOpen className="w-4 h-4 mr-2" />
                            Estudar Agora
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-purple-300 hover:bg-purple-50 bg-transparent"
                          >
                            <Target className="w-4 h-4 mr-2" />
                            Ver Questões
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Brain className="w-8 w-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">Nenhuma disciplina disponível</h3>
                    <p className="text-gray-500 mb-4">
                      Cadastre questões na página de ADM para ver as disciplinas aqui
                    </p>
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Cadastrar Questões
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress" className="space-y-4">
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm animate-fade-in-up">
              <CardHeader className="bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                  Progresso por Matéria
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {studiedTopics.length > 0 ? (
                  <div className="space-y-4">
                    {availableSubjects.map((subject, index) => {
                      const progress = getSubjectProgress(subject.name)
                      if (progress.studiedTopics === 0) return null

                      return (
                        <div
                          key={subject.id}
                          className="border rounded-lg p-4 space-y-3 shadow-md animate-fade-in-up"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-lg">{subject.name}</h3>
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: subject.color }}></div>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Tópicos Estudados:</span>
                              <p className="font-semibold">{progress.studiedTopics}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Tempo Total:</span>
                              <p className="font-semibold">
                                {Math.floor(progress.totalTime / 60)}h {progress.totalTime % 60}min
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500">Taxa de Acerto:</span>
                              <p className="font-semibold">{progress.accuracy.toFixed(0)}%</p>
                            </div>
                          </div>

                          <Progress value={progress.accuracy} className="h-2" />
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="w-8 w-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">Nenhum progresso registrado</h3>
                    <p className="text-gray-500 mb-4">Comece a estudar para acompanhar seu progresso por matéria</p>
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Começar a Estudar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm animate-fade-in-up">
                <CardHeader className="bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    <span>Análise de Performance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {performanceAnalysis.map((analysis, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${
                          analysis.type === "positive"
                            ? "bg-green-50 border-green-200"
                            : analysis.type === "warning"
                              ? "bg-yellow-50 border-yellow-200"
                              : "bg-red-50 border-red-200"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {analysis.type === "positive" && <CheckCircle className="w-4 h-4 text-green-600" />}
                          {analysis.type === "warning" && <AlertTriangle className="w-4 h-4 text-yellow-600" />}
                          {analysis.type === "negative" && <AlertTriangle className="w-4 h-4 text-red-600" />}
                          <span className="font-medium text-sm">{analysis.title}</span>
                        </div>
                        <p className="text-sm text-gray-600">{analysis.message}</p>
                        {analysis.recommendation && (
                          <p className="text-xs text-gray-500 mt-1">💡 {analysis.recommendation}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm animate-fade-in-up">
                <CardHeader className="bg-gradient-to-r from-pink-500/10 to-red-500/10">
                  <CardTitle className="flex items-center space-x-2">
                    <Heart className="h-5 w-5 text-pink-600" />
                    <span>Mensagem Motivacional</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <div className="bg-gradient-to-r from-pink-500 to-red-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                      <Heart className="w-8 w-8 text-white animate-pulse" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-bold text-lg text-gray-800">{motivationalMessage.title}</h3>
                      <p className="text-gray-600">{motivationalMessage.message}</p>
                      <div className="flex items-center justify-center gap-1 text-yellow-500">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm animate-fade-in-up">
              <CardHeader className="bg-gradient-to-r from-blue-500/10 to-purple-500/10">
                <CardTitle className="flex items-center space-x-2">
                  <Lightbulb className="h-5 w-5 text-blue-600" />
                  <span>Dicas Personalizadas</span>
                  <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                    {personalizedTips.length} dicas
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {personalizedTips.map((tip, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg border bg-gradient-to-br from-white to-blue-50 hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            tip.category === "study"
                              ? "bg-blue-100"
                              : tip.category === "motivation"
                                ? "bg-green-100"
                                : tip.category === "performance"
                                  ? "bg-yellow-100"
                                  : "bg-purple-100"
                          }`}
                        >
                          {tip.category === "study" && <BookOpen className="w-4 h-4 text-blue-600" />}
                          {tip.category === "motivation" && <Zap className="w-4 h-4 text-green-600" />}
                          {tip.category === "performance" && <TrendingUp className="w-4 h-4 text-yellow-600" />}
                          {tip.category === "strategy" && <Target className="w-4 h-4 text-purple-600" />}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm mb-1">{tip.title}</h4>
                          <p className="text-xs text-gray-600">{tip.message}</p>
                          {tip.actionable && (
                            <Button size="sm" className="mt-2 h-6 text-xs bg-gradient-to-r from-blue-500 to-purple-500">
                              Aplicar Dica
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {selectedTopic && (
        <StudyTopicModal
          open={showStudyModal}
          onOpenChange={setShowStudyModal}
          subject={selectedTopic.subject}
          topic={selectedTopic.topic}
        />
      )}
    </div>
  )
}