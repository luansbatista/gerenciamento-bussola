"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useFlashcards } from "@/lib/flashcard-context"
import { mockSubjects } from "@/lib/mock-data"

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
              <Select value={formData.subject} onValueChange={(value) => setFormData({ ...formData, subject: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a matéria" />
                </SelectTrigger>
                <SelectContent>
                  {mockSubjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.name}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
