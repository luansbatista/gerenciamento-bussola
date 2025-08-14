"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Clock, AlertTriangle, CheckCircle, Flag } from "lucide-react"
import { QuestionCard } from "@/components/questions/question-card"
import { mockQuestions } from "@/lib/mock-data"

interface ExamConfig {
  name: string
  questionCount: number
  timeLimit: number
  subjects: string[]
  difficulty: string[]
}

export default function TakeExamPage() {
  const router = useRouter()
  const [examConfig, setExamConfig] = useState<ExamConfig | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [showConfirmFinish, setShowConfirmFinish] = useState(false)
  const [examStarted, setExamStarted] = useState(false)

  // Load exam configuration
  useEffect(() => {
    const config = localStorage.getItem("currentExamConfig")
    if (config) {
      const parsedConfig = JSON.parse(config) as ExamConfig
      setExamConfig(parsedConfig)
      setTimeRemaining(parsedConfig.timeLimit * 60) // Convert to seconds
    } else {
      router.push("/exams")
    }
  }, [router])

  // Timer countdown
  useEffect(() => {
    if (!examStarted || timeRemaining <= 0) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          finishExam()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [examStarted, timeRemaining])

  const filteredQuestions = mockQuestions.filter((question) => {
    if (!examConfig) return false
    return examConfig.subjects.includes(question.subjectId) && examConfig.difficulty.includes(question.difficulty)
  })

  const examQuestions = filteredQuestions.slice(0, examConfig?.questionCount || 50)
  const currentQuestion = examQuestions[currentQuestionIndex]

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleAnswer = (questionId: string, selectedAnswer: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: selectedAnswer }))
  }

  const nextQuestion = () => {
    if (currentQuestionIndex < examQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const finishExam = () => {
    const results = {
      examConfig,
      answers,
      questions: examQuestions,
      timeSpent: (examConfig?.timeLimit || 0) * 60 - timeRemaining,
      completedAt: new Date(),
    }
    localStorage.setItem("examResults", JSON.stringify(results))
    localStorage.removeItem("currentExamConfig")
    router.push("/exams/results")
  }

  const answeredCount = Object.keys(answers).length
  const progressPercentage = (answeredCount / examQuestions.length) * 100

  if (!examConfig || !currentQuestion) {
    return (
      <div className="p-4 md:p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <p>Carregando simulado...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!examStarted) {
    return (
      <div className="p-4 md:p-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Pronto para começar?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-xl font-bold">{examConfig.name}</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="font-medium">Questões</p>
                  <p className="text-blue-600">{examQuestions.length}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="font-medium">Tempo Limite</p>
                  <p className="text-green-600">{formatTime(timeRemaining)}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => router.push("/exams")} className="flex-1">
                Voltar
              </Button>
              <Button onClick={() => setExamStarted(true)} className="flex-1">
                Iniciar Simulado
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header with Timer */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold">{examConfig.name}</h1>
              <p className="text-sm text-gray-500">
                Questão {currentQuestionIndex + 1} de {examQuestions.length}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className={`text-lg font-bold ${timeRemaining < 600 ? "text-red-600" : "text-gray-900"}`}>
                  <Clock className="inline h-4 w-4 mr-1" />
                  {formatTime(timeRemaining)}
                </div>
                <p className="text-xs text-gray-500">Tempo restante</p>
              </div>
              <Button variant="outline" onClick={() => setShowConfirmFinish(true)}>
                Finalizar
              </Button>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">
                Progresso: {answeredCount}/{examQuestions.length} respondidas
              </span>
              <span className="text-sm">{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Question */}
      <QuestionCard
        question={currentQuestion}
        selectedAnswer={answers[currentQuestion.id]}
        showExplanation={false}
        onAnswer={(answer) => handleAnswer(currentQuestion.id, answer)}
      />

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={previousQuestion} disabled={currentQuestionIndex === 0}>
          Anterior
        </Button>
        <div className="flex items-center gap-2">
          <Badge variant={answers[currentQuestion.id] !== undefined ? "default" : "outline"}>
            {answers[currentQuestion.id] !== undefined ? (
              <CheckCircle className="h-3 w-3 mr-1" />
            ) : (
              <Flag className="h-3 w-3 mr-1" />
            )}
            {currentQuestionIndex + 1}
          </Badge>
        </div>
        <Button onClick={nextQuestion} disabled={currentQuestionIndex === examQuestions.length - 1}>
          Próxima
        </Button>
      </div>

      {/* Confirm Finish Modal */}
      {showConfirmFinish && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Finalizar Simulado?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Você respondeu {answeredCount} de {examQuestions.length} questões. Tem certeza que deseja finalizar o
                simulado?
              </p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowConfirmFinish(false)} className="flex-1">
                  Continuar
                </Button>
                <Button onClick={finishExam} className="flex-1">
                  Finalizar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
