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
  correct_answer: string | number
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

  console.log('🔍 QuestionsProvider inicializado')

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

  const fetchSubjects = useCallback(async () => {
    try {
      const supabase = createClient()
      
      // Primeiro, tentar buscar da tabela subjects
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('subjects')
        .select('*')
        .order('name')
      
      if (!subjectsError && subjectsData && subjectsData.length > 0) {
        // Se subjects tem dados, usar subjects
        const subjectsList = subjectsData.map((subject: any) => ({
          id: subject.id || subject.name,
          name: subject.name,
          color: subject.color || '#3B82F6',
          totalQuestions: subject.total_questions || 0
        }))
        
        setSubjects(subjectsList)
        return
      }
      
      // Se subjects não tem dados, buscar da tabela questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('disciplina, subject')
        .or('disciplina.not.is.null,subject.not.is.null')
        .limit(1000)
      
      if (questionsError) {
        console.error('Erro ao buscar disciplinas:', {
          message: questionsError.message,
          code: questionsError.code,
          details: questionsError.details,
          hint: questionsError.hint
        })
        setSubjects([])
        return
      }
      
      if (!questionsData || !Array.isArray(questionsData) || questionsData.length === 0) {
        setSubjects([])
        return
      }
      
      // Extrair disciplinas únicas das questões
      const uniqueSubjects = new Set<string>()
      
      questionsData.forEach((question: any) => {
        if (question.disciplina && question.disciplina.trim() !== '') {
          uniqueSubjects.add(question.disciplina.trim())
        }
        if (question.subject && question.subject.trim() !== '' && question.subject !== question.disciplina) {
          uniqueSubjects.add(question.subject.trim())
        }
      })
      
      const colors = [
        "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6",
        "#06B6D4", "#84CC16", "#F97316", "#EC4899", "#6366F1"
      ]
      
      const subjectsList = Array.from(uniqueSubjects).map((subjectName: string, index: number) => ({
        id: subjectName,
        name: subjectName,
        color: colors[index % colors.length],
        totalQuestions: 0
      }))
      
      // Garantir que há pelo menos um subject
      if (subjectsList.length === 0) {
        setSubjects([{
          id: 'geral',
          name: 'Geral',
          color: '#3B82F6',
          totalQuestions: 0
        }])
      } else {
        setSubjects(subjectsList)
      }
    } catch (error) {
      console.error('Erro ao buscar disciplinas:', error)
      setSubjects([{
        id: 'geral',
        name: 'Geral',
        color: '#3B82F6',
        totalQuestions: 0
      }])
    }
  }, [])

  const fetchQuestions = useCallback(async () => {
    console.log('🔍 fetchQuestions iniciado')
    try {
      const supabase = createClient()
      
      console.log('📊 Buscando questões no banco...')
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (questionsError) {
        console.error('❌ Erro ao buscar questões:', questionsError)
        setQuestions([])
        return
      }
      
      console.log(`📊 Questões encontradas: ${questionsData?.length || 0}`)
      
      if (!questionsData || !Array.isArray(questionsData) || questionsData.length === 0) {
        console.log('❌ Nenhuma questão encontrada')
        setQuestions([])
        return
      }
      
      const mappedQuestions: Question[] = questionsData.map((q: any) => {
        // O banco já armazena números (0, 1, 2, 3, 4), não letras
        let correctAnswerNumber = 0
        
        if (q.correct_answer !== null && q.correct_answer !== undefined) {
          if (typeof q.correct_answer === 'string') {
            // Se for string, tentar converter para número
            const parsed = parseInt(q.correct_answer, 10)
            if (!isNaN(parsed) && parsed >= 0 && parsed <= 4) {
              correctAnswerNumber = parsed
            }
          } else if (typeof q.correct_answer === 'number') {
            // Se já for número, usar diretamente
            if (q.correct_answer >= 0 && q.correct_answer <= 4) {
              correctAnswerNumber = q.correct_answer
            }
          }
        }

        // Verificar se a questão tem opções válidas
        const options = [
          q.opcao_a || '',
          q.opcao_b || '',
          q.opcao_c || '',
          q.opcao_d || '',
          q.opcao_e || ''
        ].filter(option => option && option.trim() !== '')

        return {
          id: q.id,
          disciplina: q.disciplina,
          subject: q.subject,
          assunto: q.assunto,
          question: q.question,
          enunciado: q.enunciado,
          opcao_a: q.opcao_a,
          opcao_b: q.opcao_b,
          opcao_c: q.opcao_c,
          opcao_d: q.opcao_d,
          opcao_e: q.opcao_e,
          alternativa_correta: q.alternativa_correta,
          correct_answer: correctAnswerNumber, // Usar número mapeado
          difficulty: q.difficulty,
          nivel: q.nivel,
          times_answered: q.times_answered,
          accuracy_rate: q.accuracy_rate,
          created_at: q.created_at,
          // Campos para compatibilidade - usar opções filtradas
          options: options,
          correctAnswer: String.fromCharCode(97 + correctAnswerNumber).toUpperCase() // Mapear número para letra (A, B, C, D, E)
        }
      })
      
      setQuestions(mappedQuestions)
    } catch (error) {
      setQuestions([])
    }
  }, [])

  // Carregar dados iniciais
  useEffect(() => {
    console.log('🔄 useEffect QuestionsProvider - carregando dados iniciais')
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
