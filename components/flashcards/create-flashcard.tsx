"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { mockSubjects } from "@/lib/mock-data"

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
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma matéria" />
                </SelectTrigger>
                <SelectContent>
                  {mockSubjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
