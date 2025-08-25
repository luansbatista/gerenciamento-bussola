"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BarChart3, 
  BookOpen, 
  Target, 
  Play, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  Heart,
  Star,
  Lightbulb,
  Zap,
  Plus,
  Brain
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useCoach } from "@/lib/coach-context"
import { StudyTopicModal } from "@/components/coach/study-topic-modal"
import { createClient } from "@/utils/supabase/client"

interface Topic {
  name: string
  percentage: number
}

interface Subject {
  id: string
  name: string
  color: string
}

export default function CoachPage() {
  const { user } = useAuth()
  const { markTopicAsStudied, isTopicStudied, getTopicStudyData } = useCoach()
  const [selectedTopicSubject, setSelectedTopicSubject] = useState("")
  const [showStudyModal, setShowStudyModal] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState<{ subject: string; topic: string } | null>(null)
  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([])
  const [topicsBySubject, setTopicsBySubject] = useState<Record<string, Topic[]>>({})

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
        
        if (subjectsArray.length > 0) {
          const initialSubject = subjectsArray[0].name
          setSelectedTopicSubject(initialSubject)
          
          // Carregar tópicos da disciplina inicial
          const initialTopics = getSubjectTopics(initialSubject)
          setTopicsBySubject(prev => ({
            ...prev,
            [initialSubject]: initialTopics
          }))
        }
      } catch (error) {
        console.error('Erro ao buscar disciplinas:', error)
      }
    }

    fetchSubjects()
  }, [])

  useEffect(() => {
    const loadTopics = () => {
      if (!selectedTopicSubject) return

      const topics = getSubjectTopics(selectedTopicSubject)
      
      setTopicsBySubject(prev => ({
        ...prev,
        [selectedTopicSubject]: topics
      }))
    }

    loadTopics()
  }, [selectedTopicSubject])

  const handleStudyTopic = (subject: string, topic: string) => {
    setSelectedTopic({ subject, topic })
    setShowStudyModal(true)
  }

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 50) return "bg-green-500 text-white"
    if (percentage >= 20) return "bg-yellow-500 text-white"
    return "bg-red-500 text-white"
  }

  const getPercentageIcon = (percentage: number) => {
    if (percentage >= 50) return "🔥"
    if (percentage >= 20) return "⚡"
    return "📚"
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Coach de Estudos
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Seu assistente personalizado para otimizar seus estudos e maximizar suas chances de aprovação
        </p>
      </div>

      <div className="space-y-6">
        <Tabs defaultValue="topics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-1 bg-gray-100 p-1 rounded-lg">
            <TabsTrigger
              value="topics"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
            >
              Assuntos do Edital
            </TabsTrigger>
          </TabsList>

          <TabsContent value="topics" className="space-y-4">
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm animate-fade-in-up">
              <CardHeader className="bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  Assuntos do Edital
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
                      {availableSubjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.name}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="space-y-3">
                    {topicsBySubject[selectedTopicSubject]?.map((topic, index) => {
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
                              <span className="ml-1">{topic.percentage}% chance de cair</span>
                            </Badge>
                          </div>

                          <div className="mb-3">
                            <Progress value={topic.percentage} className="h-2" />
                          </div>

                          {isStudied && studyData && (
                            <div className="mb-3 p-2 bg-green-100 rounded text-sm">
                              <p className="text-green-800">
                                <strong>Estudado em:</strong> {new Date(studyData.studiedAt).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          )}

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleStudyTopic(selectedTopicSubject, topic.name)}
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
                      )
                    })}
                  </div>
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