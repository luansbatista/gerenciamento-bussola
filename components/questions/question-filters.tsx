"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Filter } from "lucide-react"


interface Subject {
  id: string
  name: string
  color: string
  totalQuestions: number
}

interface QuestionFiltersProps {
  subjects: Subject[]
  selectedSubject: string
  selectedDifficulty: string
  selectedStatus: string
  onSubjectChange: (subject: string) => void
  onDifficultyChange: (difficulty: string) => void
  onStatusChange: (status: string) => void
  totalQuestions: number
  answeredToday: number
  accuracyRate: number
}

export function QuestionFilters({
  subjects,
  selectedSubject,
  selectedDifficulty,
  selectedStatus,
  onSubjectChange,
  onDifficultyChange,
  onStatusChange,
  totalQuestions,
  answeredToday,
  accuracyRate,
}: QuestionFiltersProps) {
  console.log('🔍 QuestionFilters renderizado:', {
    subjectsCount: subjects?.length,
    selectedSubject,
    selectedDifficulty,
    selectedStatus,
    totalQuestions,
    answeredToday,
    accuracyRate
  })

  const difficulties = [
    { value: "all", label: "Todas", color: "bg-gray-100 text-gray-700" },
    { value: "easy", label: "Fácil", color: "bg-green-100 text-green-700" },
    { value: "medium", label: "Médio", color: "bg-yellow-100 text-yellow-700" },
    { value: "hard", label: "Difícil", color: "bg-red-100 text-red-700" },
  ]

  const statusOptions = [
    { value: "all", label: "Todas", color: "bg-gray-100 text-gray-700" },
    { value: "unanswered", label: "Inéditas", color: "bg-blue-100 text-blue-700" },
    { value: "correct", label: "Acertadas", color: "bg-green-100 text-green-700" },
    { value: "incorrect", label: "Erradas", color: "bg-red-100 text-red-700" },
  ]

  return (
    <div className="space-y-4">
      {/* Subject Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="h-4 w-4" />
            Matérias
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant={selectedSubject === "all" ? "default" : "outline"}
            size="sm"
            className="w-full justify-start"
            onClick={() => onSubjectChange("all")}
          >
            Todas as Matérias
          </Button>
          {subjects.map((subject) => (
            <Button
              key={subject.id}
              variant={selectedSubject === subject.id ? "default" : "outline"}
              size="sm"
              className="w-full justify-start"
              onClick={() => onSubjectChange(subject.id)}
            >
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: subject.color }} />
                {subject.name}
              </div>
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Difficulty Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dificuldade</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {difficulties.map((difficulty) => (
            <Button
              key={difficulty.value}
              variant={selectedDifficulty === difficulty.value ? "default" : "outline"}
              size="sm"
              className="w-full justify-start"
              onClick={() => onDifficultyChange(difficulty.value)}
            >
              {difficulty.label}
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Status Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Status da Questão</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {statusOptions.map((status) => (
            <Button
              key={status.value}
              variant={selectedStatus === status.value ? "default" : "outline"}
              size="sm"
              className="w-full justify-start"
              onClick={() => onStatusChange(status.value)}
            >
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: status.color.includes('blue') ? '#3b82f6' : status.color.includes('green') ? '#10b981' : '#ef4444' }} />
                {status.label}
              </div>
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Estatísticas Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Total de questões</span>
            <Badge variant="secondary">{totalQuestions}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Respondidas hoje</span>
            <Badge variant="secondary">{answeredToday}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Taxa de acerto</span>
            <Badge variant="secondary">{accuracyRate}%</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
