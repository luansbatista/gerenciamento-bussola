"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Target, TrendingUp, Users, Sparkles, Zap, BookOpen, CheckCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useStudy } from "@/lib/study-context"
import { useCoach } from "@/lib/coach-context"
import { usePomodoro } from "@/lib/pomodoro-context"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { SubjectProgress } from "@/components/dashboard/subject-progress"
import { StudyChart } from "@/components/dashboard/study-chart"
import { createClient } from "@/utils/supabase/client"

export default function DashboardPage() {
  const { user } = useAuth()
  const { getWeeklyStats, studySessions, getSubjectProgress } = useStudy()
  const { isTopicStudied } = useCoach()
  const { totalFocusTime } = usePomodoro()
  const [weeklyStats, setWeeklyStats] = useState({ totalHours: 0, totalQuestions: 0, accuracy: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [availableSubjects, setAvailableSubjects] = useState<Array<{ id: string; name: string; color: string }>>([])
  const [subjectProgressData, setSubjectProgressData] = useState<Record<string, { hours: number; questions: number; accuracy: number }>>({})
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>("todos")

  const loadStats = async () => {
    if (!user) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      
      const stats = await getWeeklyStats(user.id)
      
      // Verificar se as estatísticas são válidas
      if (!stats || typeof stats !== 'object') {
        console.warn('⚠️ Estatísticas inválidas, usando valores padrão')
        setWeeklyStats({ totalHours: 0, totalQuestions: 0, accuracy: 0 })
        return
      }
      
      // Adicionar o tempo do Pomodoro aos dados do banco
      const pomodoroHours = totalFocusTime / 60
      const totalHours = stats.totalHours + pomodoroHours
      
      setWeeklyStats({
        ...stats,
        totalHours
      })
    } catch (error) {
      console.error('❌ Erro ao carregar estatísticas:', error)
      // Manter os dados padrão em caso de erro
      setWeeklyStats({ totalHours: 0, totalQuestions: 0, accuracy: 0 })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
    
    // Timeout de segurança para evitar carregamento infinito
    const timeoutId = setTimeout(() => {
      console.log('⏰ Timeout de segurança: forçando fim do carregamento')
      setIsLoading(false)
    }, 10000) // 10 segundos

    return () => clearTimeout(timeoutId)
  }, [user?.id, totalFocusTime]) // Remover studySessions para evitar loops infinitos

  // Carregar disciplinas disponíveis
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('questions')
          .select('disciplina, subject')
          .not('disciplina', 'is', null)

        if (error) {
          console.error('Erro ao buscar disciplinas:', error)
          return
        }

        const subjects = new Set<string>()
        data?.forEach(item => {
          if (item.disciplina) subjects.add(item.disciplina)
          if (item.subject) subjects.add(item.subject)
        })

        const subjectsArray = Array.from(subjects).map((name, index) => ({
          id: index.toString(),
          name,
          color: `hsl(${index * 30}, 70%, 50%)`
        }))

        setAvailableSubjects(subjectsArray)
      } catch (error) {
        console.error('Erro ao buscar disciplinas:', error)
      }
    }

    fetchSubjects()
  }, [])

  // Carregar progresso das disciplinas
  useEffect(() => {
    const loadSubjectProgress = async () => {
      if (!user?.id || availableSubjects.length === 0) return

      try {
        const progressData: Record<string, { hours: number; questions: number; accuracy: number }> = {}
        
        for (const subject of availableSubjects) {
          try {
            const progress = await getSubjectProgress(subject.name, user.id)
            progressData[subject.name] = progress
          } catch (subjectError) {
            console.error(`Erro ao carregar progresso para ${subject.name}:`, subjectError)
            progressData[subject.name] = { hours: 0, questions: 0, accuracy: 0 }
          }
        }
        
        setSubjectProgressData(progressData)
      } catch (error) {
        console.error('Erro ao carregar progresso das disciplinas:', error)
      }
    }

    loadSubjectProgress()
  }, [user?.id, availableSubjects])

  // Mapeamento de prioridades baseado nos dados reais fornecidos
  const getSubjectPriority = (subjectName: string) => {
    const priorityMap: Record<string, { priority: 'high' | 'medium' | 'low', percentage: number }> = {
      'Português': { priority: 'high', percentage: 100 },
      'Matemática': { priority: 'high', percentage: 100 },
      'Direito Constitucional': { priority: 'high', percentage: 100 },
      'Direito Penal': { priority: 'high', percentage: 100 },
      'Direito Administrativo': { priority: 'high', percentage: 100 },
      'Direito Penal Militar': { priority: 'high', percentage: 100 },
      'História do Brasil': { priority: 'medium', percentage: 100 },
      'Geografia do Brasil': { priority: 'medium', percentage: 100 },
      'Informática': { priority: 'medium', percentage: 100 },
      'Atualidades': { priority: 'medium', percentage: 100 },
      'Direitos Humanos': { priority: 'medium', percentage: 100 },
      'Constituição do estado da Bahia': { priority: 'medium', percentage: 100 }
    }
    
    return priorityMap[subjectName] || { priority: 'low', percentage: 25 }
  }

  // Mapeamento detalhado dos assuntos por disciplina
  const getSubjectTopics = (subjectName: string) => {
    const topicsMap: Record<string, Array<{ name: string, percentage: number }>> = {
      'Português': [
        { name: 'Compreensão e interpretação de textos', percentage: 57 },
        { name: 'Tipologia textual e gêneros textuais', percentage: 4 },
        { name: 'Ortografia oficial', percentage: 2 },
        { name: 'Acentuação gráfica', percentage: 2 },
        { name: 'Classes de palavras', percentage: 2 },
        { name: 'Uso do sinal indicativo de crase', percentage: 5 },
        { name: 'Sintaxe da oração e do período', percentage: 2 },
        { name: 'Pontuação', percentage: 9 },
        { name: 'Concordância nominal e verbal', percentage: 9 },
        { name: 'Regência nominal e verbal', percentage: 5 },
        { name: 'Significação das palavras', percentage: 3 }
      ],
      'História do Brasil': [
        { name: 'Descobrimento do Brasil (1500)', percentage: 4 },
        { name: 'Brasil Colônia (1530-1815)', percentage: 9 },
        { name: 'Independência do Brasil (1822)', percentage: 11 },
        { name: 'Primeiro Reinado (1822-1831)', percentage: 8 },
        { name: 'Segundo Reinado (1831-1840)', percentage: 12 },
        { name: 'Primeira República (1889-1930)', percentage: 9 },
        { name: 'Revolução de 1930', percentage: 12 },
        { name: 'Era Vargas (1930-1945)', percentage: 13 },
        { name: 'Os Presidentes do Brasil de 1964 à atualidade', percentage: 0 },
        { name: 'História da Bahia', percentage: 3 },
        { name: 'Independência da Bahia', percentage: 2 },
        { name: 'Revolta de Canudos', percentage: 5 },
        { name: 'Revolta dos Malês', percentage: 5 },
        { name: 'Conjuração Baiana', percentage: 5 },
        { name: 'Sabinada', percentage: 5 }
      ],
      'Geografia do Brasil': [
        { name: 'Relevo brasileiro', percentage: 11 },
        { name: 'Urbanização', percentage: 23 },
        { name: 'Tipos de fontes de energia brasileira', percentage: 10 },
        { name: 'Problemas Ambientais', percentage: 18 },
        { name: 'Climas', percentage: 20 },
        { name: 'Geografia da Bahia', percentage: 18 }
      ],
      'Matemática': [
        { name: 'Conjuntos numéricos', percentage: 13 },
        { name: 'Álgebra', percentage: 3 },
        { name: 'Funções', percentage: 5 },
        { name: 'Sistemas lineares, Matrizes e Determinantes', percentage: 16 },
        { name: 'Análise Combinatória', percentage: 35 },
        { name: 'Geometria e Medidas', percentage: 25 },
        { name: 'Trigonometria', percentage: 4 }
      ],
      'Atualidades': [
        { name: 'Globalização', percentage: 58 },
        { name: 'Multiculturalidade, Pluralidade e Diversidade Cultural', percentage: 20 },
        { name: 'Tecnologias de Informação e Comunicação', percentage: 22 }
      ],
      'Informática': [
        { name: 'Conceitos e modos de utilização de aplicativos para edição de textos', percentage: 62 },
        { name: 'Sistemas operacionais Windows 7, Windows 10 e Linux', percentage: 25 },
        { name: 'Organização e gerenciamento de informações, arquivos, pastas e programas', percentage: 2 },
        { name: 'Atalhos de teclado, ícones, área de trabalho e lixeira', percentage: 2 },
        { name: 'Conceitos básicos e modos de utilização de tecnologias, ferramentas, aplicativos e procedimentos associados à Internet e intranet', percentage: 4 },
        { name: 'Correio eletrônico', percentage: 4 },
        { name: 'Computação em nuvem', percentage: 1 }
      ],
      'Direito Constitucional': [
        { name: 'Dos princípios fundamentais', percentage: 31 },
        { name: 'Dos Direitos e garantias fundamentais', percentage: 4 },
        { name: 'Da organização do Estado', percentage: 3 },
        { name: 'Da Administração Pública', percentage: 49 },
        { name: 'Dos militares dos Estados, do Distrito Federal e dos Territórios', percentage: 1 },
        { name: 'Da Segurança Pública', percentage: 10 }
      ],
      'Constituição do estado da Bahia': [
        { name: 'Dos princípios fundamentais', percentage: 5 },
        { name: 'Direitos e garantias fundamentais', percentage: 5 },
        { name: 'Dos Servidores Públicos Militares', percentage: 5 },
        { name: 'Da Segurança Pública', percentage: 5 }
      ],
      'Direitos Humanos': [
        { name: 'A Declaração Universal dos Direitos Humanos/1948', percentage: 64 },
        { name: 'Convenção Americana sobre Direitos Humanos/1969 (Pacto de São José da Costa Rica) (art. 1° ao 32)', percentage: 4 },
        { name: 'Pacto Internacional dos Direitos Econômicos, Sociais e Culturais (art. 1° ao 15)', percentage: 18 },
        { name: 'Declaração de Pequim Adotada pela Quarta Conferência Mundial sobre as Mulheres', percentage: 14 }
      ],
      'Direito Administrativo': [
        { name: 'Administração Pública', percentage: 23 },
        { name: 'Princípios fundamentais da administração pública', percentage: 35 },
        { name: 'Poderes e deveres dos administradores públicos', percentage: 30 },
        { name: 'Servidores públicos: cargo, emprego e função públicos', percentage: 10 },
        { name: 'Regime jurídico do militar estadual: Estatuto dos Policiais Militares do Estado da Bahia (Lei estadual nº 7.990 - arts 1º ao 59)', percentage: 2 }
      ],
      'Direito Penal': [
        { name: 'Elementos', percentage: 3 },
        { name: 'Consumação e tentativa', percentage: 10 },
        { name: 'Desistência voluntária e arrependimento eficaz', percentage: 6 },
        { name: 'Arrependimento posterior', percentage: 2 },
        { name: 'Crime impossível', percentage: 1 },
        { name: 'Causas de exclusão de ilicitude e culpabilidade', percentage: 7 },
        { name: 'Contravenção', percentage: 0 },
        { name: 'Dos crimes contra a vida', percentage: 24 },
        { name: 'Dos crimes contra a liberdade pessoal', percentage: 1 },
        { name: 'Dos crimes contra o patrimônio', percentage: 9 },
        { name: 'Dos crimes contra a dignidade sexual', percentage: 8 },
        { name: 'Corrupção ativa', percentage: 10 },
        { name: 'Corrupção passiva', percentage: 21 },
        { name: 'Lei n° 9.455 (Crimes de tortura)', percentage: 2 }
      ],
      'Direito Penal Militar': [
        { name: 'Dos crimes contra a autoridade ou disciplina militar', percentage: 19 },
        { name: 'Da violência contra superior ou militar de serviço', percentage: 19 },
        { name: 'Desrespeito a superior', percentage: 6 },
        { name: 'Recusa de obediência', percentage: 19 },
        { name: 'Reunião ilícita', percentage: 16 },
        { name: 'Publicação ou crítica indevida', percentage: 0 },
        { name: 'Resistência mediante ameaça ou violência', percentage: 10 },
        { name: 'Dos crimes contra o serviço militar e o dever militar', percentage: 3 },
        { name: 'Crimes contra a Administração Militar', percentage: 3 },
        { name: 'Dos crimes contra o dever funcional', percentage: 3 }
      ]
    }
    
    return topicsMap[subjectName] || []
  }

  // Função para contar tópicos estudados de uma disciplina
  const getStudiedTopicsCount = (subjectName: string) => {
    // Usar dados reais do contexto do coach
    const topics = getSubjectTopics(subjectName)
    return topics.filter(topic => isTopicStudied(subjectName, topic.name)).length
  }

  // Função para contar total de tópicos de uma disciplina
  const getTotalTopicsCount = (subjectName: string) => {
    // Usar os dados reais fornecidos
    const topics = getSubjectTopics(subjectName)
    return topics.length
  }

  // Função para calcular estatísticas totais de todas as disciplinas
  const getTotalStats = useCallback(() => {
    try {
      let totalStudied = 0
      let totalTopics = 0
      
      if (availableSubjects.length === 0) {
        return { totalStudied: 0, totalTopics: 0 }
      }
      
      availableSubjects.forEach(subject => {
        try {
          const studiedTopics = getStudiedTopicsCount(subject.name)
          const subjectTotalTopics = getTotalTopicsCount(subject.name)
          totalStudied += studiedTopics || 0
          totalTopics += subjectTotalTopics || 0
        } catch (subjectError) {
          console.error(`Erro ao calcular estatísticas para ${subject.name}:`, subjectError)
        }
      })
      
      return { totalStudied, totalTopics }
    } catch (error) {
      console.error('Erro em getTotalStats:', error)
      return { totalStudied: 0, totalTopics: 0 }
    }
  }, [availableSubjects])

  // Função para filtrar disciplinas baseado na seleção
  const getFilteredSubjects = useCallback(() => {
    try {
      if (selectedSubjectFilter === "todos") {
        return availableSubjects
      }
      return availableSubjects.filter(subject => subject.name === selectedSubjectFilter)
    } catch (error) {
      console.error('Erro em getFilteredSubjects:', error)
      return availableSubjects
    }
  }, [selectedSubjectFilter, availableSubjects])

  // Escutar evento de atualização de estatísticas
  useEffect(() => {
    const handleStatsUpdate = () => {
      loadStats()
      // Recarregar progresso das disciplinas também
      if (user?.id && availableSubjects.length > 0) {
        const loadSubjectProgress = async () => {
          try {
            const progressData: Record<string, { hours: number; questions: number; accuracy: number }> = {}
            
            for (const subject of availableSubjects) {
              const progress = await getSubjectProgress(subject.name, user.id)
              progressData[subject.name] = progress
            }
            
            setSubjectProgressData(progressData)
          } catch (error) {
            console.error('Erro ao recarregar progresso das disciplinas:', error)
          }
        }
        loadSubjectProgress()
      }
    }

    window.addEventListener('statsUpdated', handleStatsUpdate)
    
    return () => {
      window.removeEventListener('statsUpdated', handleStatsUpdate)
    }
  }, [user?.id, availableSubjects, totalFocusTime])

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando usuário...</p>
        </div>
      </div>
    )
  }

  const todayStudyHours = weeklyStats.totalHours / 7 // Média diária da semana
  const dailyGoal = user.studyGoal || 4
  const progressPercentage = dailyGoal > 0 ? (todayStudyHours / dailyGoal) * 100 : 0

  // Tratamento de erro para dados carregando
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados...</p>
          <p className="text-sm text-gray-400 mt-2">User: {user?.email || 'N/A'}</p>
          <p className="text-sm text-gray-400">TotalFocusTime: {totalFocusTime}</p>
        </div>
      </div>
    )
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 w-full">
      {/* Header */}
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

      {/* Conteúdo Principal */}
      <div className="px-4 md:px-8 py-8 space-y-8">
        {/* Cards de Estatísticas */}
        <div className="animate-fade-in-up delay-100">
          <StatsCards />
        </div>

        {/* Grid Principal */}
        <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
            {/* Card de Progresso Diário */}
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
                {/* Barra de Progresso */}
                <div className="space-y-4">
                  <div className="flex justify-between text-base font-medium">
                    <span className="text-slate-600">Meta: {dailyGoal}h</span>
                    <span className="font-bold text-slate-800">{todayStudyHours.toFixed(1)}h estudadas</span>
                  </div>
                  <Progress value={progressPercentage} className="h-4" />
                </div>
                
                {/* Informações Adicionais */}
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

            {/* Gráfico de Estudos */}
            <div className="animate-fade-in-up animation-delay-300">
              <StudyChart />
            </div>

            {/* Card de Recomendações Personalizadas */}
            <div className="animate-fade-in-up animation-delay-400">
              <Card className="shadow-soft border-0 hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-6">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-4 text-2xl font-bold text-slate-800">
                      <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg animate-pulse-subtle">
                        <Sparkles className="h-6 w-6 text-white" />
                      </div>
                      Recomendações Personalizadas
                    </CardTitle>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-600">Filtrar por:</span>
                      <Select value={selectedSubjectFilter} onValueChange={setSelectedSubjectFilter}>
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todas as Disciplinas</SelectItem>
                          {availableSubjects.map((subject) => (
                            <SelectItem key={subject.id} value={subject.name}>
                              {subject.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {/* Estado de Carregamento */}
                    {availableSubjects.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500">Carregando disciplinas...</p>
                      </div>
                    ) : selectedSubjectFilter === "todos" ? (
                      // Mostrar estatísticas totais quando "todos" estiver selecionado
                      <div key="total-stats" className="p-4 rounded-lg border bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-gray-900">Todas as Disciplinas</h4>
                          <Badge className="bg-blue-500 text-white">
                            Visão Geral
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Progresso Geral dos Assuntos:</span>
                            <span className="font-medium">{getTotalStats().totalStudied}/{getTotalStats().totalTopics} assuntos estudados</span>
                          </div>
                          <Progress 
                            value={getTotalStats().totalTopics > 0 ? (getTotalStats().totalStudied / getTotalStats().totalTopics) * 100 : 0} 
                            className="h-2" 
                          />
                        </div>
                      </div>
                    ) : (
                      // Mostrar disciplinas filtradas
                      getFilteredSubjects().map((subject, index) => {
                        const progress = subjectProgressData[subject.name] || { hours: 0, questions: 0, accuracy: 0 }
                        const studiedTopics = getStudiedTopicsCount(subject.name)
                        const totalTopics = getTotalTopicsCount(subject.name)
                        
                        return (
                          <div key={`${subject.id}-${selectedSubjectFilter}`} className={`p-4 rounded-lg border ${
                            getSubjectPriority(subject.name).priority === 'high' ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' :
                            getSubjectPriority(subject.name).priority === 'medium' ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' :
                            'bg-gradient-to-r from-red-50 to-pink-50 border-red-200'
                          }`}>
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold text-gray-900">{subject.name}</h4>
                              <Badge className={`${
                                getSubjectPriority(subject.name).priority === 'high' ? 'bg-green-500' :
                                getSubjectPriority(subject.name).priority === 'medium' ? 'bg-yellow-500' :
                                'bg-red-500'
                              } text-white`}>
                                {Math.round(getSubjectTopics(subject.name).reduce((sum, topic) => sum + topic.percentage, 0) / getSubjectTopics(subject.name).length)}% média
                              </Badge>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Progresso dos Assuntos:</span>
                                <span className="font-medium">{studiedTopics}/{totalTopics} assuntos estudados</span>
                              </div>
                              <Progress 
                                value={totalTopics > 0 ? (studiedTopics / totalTopics) * 100 : 0} 
                                className="h-2" 
                              />
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Card de Progresso por Matéria */}
            <div className="animate-fade-in-up animation-delay-500">
              <SubjectProgress />
            </div>
        </div>
      </div>
    </div>
  )
}
