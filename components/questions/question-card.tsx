"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, XCircle, Clock, Building, MessageCircle, BarChart3, Send, User } from "lucide-react"
import { useState } from "react"


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

interface QuestionCardProps {
  question: Question
  selectedAnswer?: number
  showExplanation: boolean
  onAnswer: (answer: number) => void
}

export function QuestionCard({ question, selectedAnswer, showExplanation, onAnswer }: QuestionCardProps) {
  const [showComments, setShowComments] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [comments, setComments] = useState<any[]>([]) // Removido mockComments, iniciando com array vazio

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-700"
      case "medium":
        return "bg-yellow-100 text-yellow-700"
      case "hard":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "Fácil"
      case "medium":
        return "Médio"
      case "hard":
        return "Difícil"
      default:
        return difficulty
    }
  }

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: Date.now().toString(),
        author: "Você",
        content: newComment.trim(),
        timestamp: "Agora",
      }
      setComments([comment, ...comments])
      setNewComment("")
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-medium leading-relaxed">{question.question}</h3>
          </div>
          <div className="flex flex-col gap-2">
            <Badge className={getDifficultyColor(question.difficulty)}>{getDifficultyLabel(question.difficulty)}</Badge>

          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Answer Options */}
        <div className="space-y-3">
          {(() => {
            // Criar array de opções a partir das colunas individuais
            const options = []
            if (question.opcao_a && question.opcao_a.trim()) options.push(question.opcao_a)
            if (question.opcao_b && question.opcao_b.trim()) options.push(question.opcao_b)
            if (question.opcao_c && question.opcao_c.trim()) options.push(question.opcao_c)
            if (question.opcao_d && question.opcao_d.trim()) options.push(question.opcao_d)
            if (question.opcao_e && question.opcao_e.trim()) options.push(question.opcao_e)
            
            // Se não há opções individuais, usar o array options
            const finalOptions = options.length > 0 ? options : (question.options || [])
            
            if (finalOptions.length > 0) {
              return finalOptions.map((option, index) => {
                const isSelected = selectedAnswer === index
                // Verificar se a resposta está correta usando ambas as colunas possíveis
                const correctAnswer = question.correct_answer || question.alternativa_correta
                const isCorrect = String.fromCharCode(97 + index) === String(correctAnswer || '').toLowerCase()
                const isWrong = isSelected && !isCorrect && showExplanation

                let buttonVariant: "default" | "outline" | "destructive" = "outline"
                let buttonClass = ""

                if (showExplanation) {
                  if (isCorrect) {
                    buttonVariant = "default"
                    buttonClass = "bg-green-500 hover:bg-green-600 text-white border-green-500"
                  } else if (isWrong) {
                    buttonVariant = "destructive"
                  }
                } else if (isSelected) {
                  buttonVariant = "default"
                }

                return (
                  <Button
                    key={index}
                    variant={buttonVariant}
                    className={`w-full justify-start text-left h-auto p-4 ${buttonClass}`}
                    onClick={() => !showExplanation && onAnswer(index)}
                    disabled={showExplanation}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center h-6 w-6 rounded-full bg-white/20 text-sm font-medium">
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className="flex-1">{option}</span>
                      {showExplanation && isCorrect && <CheckCircle className="h-5 w-5" />}
                      {showExplanation && isWrong && <XCircle className="h-5 w-5" />}
                    </div>
                  </Button>
                )
              })
            } else {
              return (
                <div className="text-center py-4 text-gray-500">
                  <p>Nenhuma opção disponível para esta questão</p>
                </div>
              )
            }
          })()}
        </div>

        {!showExplanation && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700">
              Responda a questão para ver a explicação, comentários e estatísticas
            </p>
          </div>
        )}

        {/* Explanation */}
        {showExplanation && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">Explicação:</h4>
            <p className="text-blue-800 leading-relaxed">
              {(() => {
                const correctAnswer = question.correct_answer || question.alternativa_correta
                if (correctAnswer) {
                  return `Alternativa correta: ${String(correctAnswer).toUpperCase()}`
                }
                return 'Explicação não disponível'
              })()}
            </p>
          </div>
        )}

        {showExplanation && (
          <div className="flex gap-3 pt-4 border-t bg-gray-50 -mx-6 px-6 py-4 rounded-b-lg">
            <Button
              variant={showComments ? "default" : "outline"}
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2 font-medium"
            >
              <MessageCircle className="h-4 w-4" />
              Comentários ({comments.length})
            </Button>
            <Button
              variant={showStats ? "default" : "outline"}
              size="sm"
              onClick={() => setShowStats(!showStats)}
              className="flex items-center gap-2 font-medium"
            >
              <BarChart3 className="h-4 w-4" />
              Estatísticas
            </Button>
          </div>
        )}

        {/* Stats Section */}
        {showStats && showExplanation && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
            <h4 className="font-medium text-gray-900 mb-3">Estatísticas de Respostas</h4>
            <div className="text-center py-8 text-gray-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">Ainda não há estatísticas disponíveis para esta questão.</p>
              <p className="text-xs mt-1">As estatísticas aparecerão quando outros usuários responderem.</p>
            </div>
          </div>
        )}

        {/* Comments Section */}
        {showComments && showExplanation && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
            <h4 className="font-medium text-gray-900 mb-4">Comentários</h4>

            {/* Add Comment */}
            <div className="mb-4">
              <Textarea
                placeholder="Adicione seu comentário sobre esta questão..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="mb-2"
              />
              <Button
                size="sm"
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                Comentar
              </Button>
            </div>

            {/* List of Comments */}
            {comments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">Ainda não há comentários para esta questão.</p>
                <p className="text-xs mt-1">Seja o primeiro a comentar!</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {comments.map((comment) => (
                  <div key={comment.id} className="bg-white p-3 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-sm">{comment.author}</span>
                      <span className="text-xs text-gray-500">{comment.timestamp}</span>
                    </div>
                    <p className="text-sm text-gray-700">{comment.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
