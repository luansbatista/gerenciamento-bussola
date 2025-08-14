"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Trophy, Clock, Target, CheckCircle, XCircle, RotateCcw } from "lucide-react"
import { mockSubjects } from "@/lib/mock-data"
import type { Question } from "@/lib/types"

interface ExamResults {
  examConfig: {
    name: string
    questionCount: number
    timeLimit: number
    subjects: string[]
    difficulty: string[]
  }
  answers: Record<string, number>
  questions: Question[]
  timeSpent: number
  completedAt: Date
}

export default function ExamResultsPage() {
  const router = useRouter()
  const [results, setResults] = useState<ExamResults | null>(null)

  useEffect(() => {
    const savedResults = localStorage.getItem("examResults")
    if (savedResults) {
      setResults(JSON.parse(savedResults))
    } else {
      router.push("/exams")
    }
  }, [router])

  if (!results) {
    return (
      <div className="p-4 md:p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <p>Carregando resultados...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const correctAnswers = results.questions.filter((q) => results.answers[q.id] === q.correctAnswer).length
  const totalQuestions = results.questions.length
  const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100)
  const timeSpentFormatted = `${Math.floor(results.timeSpent / 3600)}h ${Math.floor((results.timeSpent % 3600) / 60)}min`

  const subjectStats = mockSubjects
    .filter((subject) => results.examConfig.subjects.includes(subject.id))
    .map((subject) => {
      const subjectQuestions = results.questions.filter((q) => q.subjectId === subject.id)
      const subjectCorrect = subjectQuestions.filter((q) => results.answers[q.id] === q.correctAnswer).length
      return {
        ...subject,
        total: subjectQuestions.length,
        correct: subjectCorrect,
        percentage: subjectQuestions.length > 0 ? Math.round((subjectCorrect / subjectQuestions.length) * 100) : 0,
      }
    })

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreMessage = (score: number) => {
    if (score >= 90) return "Excelente! Você está muito bem preparado!"
    if (score >= 80) return "Muito bom! Continue assim!"
    if (score >= 70) return "Bom resultado! Foque nas áreas que precisa melhorar."
    if (score >= 60) return "Resultado regular. Recomendamos mais estudos."
    return "Precisa estudar mais. Não desista!"
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Resultado do Simulado</h1>
        <p className="text-gray-600">{results.examConfig.name}</p>
      </div>

      {/* Score Overview */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className={`text-6xl font-bold ${getScoreColor(scorePercentage)}`}>{scorePercentage}%</div>
            <div className="space-y-2">
              <p className="text-lg font-medium">{getScoreMessage(scorePercentage)}</p>
              <p className="text-gray-600">
                {correctAnswers} de {totalQuestions} questões corretas
              </p>
            </div>
            <Progress value={scorePercentage} className="h-3 max-w-md mx-auto" />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Trophy className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Pontuação</p>
                <p className="text-lg font-bold text-gray-900">{scorePercentage}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Acertos</p>
                <p className="text-lg font-bold text-gray-900">{correctAnswers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-red-50 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Erros</p>
                <p className="text-lg font-bold text-gray-900">{totalQuestions - correctAnswers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Tempo</p>
                <p className="text-lg font-bold text-gray-900">{timeSpentFormatted}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subject Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Desempenho por Matéria</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {subjectStats.map((subject) => (
            <div key={subject.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: subject.color }} />
                  <span className="font-medium">{subject.name}</span>
                </div>
                <div className="text-right">
                  <span className="font-medium">
                    {subject.correct}/{subject.total}
                  </span>
                  <span className={`ml-2 ${getScoreColor(subject.percentage)}`}>{subject.percentage}%</span>
                </div>
              </div>
              <Progress value={subject.percentage} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col md:flex-row gap-4">
        <Button variant="outline" onClick={() => router.push("/exams")} className="flex-1">
          Voltar aos Simulados
        </Button>
        <Button onClick={() => router.push("/questions")} className="flex-1 flex items-center gap-2">
          <Target className="h-4 w-4" />
          Revisar Questões
        </Button>
        <Button onClick={() => router.push("/exams")} className="flex-1 flex items-center gap-2">
          <RotateCcw className="h-4 w-4" />
          Novo Simulado
        </Button>
      </div>
    </div>
  )
}
