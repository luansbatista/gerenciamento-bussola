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
          id: subject.id || subject.name, // Usar ID se existir, senão usar nome
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
        .select('disciplina, subject, assunto')
        .or('disciplina.not.is.null,subject.not.is.null')
        .limit(1000) // Limitar para evitar problemas de performance
      
      if (questionsError) {
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
      
      const subjectsList = Array.from(uniqueSubjects).map((subjectName: string) => ({
        id: subjectName, // Usar o nome como ID temporário
        name: subjectName,
        color: '#3B82F6',
        totalQuestions: 0
      }))
      
      // Adicionar cores diferentes para cada disciplina
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
      
      const subjectsWithColors = subjectsList.map((subject, index) => ({
        ...subject,
        color: colors[index % colors.length]
      }))
      
      // Garantir que há pelo menos um subject
      if (subjectsWithColors.length === 0) {
        // Se não há subjects, criar um padrão
        setSubjects([{
          id: 'geral',
          name: 'Geral',
          color: '#3B82F6',
          totalQuestions: 0
        }])
      } else {
        setSubjects(subjectsWithColors)
      }
    } catch (error) {
      // Em caso de erro, criar um subject padrão
      setSubjects([{
        id: 'geral',
        name: 'Geral',
        color: '#3B82F6',
        totalQuestions: 0
      }])
    }
  }, [])

  const fetchQuestions = useCallback(async () => {
    try {
      const supabase = createClient()
      
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (questionsError) {
        setQuestions([])
        return
      }
      
      if (!questionsData || !Array.isArray(questionsData) || questionsData.length === 0) {
        setQuestions([])
        return
      }
      
      const mappedQuestions: Question[] = questionsData.map((q: any) => {
        // Usar ambas as colunas de resposta correta
        const correctAnswer = q.correct_answer || q.alternativa_correta
        const correctAnswerStr = String(correctAnswer || 'A').toUpperCase()
        
        // Mapear alternativa correta para número (A=0, B=1, C=2, D=3, E=4)
        const correctAnswerNumber = correctAnswerStr === 'A' ? 0 : 
                                   correctAnswerStr === 'B' ? 1 : 
                                   correctAnswerStr === 'C' ? 2 : 
                                   correctAnswerStr === 'D' ? 3 : 
                                   correctAnswerStr === 'E' ? 4 : 0

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
          correctAnswer: correctAnswerStr
        }
      })
      
      setQuestions(mappedQuestions)
    } catch (error) {
      setQuestions([])
    }
  }, [])

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
