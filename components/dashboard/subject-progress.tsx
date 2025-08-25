"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BookOpen } from "lucide-react"
import { useStudy } from "@/lib/study-context"
import { useAuth } from "@/lib/auth-context"
import { useState, useEffect } from "react"
import dynamic from 'next/dynamic'

const PieChart = dynamic(() => import('recharts').then(mod => mod.PieChart), { ssr: false })
const Pie = dynamic(() => import('recharts').then(mod => mod.Pie), { ssr: false })
const Cell = dynamic(() => import('recharts').then(mod => mod.Cell), { ssr: false })
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false })
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false })
const Legend = dynamic(() => import('recharts').then(mod => mod.Legend), { ssr: false })

interface SubjectProgressData {
  id: string
  name: string
  color: string
  completed: number
  accuracy: number
  totalQuestions: number
}

// Cores específicas para cada disciplina
const subjectColors: Record<string, string> = {
  'Português': '#3B82F6', // Azul
  'Matemática': '#10B981', // Verde
  'Direito Constitucional': '#F59E0B', // Amarelo
  'Direito Penal': '#EF4444', // Vermelho
  'Direito Administrativo': '#8B5CF6', // Roxo
  'Direito Penal Militar': '#06B6D4', // Ciano
  'História do Brasil': '#84CC16', // Verde lima
  'Geografia do Brasil': '#F97316', // Laranja
  'Informática': '#EC4899', // Rosa
  'Atualidades': '#6366F1', // Índigo
  'Direitos Humanos': '#059669', // Verde escuro
  'Constituição do estado da Bahia': '#DC2626', // Vermelho escuro
}

// Cores padrão para disciplinas não mapeadas (fallback)
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
        setIsLoading(false)
        setSubjectProgress([])
      }, 5000) // 5 segundos

      try {
        setIsLoading(true)
        
        // Primeiro, buscar as disciplinas do banco
        const subjectsData = await getSubjects()

        
        if (subjectsData.length === 0) {
          clearTimeout(timeoutId)
          setIsLoading(false)
          return
        }

        // Adicionar cores específicas para cada disciplina
        const subjectsWithColors = subjectsData.map((subject, index) => ({
          ...subject,
          color: subjectColors[subject.name] || defaultColors[index % defaultColors.length]
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
        
        setSubjectProgress(progressData)
        clearTimeout(timeoutId)
      } catch (error) {
        setSubjectProgress([])
        clearTimeout(timeoutId)
      } finally {
        setIsLoading(false)
      }
    }

    loadSubjectsAndProgress()
  }, [user?.id]) // Removidas as dependências getSubjectProgress e getSubjects que causavam o loop

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
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={subjectProgress}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={120}
                dataKey="completed"
              >
                {subjectProgress.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name, props) => [
                  `${value} questões`, 
                  props.payload.name
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-6 space-y-3">
          {subjectProgress.map((subject) => (
            <div key={subject.id} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 rounded-full" style={{ backgroundColor: subject.color }} />
                <span className="font-medium">{subject.name}</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-lg">
                  {subject.accuracy.toFixed(1)}%
                </span>
                <span className="text-xs text-gray-500 ml-1">
                  acerto
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
