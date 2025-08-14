"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Filter, BookOpen } from "lucide-react"
import { QuestionFilters } from "@/components/questions/question-filters"
import { QuestionCard } from "@/components/questions/question-card"
import { QuestionStats } from "@/components/questions/question-stats"

import { useSidebar } from "@/lib/sidebar-context"
import { useQuestions } from "@/lib/questions-context"
import { useAuth } from "@/lib/auth-context"
import { createClient } from "@/utils/supabase/client"

export default function QuestionsPage() {
  const { isCollapsed } = useSidebar()
  const { questions, subjects, isLoading } = useQuestions()
  const { user } = useAuth()
  const supabase = createClient()
  const [selectedSubject, setSelectedSubject] = useState<string>("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all")
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [answeredQuestions, setAnsweredQuestions] = useState<Record<string, number>>({})
  const [showExplanation, setShowExplanation] = useState<Record<string, boolean>>({})
  const [userAttempts, setUserAttempts] = useState<Record<string, number>>({})
  const [isLoadingAttempts, setIsLoadingAttempts] = useState(false)

  // Buscar tentativas do usuário do banco de dados
  const fetchUserAttempts = async () => {
    if (!user?.id) return
    
    setIsLoadingAttempts(true)
    try {
      const { data, error } = await supabase
        .from('question_attempts')
        .select('question_id, selected_answer, is_correct')
        .eq('user_id', user.id)

      if (error) {
        console.error('Erro ao buscar tentativas do usuário:', error)
        return
      }

      if (data) {
        const attemptsMap: Record<string, number> = {}
        data.forEach(attempt => {
          attemptsMap[attempt.question_id] = attempt.selected_answer
        })
        setUserAttempts(attemptsMap)
        console.log('Tentativas carregadas do banco:', attemptsMap)
      }
    } catch (error) {
      console.error('Erro ao buscar tentativas:', error)
    } finally {
      setIsLoadingAttempts(false)
    }
  }

  // Carregar tentativas quando o usuário mudar
  useEffect(() => {
    fetchUserAttempts()
  }, [user?.id])

  // Combinar tentativas do banco com respostas da sessão atual
  const allAnsweredQuestions = { ...userAttempts, ...answeredQuestions }

  // Filter questions based on selected criteria
  const filteredQuestions = questions.filter((question) => {
    if (selectedSubject !== "all" && question.disciplina !== selectedSubject) return false
    if (selectedDifficulty !== "all" && question.difficulty !== selectedDifficulty) return false
    return true
  })

  const currentQuestion = filteredQuestions[currentQuestionIndex]
  const totalQuestions = filteredQuestions.length
  const answeredCount = Object.keys(allAnsweredQuestions).length
  const correctCount = Object.entries(allAnsweredQuestions).filter(([questionId, selectedAnswer]) => {
    const question = questions.find(q => q.id === questionId)
    return question && selectedAnswer === question.correct_answer
  }).length

  const handleAnswer = async (questionId: string, selectedAnswer: number) => {
    console.log('handleAnswer - Iniciando salvamento:', { questionId, selectedAnswer, userId: user?.id })
    
    setAnsweredQuestions((prev) => ({ ...prev, [questionId]: selectedAnswer }))
    setShowExplanation((prev) => ({ ...prev, [questionId]: true }))

    // Salvar resposta no banco de dados
    try {
      const currentQuestion = questions.find(q => q.id === questionId)
      if (!currentQuestion || !user?.id) {
        console.warn('Questão ou usuário não encontrado')
        return
      }

      const isCorrect = selectedAnswer === currentQuestion.correct_answer
      console.log('handleAnswer - Dados da questão:', { 
        questionId, 
        selectedAnswer, 
        correctAnswer: currentQuestion.correct_answer, 
        isCorrect,
        userId: user.id 
      })

      // Adicionar um pequeno delay para evitar conflitos de UNIQUE constraint
      const now = new Date()
      now.setMilliseconds(now.getMilliseconds() + Math.random() * 1000)

      const insertData = {
        question_id: questionId,
        user_id: user.id,
        selected_answer: selectedAnswer,
        is_correct: isCorrect,
        attempted_at: now.toISOString(),
        time_spent: 0 // Valor padrão, pode ser implementado com timer no futuro
      }

      console.log('handleAnswer - Dados para inserção:', insertData)

      const { error } = await supabase
        .from('question_attempts')
        .insert(insertData)

      if (error) {
        console.error('Erro ao salvar resposta:', error)
        // Se for erro de UNIQUE constraint, tentar novamente com timestamp diferente
        if (error.code === '23505') {
          console.log('handleAnswer - Tentando novamente devido a constraint UNIQUE')
          const retryNow = new Date()
          retryNow.setMilliseconds(retryNow.getMilliseconds() + Math.random() * 2000)
          
          const retryData = {
            ...insertData,
            attempted_at: retryNow.toISOString()
          }
          
          const { error: retryError } = await supabase
            .from('question_attempts')
            .insert(retryData)
          
          if (retryError) {
            console.error('Erro ao salvar resposta (tentativa 2):', retryError)
          } else {
            console.log('handleAnswer - Resposta salva com sucesso na tentativa 2')
          }
        }
      } else {
        console.log('handleAnswer - Resposta salva com sucesso')
        // Recarregar tentativas do banco para atualizar estatísticas
        await fetchUserAttempts()
      }
    } catch (error) {
      console.error('Erro ao salvar resposta:', error)
      // Não interromper o fluxo da aplicação, apenas logar o erro
    }
  }

  // Mostrar loading enquanto carrega
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-lg">Carregando questões...</p>
        </div>
      </div>
    )
  }

  const nextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header com gradiente */}
      <div className="relative bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-transparent"></div>

        <div className="relative px-8 py-12 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg animate-bounce-subtle">
                <BookOpen className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
                  Banco de Questões
                </h1>
                <p className="text-purple-100 text-lg mt-2">
                  Pratique com questões organizadas por matéria e dificuldade
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-6 py-3 font-medium bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-all duration-300"
            >
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8">
        <div className="animate-fade-in-up animation-delay-100">
          <QuestionStats 
            totalQuestions={questions.length} 
            answeredCount={answeredCount} 
            correctCount={correctCount} 
            isLoading={isLoadingAttempts}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-fade-in-up animation-delay-200">
          {/* Filters Sidebar */}
          <div className={`lg:col-span-1 ${showFilters ? "block" : "hidden lg:block"}`}>
            <QuestionFilters
              subjects={subjects}
              selectedSubject={selectedSubject}
              selectedDifficulty={selectedDifficulty}
              onSubjectChange={setSelectedSubject}
              onDifficultyChange={setSelectedDifficulty}
            />
          </div>

          {/* Main Question Area */}
          <div className="lg:col-span-3 space-y-8">
            {currentQuestion ? (
              <>
                {/* Question Progress */}
                <Card className="shadow-soft border-0 animate-fade-in-up animation-delay-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium">
                        Questão {currentQuestionIndex + 1} de {totalQuestions}
                      </span>
                                          <Badge variant="outline" className="animate-pulse-subtle">
                      {subjects.find((s) => s.id === currentQuestion.disciplina)?.name || currentQuestion.disciplina}
                    </Badge>
                    </div>
                    <Progress value={((currentQuestionIndex + 1) / totalQuestions) * 100} className="h-3" />
                  </CardContent>
                </Card>

                {/* Question Card */}
                <div className="animate-fade-in-up animation-delay-400">
                  <QuestionCard
                    question={currentQuestion}
                    selectedAnswer={answeredQuestions[currentQuestion.id]}
                    showExplanation={showExplanation[currentQuestion.id] || false}
                    onAnswer={(answer) => handleAnswer(currentQuestion.id, answer)}
                  />
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between animate-fade-in-up animation-delay-500">
                  <Button
                    variant="outline"
                    onClick={previousQuestion}
                    disabled={currentQuestionIndex === 0}
                    className="hover:scale-105 transition-transform duration-200 bg-transparent"
                  >
                    Anterior
                  </Button>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {currentQuestionIndex + 1} / {totalQuestions}
                    </span>
                  </div>
                  <Button
                    onClick={nextQuestion}
                    disabled={currentQuestionIndex === totalQuestions - 1}
                    className="hover:scale-105 transition-transform duration-200"
                  >
                    Próxima
                  </Button>
                </div>
              </>
            ) : (
              <Card className="shadow-soft border-0 animate-fade-in-up animation-delay-300">
                <CardContent className="p-8 text-center">
                  <div className="max-w-md mx-auto">
                    <div className="p-4 bg-gradient-to-br from-purple-100 to-violet-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                      <BookOpen className="h-10 w-10 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Nenhuma questão encontrada</h3>
                    <p className="text-muted-foreground">Ajuste os filtros para ver questões disponíveis.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
