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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [answeredQuestions, setAnsweredQuestions] = useState<Record<string, number>>({})
  const [showExplanation, setShowExplanation] = useState<Record<string, boolean>>({})
  const [userAttempts, setUserAttempts] = useState<Record<string, number>>({})
  const [isLoadingAttempts, setIsLoadingAttempts] = useState(false)

  // Buscar tentativas do usuário do banco de dados
  const fetchUserAttempts = async () => {
    if (!user?.id) {
      setUserAttempts({})
      return
    }
    
    setIsLoadingAttempts(true)
    try {
      const { data, error } = await supabase
        .from('question_attempts')
        .select('question_id, selected_answer, is_correct')
        .eq('user_id', user.id)

      if (error) {
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
      setUserAttempts({})
    } finally {
      setIsLoadingAttempts(false)
    }
  }

  // Carregar tentativas quando o usuário mudar
  useEffect(() => {
    if (user?.id) {
      fetchUserAttempts()
    }
  }, [user?.id])

  // Carregar tentativas quando o componente é montado
  useEffect(() => {
    if (user?.id) {
      // Carregar tentativas imediatamente
    fetchUserAttempts()
      // E também após um pequeno delay para garantir que tudo foi carregado
      setTimeout(() => fetchUserAttempts(), 1000)
    }
  }, [user?.id])

  // Combinar tentativas do banco com respostas da sessão atual
  const allAnsweredQuestions = { ...userAttempts, ...answeredQuestions }

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
    
    return true
  })



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
    console.log('🔄 fetchStatsFromDB iniciado')
    if (!user?.id) {
      console.log('❌ Usuário não encontrado')
      // Resetar estatísticas se não há usuário
      setStatsFromDB({
        answeredCount: 0,
        correctCount: 0,
        accuracyRate: 0
      })
      return
    }
    
    try {
      console.log('📊 Fazendo query no banco...')
      const { data, error } = await supabase
        .from('question_attempts')
        .select('is_correct')
        .eq('user_id', user.id)

      if (error) {
        console.error('❌ Erro na query:', error)
        // Em caso de erro, manter estatísticas atuais ou resetar
        return
      }

      console.log('📊 Dados recebidos:', data?.length || 0, 'tentativas')

      if (data && Array.isArray(data)) {
        const answeredCount = data.length
        const correctCount = data.filter(attempt => attempt.is_correct).length
        const accuracyRate = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0
        
        console.log('📊 Estatísticas calculadas:', {
          answeredCount,
          correctCount,
          accuracyRate
        })
        
        setStatsFromDB({
          answeredCount,
          correctCount,
          accuracyRate
        })
        console.log('✅ Estatísticas atualizadas no estado')
      } else {
        console.log('📊 Nenhum dado encontrado, resetando para zero')
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

  // Carregar estatísticas quando o componente é montado
  useEffect(() => {
    if (user?.id) {
      // Carregar estatísticas imediatamente
      fetchStatsFromDB()
      // E também após um pequeno delay para garantir que tudo foi carregado
      setTimeout(() => fetchStatsFromDB(), 1000)
    }
  }, [user?.id])

  // Recarregar estatísticas periodicamente para garantir sincronização
  useEffect(() => {
    if (!user?.id) return
    
    const interval = setInterval(() => {
    fetchStatsFromDB()
    }, 30000) // Recarregar a cada 30 segundos
    
    return () => clearInterval(interval)
  }, [user?.id])

  // Forçar recarregamento quando a página é carregada
  useEffect(() => {
    if (user?.id) {
      // Testar conexão com banco
      testDatabaseConnection()
      
      // Recarregar após um delay para garantir que tudo foi inicializado
      const timer = setTimeout(() => {
        forceRefreshStats()
      }, 2000)
      
      return () => clearTimeout(timer)
    }
  }, [user?.id])

  // Atualizar estatísticas quando uma nova resposta for salva
  const refreshLocalStats = async () => {
    console.log('🔄 refreshLocalStats iniciado')
    try {
      // Atualizar estatísticas do banco de dados
      console.log('📊 Chamando fetchStatsFromDB...')
      await fetchStatsFromDB()
      console.log('📊 fetchStatsFromDB concluído')
      
      // Atualizar tentativas do usuário
      console.log('👤 Chamando fetchUserAttempts...')
      await fetchUserAttempts()
      console.log('👤 fetchUserAttempts concluído')
      
      console.log('✅ refreshLocalStats concluído com sucesso')
    } catch (error) {
      console.error('❌ Erro em refreshLocalStats:', error)
      // Em caso de erro, tentar novamente após um delay
      setTimeout(() => {
        console.log('🔄 Tentando novamente após erro...')
        fetchStatsFromDB()
        fetchUserAttempts()
      }, 1000)
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
        console.error('Questão não encontrada no array local:', { questionId })
        return
      }

      // Verificar se a questão existe no banco
      const { data: questionExists, error: questionError } = await supabase
        .from('questions')
        .select('id')
        .eq('id', questionId)
        .single()
      
      if (questionError) {
        console.error('Erro ao verificar questão no banco:', {
        questionId, 
          error: questionError,
          message: questionError.message,
          code: questionError.code
        })
        return
      }

      if (!questionExists) {
        console.error('Questão não encontrada no banco:', { questionId })
        return
      }

      // Calcular se a resposta está correta
      const correctAnswer = currentQuestion.correct_answer
      const isCorrect = selectedAnswer === correctAnswer

      // Atualizar estatísticas localmente para feedback imediato
      setStatsFromDB(prev => {
        const newAnsweredCount = prev.answeredCount + 1
        const newCorrectCount = isCorrect ? prev.correctCount + 1 : prev.correctCount
        const newAccuracyRate = newAnsweredCount > 0 ? Math.round((newCorrectCount / newAnsweredCount) * 100) : 0
        
        return {
          answeredCount: newAnsweredCount,
          correctCount: newCorrectCount,
          accuracyRate: newAccuracyRate
        }
      })
      
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

      console.log('Tentando salvar resposta:', insertData)

      // Tentar inserir no banco
      const { data, error } = await supabase
        .from('question_attempts')
        .insert(insertData)
        .select()

      if (error) {
        console.error('Erro ao inserir resposta:', {
          error: error,
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        })
        
        // Se for erro de UNIQUE constraint, tentar atualizar
        if (error.code === '23505') {
          console.log('Tentando atualizar resposta existente...')
          
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
            console.error('Erro ao atualizar resposta:', {
              error: updateError,
              message: updateError.message,
              code: updateError.code,
              details: updateError.details
            })
            throw new Error(`Falha ao atualizar resposta: ${updateError.message}`)
          }
          
          console.log('Resposta atualizada com sucesso')
        } else {
          // Outros tipos de erro
          throw new Error(`Falha ao salvar resposta: ${error.message}`)
        }
      } else {
        console.log('Resposta salva com sucesso:', data)
      }

      // Atualizar estatísticas após sucesso
      console.log('🔄 Iniciando atualização de estatísticas...')
      setTimeout(() => {
        console.log('📊 Chamando refreshLocalStats...')
        refreshLocalStats()
        console.log('📡 Disparando evento statsUpdated...')
        refreshStats() // Disparar evento para atualizar Dashboard
        console.log('✅ Atualização de estatísticas concluída')
      }, 100)

    } catch (error) {
      // Tratamento robusto de erro
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao salvar resposta'
      const errorDetails = {
        message: errorMessage,
        questionId,
        userId: user?.id,
        selectedAnswer,
        timestamp: new Date().toISOString()
      }
      
      console.error('Erro geral ao salvar resposta:', errorDetails)
      
      // Reverter estatísticas locais em caso de erro
      setStatsFromDB(prev => ({
        answeredCount: Math.max(0, prev.answeredCount - 1),
        correctCount: prev.correctCount, // Manter como estava
        accuracyRate: prev.answeredCount > 1 ? 
          Math.round((prev.correctCount / (prev.answeredCount - 1)) * 100) : 0
      }))
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
            answeredCount={statsFromDB.answeredCount} 
            correctCount={statsFromDB.correctCount} 
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
              totalQuestions={totalQuestionsInSystem}
              answeredToday={answeredToday}
              accuracyRate={statsFromDB.accuracyRate}
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

