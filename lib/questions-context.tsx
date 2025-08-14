"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from "react"
import { createClient } from "@/utils/supabase/client"

// Tipos para questões
interface Question {
  id: string
  subject: string
  disciplina?: string
  assunto?: string
  question: string
  enunciado?: string
  options: string[]
  opcao_a?: string
  opcao_b?: string
  opcao_c?: string
  opcao_d?: string
  opcao_e?: string
  correct_answer: number
  alternativa_correta?: string
  difficulty: 'easy' | 'medium' | 'hard'
  nivel?: string
  created_at: string
  times_answered: number
  accuracy_rate: number
}

interface Subject {
  id: string
  name: string
  color: string
  totalQuestions: number
}

interface QuestionsContextType {
  questions: Question[]
  subjects: Subject[]
  isLoading: boolean
  fetchQuestions: () => Promise<void>
  fetchSubjects: () => Promise<void>
}

const QuestionsContext = createContext<QuestionsContextType | undefined>(undefined)

export function QuestionsProvider({ children }: { children: React.ReactNode }) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const supabase = createClient()

  // Função para gerar cores aleatórias
  const getRandomColor = () => {
    const colors = [
      "#3B82F6", // blue
      "#10B981", // green
      "#F59E0B", // yellow
      "#EF4444", // red
      "#8B5CF6", // purple
      "#06B6D4", // cyan
      "#84CC16", // lime
      "#F97316", // orange
      "#EC4899", // pink
      "#6366F1"  // indigo
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  // Buscar questões do banco
  const fetchQuestions = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar questões:', error)
        return
      }

      if (data && data.length > 0) {
        const questionsWithStats: Question[] = data.map(q => ({
          id: q.id,
          subject: q.subject || q.disciplina || 'Geral',
          disciplina: q.disciplina,
          assunto: q.assunto,
          question: q.question,
          enunciado: q.enunciado,
          options: Array.isArray(q.options) ? q.options : (q.options ? JSON.parse(JSON.stringify(q.options)) : []),
          opcao_a: q.opcao_a,
          opcao_b: q.opcao_b,
          opcao_c: q.opcao_c,
          opcao_d: q.opcao_d,
          opcao_e: q.opcao_e,
          correct_answer: q.correct_answer,
          alternativa_correta: q.alternativa_correta,
          difficulty: q.difficulty || q.nivel || 'medium',
          nivel: q.nivel,
          created_at: q.created_at,
          times_answered: q.times_answered || 0,
          accuracy_rate: q.accuracy_rate || 0
        }))

        setQuestions(questionsWithStats)
      } else {
        setQuestions([])
      }
    } catch (error) {
      console.error('Erro ao buscar questões:', error)
      setQuestions([])
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  // Buscar disciplinas/assuntos do banco
  const fetchSubjects = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('assuntos_edital')
        .select('*')
        .order('disciplina')
        .order('assunto')

      if (error) {
        console.error('Erro ao buscar assuntos:', error)
        return
      }

      if (data && data.length > 0) {
        // Agrupar por disciplina
        const disciplinasMap = new Map<string, { name: string; count: number; color: string }>()
        
        data.forEach(assunto => {
          const disciplina = assunto.disciplina
          if (!disciplinasMap.has(disciplina)) {
            disciplinasMap.set(disciplina, {
              name: disciplina,
              count: 0,
              color: getRandomColor()
            })
          }
          disciplinasMap.get(disciplina)!.count++
        })

        const subjectsList: Subject[] = Array.from(disciplinasMap.entries()).map(([id, info]) => ({
          id,
          name: info.name,
          color: info.color,
          totalQuestions: info.count
        }))

        setSubjects(subjectsList)
      } else {
        setSubjects([])
      }
    } catch (error) {
      console.error('Erro ao buscar assuntos:', error)
      setSubjects([])
    }
  }, [supabase])

  // Carregar dados iniciais
  useEffect(() => {
    fetchQuestions()
    fetchSubjects()
  }, [fetchQuestions, fetchSubjects])

  const value: QuestionsContextType = {
    questions,
    subjects,
    isLoading,
    fetchQuestions,
    fetchSubjects
  }

  return (
    <QuestionsContext.Provider value={value}>
      {children}
    </QuestionsContext.Provider>
  )
}

export function useQuestions() {
  const context = useContext(QuestionsContext)
  if (context === undefined) {
    throw new Error("useQuestions must be used within a QuestionsProvider")
  }
  return context
}
