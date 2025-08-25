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
import { useStudy } from "@/lib/study-context"
import { createClient } from "@/utils/supabase/client"

export default function QuestionsPage() {
  const { isCollapsed } = useSidebar()
  const { questions, subjects, isLoading } = useQuestions()
  const { user } = useAuth()
  const { refreshStats } = useStudy()
  const supabase = createClient()
  const [selectedSubject, setSelectedSubject] = useState<string>("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("unanswered") // unanswered, correct, incorrect
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [answeredQuestions, setAnsweredQuestions] = useState<Record<string, number>>({})
  const [showExplanation, setShowExplanation] = useState<Record<string, boolean>>({})
  const [userAttempts, setUserAttempts] = useState<Record<string, number>>({})
  const [isLoadingAttempts, setIsLoadingAttempts] = useState(false)
  const [isUpdatingStats, setIsUpdatingStats] = useState(false)

  // Buscar tentativas do usuário do banco de dados
  const fetchUserAttempts = async () => {
    if (!user?.id) {
      setUserAttempts({})
      return
    }
    
    try {
      // Adicionar timeout para evitar travamento
      const queryPromise = supabase
        .from('question_attempts')
        .select('question_id, selected_answer, is_correct')
        .eq('user_id', user.id)

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout na busca de tentativas')), 5000)
      )

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any

      if (error) {
        console.error('❌ Erro ao buscar tentativas:', error)
        setUserAttempts({})
        return
      }

      if (data && Array.isArray(data)) {
        const attemptsMap: Record<string, number> = {}
        data.forEach(attempt => {
          // Converter selected_answer de string para número (a=0, b=1, c=2, d=3, e=4)
          const answerStr = String(attempt.selected_answer || '').toLowerCase()
          const answerNumber = answerStr === 'a' ? 0 : 
                              answerStr === 'b' ? 1 : 
                              answerStr === 'c' ? 2 : 
                              answerStr === 'd' ? 3 : 
                              answerStr === 'e' ? 4 : 
                              parseInt(answerStr) || 0
          attemptsMap[attempt.question_id] = answerNumber
        })
        setUserAttempts(attemptsMap)
      } else {
        setUserAttempts({})
      }
    } catch (error) {
      console.error('❌ Erro ao buscar tentativas:', error)
      setUserAttempts({})
    }
  }

  // Carregar tentativas quando o usuário mudar
  useEffect(() => {
    if (user?.id) {
    fetchUserAttempts()
    }
  }, [user?.id])

  // Combinar tentativas do banco com respostas da sessão atual
  const allAnsweredQuestions = { ...userAttempts, ...answeredQuestions }

  // Buscar tentativas do banco para verificar status das questões
  const fetchQuestionAttempts = async () => {
    if (!user?.id) return {}
    
    try {
      // Adicionar timeout para evitar travamento
      const queryPromise = supabase
        .from('question_attempts')
        .select('question_id, is_correct')
        .eq('user_id', user.id)

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout na busca de status')), 5000)
      )

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any

      if (error) {
        console.error('❌ Erro ao buscar tentativas para filtro:', error)
        return {}
      }

      if (data && Array.isArray(data)) {
        const attemptsMap: Record<string, { answered: boolean, correct: boolean }> = {}
        data.forEach(attempt => {
          attemptsMap[attempt.question_id] = {
            answered: true,
            correct: attempt.is_correct
          }
        })
        return attemptsMap
      }
      return {}
    } catch (error) {
      console.error('❌ Erro ao buscar tentativas para filtro:', error)
      return {}
    }
  }

  // Estado para armazenar o status das questões
  const [questionStatuses, setQuestionStatuses] = useState<Record<string, { answered: boolean, correct: boolean }>>({})

  // Carregar status das questões
  useEffect(() => {
    const loadQuestionStatuses = async () => {
      if (user?.id) {
        const statuses = await fetchQuestionAttempts()
        setQuestionStatuses(statuses)
      }
    }
    loadQuestionStatuses()
  }, [user?.id])

  // Filter questions based on selected criteria
  const filteredQuestions = questions.filter((question) => {
    // Filtro por matéria/disciplina
    if (selectedSubject !== "all") {
      // Buscar o nome da disciplina selecionada
      const selectedSubjectData = subjects.find(s => s.id === selectedSubject)
      if (!selectedSubjectData) return false
      
      const questionDisciplina = question.disciplina || question.subject || ''
      const normalizedQuestionDisciplina = questionDisciplina.trim().toLowerCase()
      const normalizedSelectedSubjectName = selectedSubjectData.name.trim().toLowerCase()
      
      // Verificar se a questão pertence à disciplina selecionada
      if (normalizedQuestionDisciplina !== normalizedSelectedSubjectName) {
        return false
      }
    }
    
    // Filtro por dificuldade
    if (selectedDifficulty !== "all") {
      const questionDifficulty = question.difficulty || question.nivel || 'medium'
      const mappedDifficulty = questionDifficulty.toLowerCase() === 'fácil' ? 'easy' :
                              questionDifficulty.toLowerCase() === 'médio' ? 'medium' :
                              questionDifficulty.toLowerCase() === 'difícil' ? 'hard' :
                              questionDifficulty.toLowerCase() === 'easy' ? 'easy' :
                              questionDifficulty.toLowerCase() === 'medium' ? 'medium' :
                              questionDifficulty.toLowerCase() === 'hard' ? 'hard' : 'medium'
      
      if (mappedDifficulty !== selectedDifficulty) {
        return false
      }
    }

    // Filtro por status da questão
    if (selectedStatus !== "all") {
      const questionStatus = questionStatuses[question.id]
      
      if (selectedStatus === "unanswered") {
        // Mostrar apenas questões não respondidas
        if (questionStatus?.answered) {
          return false
        }
      } else if (selectedStatus === "correct") {
        // Mostrar apenas questões acertadas
        if (!questionStatus?.answered || !questionStatus?.correct) {
          return false
        }
      } else if (selectedStatus === "incorrect") {
        // Mostrar apenas questões erradas
        if (!questionStatus?.answered || questionStatus?.correct) {
          return false
        }
      }
    }
    
    return true
  })

  // Log para debug do filtro
  useEffect(() => {
    console.log('🔍 Filtro aplicado:', {
      selectedSubject,
      selectedDifficulty,
      selectedStatus,
      totalQuestions: questions.length,
      filteredQuestions: filteredQuestions.length,
      questionStatusesCount: Object.keys(questionStatuses).length
    })
  }, [selectedSubject, selectedDifficulty, selectedStatus, questions.length, filteredQuestions.length, questionStatuses])


  const currentQuestion = filteredQuestions[currentQuestionIndex]
  const totalQuestions = filteredQuestions.length
  
  // Calcular estatísticas baseadas apenas no banco de dados (persistentes)
  const [statsFromDB, setStatsFromDB] = useState({
    answeredCount: 0,
    correctCount: 0,
    accuracyRate: 0
  })

  // Buscar estatísticas do banco de dados
  const fetchStatsFromDB = async () => {
    if (!user?.id) {
      // Resetar estatísticas se não há usuário
      setStatsFromDB({
        answeredCount: 0,
        correctCount: 0,
        accuracyRate: 0
      })
      return
    }
    
    try {
      // Pequeno delay para garantir que o banco processou a inserção
      await new Promise(resolve => setTimeout(resolve, 200))
      
      // Adicionar timeout para evitar travamento
      const queryPromise = supabase
        .from('question_attempts')
        .select('is_correct')
        .eq('user_id', user.id)

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout na query')), 5000)
      )

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any

      if (error) {
        console.error('❌ Erro na query:', error)
        // Em caso de erro, manter estatísticas atuais
        return
      }

      if (data && Array.isArray(data)) {
        const answeredCount = data.length
        const correctCount = data.filter(attempt => attempt.is_correct).length
        const accuracyRate = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0
        
        setStatsFromDB({
          answeredCount,
          correctCount,
          accuracyRate
        })
      } else {
        // Se não há dados, resetar para zero
        setStatsFromDB({
          answeredCount: 0,
          correctCount: 0,
          accuracyRate: 0
        })
      }
    } catch (error) {
      console.error('❌ Erro em fetchStatsFromDB:', error)
      // Em caso de erro, manter estatísticas atuais
    }
  }

  // Carregar estatísticas quando o usuário mudar
  useEffect(() => {
    if (user?.id) {
      fetchStatsFromDB()
    }
  }, [user?.id])

  // Remover recarregamento automático que pode causar travamentos
  // useEffect(() => {
  //   if (!user?.id) return
  //   
  //   const interval = setInterval(() => {
  //     fetchStatsFromDB()
  //   }, 60000) // Recarregar a cada 1 minuto
  //   
  //   return () => clearInterval(interval)
  // }, [user?.id])

  // Atualizar estatísticas quando uma nova resposta for salva
  const refreshLocalStats = async () => {
    try {
      setIsUpdatingStats(true)
      
      // Atualizar estatísticas do banco de dados
      await fetchStatsFromDB()
      
      // Atualizar tentativas do usuário de forma assíncrona
      fetchUserAttempts().catch(error => {
        console.error('❌ Erro ao atualizar tentativas:', error)
      })
      
      // Atualizar status das questões para filtros de forma assíncrona
      if (user?.id) {
        fetchQuestionAttempts().then(statuses => {
          setQuestionStatuses(statuses)
        }).catch(error => {
          console.error('❌ Erro ao atualizar status das questões:', error)
        })
      }
      
      // Disparar evento para atualizar outros componentes
      window.dispatchEvent(new CustomEvent('statsUpdated'))
    } catch (error) {
      console.error('❌ Erro em refreshLocalStats:', error)
    } finally {
      setIsUpdatingStats(false)
    }
  }

  // Função para forçar recarregamento das estatísticas
  const forceRefreshStats = async () => {
    if (user?.id) {
    await fetchStatsFromDB()
    await fetchUserAttempts()
    }
  }

  // Função para testar conexão com o banco
  const testDatabaseConnection = async () => {
    if (!user?.id) return
    
    try {
      const { data, error } = await supabase
        .from('question_attempts')
        .select('count')
        .eq('user_id', user.id)
        .limit(1)
      
      if (error) {
        console.error('Erro na conexão com banco:', error)
      } else {
        console.log('Conexão com banco OK')
      }
    } catch (error) {
      console.error('Erro ao testar conexão:', error)
    }
  }

  // Calcular estatísticas reais
  const totalQuestionsInSystem = questions.length
  const answeredToday = statsFromDB.answeredCount // Usar dados do banco
  




  const handleAnswer = async (questionId: string, selectedAnswer: number) => {
    try {
      // Validações iniciais
      if (!questionId || !user?.id || selectedAnswer === undefined || selectedAnswer < 0 || selectedAnswer > 4) {
        console.error('Dados inválidos para resposta:', {
          questionId,
          userId: user?.id,
          selectedAnswer,
          validRange: '0-4'
        })
        return
      }

      // Atualizar UI imediatamente
      setAnsweredQuestions((prev) => ({ ...prev, [questionId]: selectedAnswer }))
      setShowExplanation((prev) => ({ ...prev, [questionId]: true }))

      // Buscar questão atual
      const currentQuestion = questions.find(q => q.id === questionId)
      if (!currentQuestion) {
        console.error('Questão não encontrada:', { questionId })
        return
      }

      // Calcular se a resposta está correta
      const correctAnswer = currentQuestion.correct_answer
      const isCorrect = selectedAnswer === correctAnswer

      // Preparar dados para inserção
      const now = new Date()
      const answerLetter = String.fromCharCode(97 + selectedAnswer).toUpperCase() // 0->A, 1->B, 2->C, 3->D, 4->E

      const insertData = {
        question_id: questionId,
        user_id: user.id,
        selected_answer: answerLetter,
        is_correct: isCorrect,
        attempted_at: now.toISOString(),
        time_spent: 0
      }

      // Tentar inserir no banco com timeout
      const insertPromise = supabase
        .from('question_attempts')
        .insert(insertData)
        .select()

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout na inserção')), 10000)
      )

      const { data, error } = await Promise.race([insertPromise, timeoutPromise]) as any

      if (error) {
        console.error('❌ Erro ao salvar resposta:', error)
        
        // Se for erro de UNIQUE constraint, tentar atualizar
        if (error.code === '23505') {
          const { error: updateError } = await supabase
            .from('question_attempts')
            .update({
              selected_answer: answerLetter,
              is_correct: isCorrect,
              attempted_at: now.toISOString(),
              time_spent: 0
            })
            .eq('question_id', questionId)
            .eq('user_id', user.id)
          
          if (updateError) {
            console.error('❌ Erro ao atualizar resposta:', updateError)
            return
          }
        } else {
          console.error('❌ Erro na inserção, mas continuando...')
          return
        }
      }

      // Atualizar estatísticas de forma assíncrona para não bloquear a UI
      setTimeout(async () => {
        try {
          await refreshLocalStats()
          refreshStats() // Disparar evento para atualizar Dashboard
        } catch (error) {
          console.error('❌ Erro ao atualizar estatísticas:', error)
        }
      }, 100)

    } catch (error) {
      console.error('❌ Erro ao salvar resposta:', error)
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
              onClick={() => {
                console.log('🔍 Botão filtro clicado, estado atual:', showFilters)
                setShowFilters(!showFilters)
                console.log('🔍 Novo estado:', !showFilters)
              }}
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
            answeredCount={statsFromDB.answeredCount} 
            correctCount={statsFromDB.correctCount} 
            isLoading={isLoadingAttempts || isUpdatingStats}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-fade-in-up animation-delay-200">
          {/* Filters Sidebar */}
          <div className={`lg:col-span-1 ${showFilters ? "block" : "hidden"} relative z-10`}>
            <QuestionFilters
              subjects={subjects}
              selectedSubject={selectedSubject}
              selectedDifficulty={selectedDifficulty}
              selectedStatus={selectedStatus}
              onSubjectChange={setSelectedSubject}
              onDifficultyChange={setSelectedDifficulty}
              onStatusChange={setSelectedStatus}
              totalQuestions={totalQuestionsInSystem}
              answeredToday={answeredToday}
              accuracyRate={statsFromDB.accuracyRate}
            />
          </div>

          {/* Main Question Area */}
          <div className={`${showFilters ? "lg:col-span-3" : "lg:col-span-4"} space-y-8`}>
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
                        {currentQuestion.disciplina || currentQuestion.subject || 'Geral'}
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

