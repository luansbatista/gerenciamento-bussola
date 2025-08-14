"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BookOpen } from "lucide-react"
import { useStudy } from "@/lib/study-context"
import { useAuth } from "@/lib/auth-context"
import { useState, useEffect } from "react"

interface SubjectProgressData {
  id: string
  name: string
  color: string
  completed: number
  accuracy: number
  totalQuestions: number
}

// Cores padrão para disciplinas (fallback)
const defaultColors = [
  "#3B82F6", // Azul
  "#10B981", // Verde
  "#F59E0B", // Amarelo
  "#EF4444", // Vermelho
  "#8B5CF6", // Roxo
  "#06B6D4", // Ciano
  "#84CC16", // Verde lima
  "#F97316", // Laranja
  "#EC4899", // Rosa
  "#6366F1", // Índigo
]

export function SubjectProgress() {
  const { getSubjectProgress, getSubjects } = useStudy()
  const { user } = useAuth()
  const [subjectProgress, setSubjectProgress] = useState<SubjectProgressData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [subjects, setSubjects] = useState<{ id: string; name: string; color: string }[]>([])

  useEffect(() => {
    const loadSubjectsAndProgress = async () => {
      if (!user?.id) {
        setIsLoading(false)
        return
      }

      // Timeout de segurança para evitar loading infinito
      const timeoutId = setTimeout(() => {
        console.warn('SubjectProgress - Timeout de segurança ativado')
        setIsLoading(false)
        setSubjectProgress([])
      }, 10000) // 10 segundos

      try {
        setIsLoading(true)
        
        // Primeiro, buscar as disciplinas do banco
        const subjectsData = await getSubjects()
        console.log('SubjectProgress - Disciplinas carregadas:', subjectsData)
        
        if (subjectsData.length === 0) {
          console.warn('Nenhuma disciplina encontrada no banco')
          clearTimeout(timeoutId)
          setIsLoading(false)
          return
        }

        // Adicionar cores para disciplinas que não têm cor definida
        const subjectsWithColors = subjectsData.map((subject, index) => ({
          ...subject,
          color: subject.color || defaultColors[index % defaultColors.length]
        }))

        setSubjects(subjectsWithColors)

        // Depois, buscar o progresso de cada disciplina
        const progressData = await Promise.all(
          subjectsWithColors.map(async (subject) => {
            const progress = await getSubjectProgress(subject.name, user.id)
            return {
              ...subject,
              completed: progress.questions || 0,
              accuracy: progress.accuracy || 0,
              totalQuestions: progress.questions || 0,
            }
          })
        )
        
        console.log('SubjectProgress - Progresso carregado:', progressData)
        setSubjectProgress(progressData)
        clearTimeout(timeoutId)
      } catch (error) {
        console.error('Erro ao carregar disciplinas e progresso:', error)
        setSubjectProgress([])
        clearTimeout(timeoutId)
      } finally {
        setIsLoading(false)
      }
    }

    loadSubjectsAndProgress()
  }, [user?.id, getSubjectProgress, getSubjects])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            Progresso por Matéria
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Carregando disciplinas...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (subjectProgress.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            Progresso por Matéria
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">Nenhuma disciplina encontrada</p>
            <p className="text-xs text-gray-400 mt-1">Adicione disciplinas no banco de dados</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-blue-600" />
          Progresso por Matéria
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {subjectProgress.map((subject) => {
          const progressPercentage = subject.totalQuestions > 0 
            ? (subject.completed / subject.totalQuestions) * 100 
            : 0
          
          return (
            <div key={subject.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: subject.color }} />
                  <span className="text-sm font-medium">{subject.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium">
                    {subject.completed}/{subject.totalQuestions}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">
                    {subject.accuracy.toFixed(1)}% acerto
                  </span>
                </div>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
