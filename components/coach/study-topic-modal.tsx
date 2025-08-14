"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useCoach } from "@/lib/coach-context"
import { BookOpen, Clock, Target } from "lucide-react"

interface StudyTopicModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subject: string
  topic: string
}

export function StudyTopicModal({ open, onOpenChange, subject, topic }: StudyTopicModalProps) {
  const { markTopicAsStudied } = useCoach()
  const [studyData, setStudyData] = useState({
    timeSpent: 30,
    questionsAnswered: 0,
    correctAnswers: 0,
    notes: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    markTopicAsStudied(subject, topic, studyData.timeSpent, studyData.questionsAnswered, studyData.correctAnswers)

    // Reset form
    setStudyData({
      timeSpent: 30,
      questionsAnswered: 0,
      correctAnswers: 0,
      notes: "",
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-purple-600" />
            Registrar Estudo do Tópico
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {subject} • {topic}
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timeSpent" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Tempo Estudado (min)
              </Label>
              <Input
                id="timeSpent"
                type="number"
                min="1"
                value={studyData.timeSpent}
                onChange={(e) => setStudyData({ ...studyData, timeSpent: Number(e.target.value) })}
                className="border-purple-200 focus:border-purple-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="questionsAnswered" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Questões Respondidas
              </Label>
              <Input
                id="questionsAnswered"
                type="number"
                min="0"
                value={studyData.questionsAnswered}
                onChange={(e) => setStudyData({ ...studyData, questionsAnswered: Number(e.target.value) })}
                className="border-purple-200 focus:border-purple-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="correctAnswers">Questões Corretas</Label>
              <Input
                id="correctAnswers"
                type="number"
                min="0"
                max={studyData.questionsAnswered}
                value={studyData.correctAnswers}
                onChange={(e) =>
                  setStudyData({
                    ...studyData,
                    correctAnswers: Math.min(Number(e.target.value), studyData.questionsAnswered),
                  })
                }
                className="border-purple-200 focus:border-purple-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Anotações (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Registre suas observações sobre o estudo deste tópico..."
              value={studyData.notes}
              onChange={(e) => setStudyData({ ...studyData, notes: e.target.value })}
              rows={3}
              className="border-purple-200 focus:border-purple-500"
            />
          </div>

          {studyData.questionsAnswered > 0 && (
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-purple-700">
                Taxa de acerto:{" "}
                {studyData.questionsAnswered > 0
                  ? ((studyData.correctAnswers / studyData.questionsAnswered) * 100).toFixed(1)
                  : 0}
                %
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              Registrar Estudo
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
