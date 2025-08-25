"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { createClient } from "@/utils/supabase/client"

interface Subject {
  id: string
  name: string
  color: string
  totalQuestions: number
}

interface CreateFlashcardProps {
  onClose: () => void
  onSave: (flashcard: any) => void
}

export function CreateFlashcard({ onClose, onSave }: CreateFlashcardProps) {
  const [formData, setFormData] = useState({
    subjectId: "",
    front: "",
    back: "",
    difficulty: 1,
  })
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true)

  // Buscar disciplinas do banco de dados
  const fetchSubjects = async () => {
    try {
      setIsLoadingSubjects(true)
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
        console.error('Erro ao buscar disciplinas:', questionsError)
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
    } finally {
      setIsLoadingSubjects(false)
    }
  }

  useEffect(() => {
    fetchSubjects()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newFlashcard = {
      id: Date.now().toString(),
      ...formData,
      nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      reviewCount: 0,
    }

    onSave(newFlashcard)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Criar Novo Flashcard</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="subject">Matéria</Label>
              <Select
                value={formData.subjectId}
                onValueChange={(value) => setFormData({ ...formData, subjectId: value })}
                disabled={isLoadingSubjects}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingSubjects ? "Carregando disciplinas..." : "Selecione uma matéria"} />
                </SelectTrigger>
                <SelectContent>
                  {!isLoadingSubjects && subjects.length > 0 && (
                    subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: subject.color }}
                          />
                          {subject.name}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {isLoadingSubjects && (
                <p className="text-sm text-gray-500 mt-1">
                  Carregando disciplinas...
                </p>
              )}
              {subjects.length === 0 && !isLoadingSubjects && (
                <p className="text-sm text-gray-500 mt-1">
                  Nenhuma disciplina encontrada no banco de dados.
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="front">Pergunta (Frente)</Label>
              <Textarea
                id="front"
                value={formData.front}
                onChange={(e) => setFormData({ ...formData, front: e.target.value })}
                placeholder="Digite a pergunta ou conceito..."
                required
              />
            </div>

            <div>
              <Label htmlFor="back">Resposta (Verso)</Label>
              <Textarea
                id="back"
                value={formData.back}
                onChange={(e) => setFormData({ ...formData, back: e.target.value })}
                placeholder="Digite a resposta ou explicação..."
                required
              />
            </div>

            <div>
              <Label htmlFor="difficulty">Dificuldade Inicial</Label>
              <Select
                value={formData.difficulty.toString()}
                onValueChange={(value) => setFormData({ ...formData, difficulty: Number.parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Muito Fácil</SelectItem>
                  <SelectItem value="2">2 - Fácil</SelectItem>
                  <SelectItem value="3">3 - Médio</SelectItem>
                  <SelectItem value="4">4 - Difícil</SelectItem>
                  <SelectItem value="5">5 - Muito Difícil</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
                Cancelar
              </Button>
              <Button type="submit" className="flex-1">
                Criar Flashcard
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
