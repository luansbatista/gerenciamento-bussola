"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useFlashcards } from "@/lib/flashcard-context"
import { createClient } from "@/utils/supabase/client"

interface Subject {
  id: string
  name: string
  color: string
  totalQuestions: number
}

interface CreateFlashcardModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateFlashcardModal({ open, onOpenChange }: CreateFlashcardModalProps) {
  const { createFlashcard } = useFlashcards()
  const [formData, setFormData] = useState({
    front: "",
    back: "",
    subject: "",
    topic: "",
    difficulty: "medium" as "easy" | "medium" | "hard",
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
    if (open) {
      fetchSubjects()
    }
  }, [open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.front || !formData.back || !formData.subject || !formData.topic) return

    createFlashcard(formData)
    setFormData({
      front: "",
      back: "",
      subject: "",
      topic: "",
      difficulty: "medium",
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Criar Novo Flashcard</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Matéria</Label>
              <Select 
                value={formData.subject} 
                onValueChange={(value) => setFormData({ ...formData, subject: value })}
                disabled={isLoadingSubjects}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingSubjects ? "Carregando disciplinas..." : "Selecione a matéria"} />
                </SelectTrigger>
                <SelectContent>
                  {!isLoadingSubjects && subjects.length > 0 && (
                    subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.name}>
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
            <div className="space-y-2">
              <Label htmlFor="topic">Tópico</Label>
              <Input
                id="topic"
                placeholder="Ex: Princípios Constitucionais"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty">Dificuldade</Label>
            <Select
              value={formData.difficulty}
              onValueChange={(value: any) => setFormData({ ...formData, difficulty: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Fácil</SelectItem>
                <SelectItem value="medium">Médio</SelectItem>
                <SelectItem value="hard">Difícil</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="front">Frente do Card (Pergunta)</Label>
            <Textarea
              id="front"
              placeholder="Digite a pergunta ou conceito..."
              value={formData.front}
              onChange={(e) => setFormData({ ...formData, front: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="back">Verso do Card (Resposta)</Label>
            <Textarea
              id="back"
              placeholder="Digite a resposta ou explicação..."
              value={formData.back}
              onChange={(e) => setFormData({ ...formData, back: e.target.value })}
              rows={4}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"
            >
              Criar Flashcard
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
