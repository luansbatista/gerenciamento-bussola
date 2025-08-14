"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { RotateCcw, CheckCircle, XCircle, Eye, EyeOff, BookOpen, Plus } from "lucide-react"
import { mockSubjects } from "@/lib/mock-data"

export default function StudyFlashcardsPage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [studiedCards, setStudiedCards] = useState<string[]>([])
  const [showResults, setShowResults] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [slideDirection, setSlideDirection] = useState<"left" | "right" | null>(null)

  const flashcards: any[] = []
  const subjects = mockSubjects

  if (flashcards.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-10 h-10 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold mb-4 text-gray-500">Nenhum Flashcard Disponível</h2>
              <p className="text-gray-400 mb-6">Você precisa criar flashcards antes de poder estudá-los.</p>
              <div className="space-y-4">
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => (window.location.href = "/flashcards")}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Flashcards
                </Button>
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => (window.location.href = "/flashcards")}
                >
                  Voltar aos Flashcards
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const currentCard = flashcards[currentIndex]
  const subject = subjects.find((s) => s.id === currentCard?.subjectId)
  const progress = ((currentIndex + 1) / flashcards.length) * 100

  const navigateCard = (direction: "next" | "prev") => {
    if (isAnimating) return

    setIsAnimating(true)
    setSlideDirection(direction === "next" ? "right" : "left")

    setTimeout(() => {
      if (direction === "next" && currentIndex < flashcards.length - 1) {
        setCurrentIndex(currentIndex + 1)
      } else if (direction === "prev" && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1)
      }
      setIsFlipped(false)
      setSlideDirection(null)
      setIsAnimating(false)
    }, 150)
  }

  const handleDifficultyResponse = (difficulty: "easy" | "medium" | "hard") => {
    if (currentCard && !isAnimating) {
      setStudiedCards([...studiedCards, currentCard.id])

      if (currentIndex < flashcards.length - 1) {
        navigateCard("next")
      } else {
        setShowResults(true)
      }
    }
  }

  const resetStudy = () => {
    setCurrentIndex(0)
    setIsFlipped(false)
    setStudiedCards([])
    setShowResults(false)
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Sessão Concluída!</h2>
              <p className="text-gray-600 mb-6">Você estudou {studiedCards.length} flashcards nesta sessão.</p>
              <div className="space-y-4">
                <Button onClick={resetStudy} className="w-full">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Estudar Novamente
                </Button>
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => (window.location.href = "/flashcards")}
                >
                  Voltar aos Flashcards
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!currentCard) {
    return <div>Carregando...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Estudando Flashcards</h1>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
            <span>
              Card {currentIndex + 1} de {flashcards.length}
            </span>
            <Badge style={{ backgroundColor: subject?.color }} className="text-white">
              {subject?.name}
            </Badge>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Progresso</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Flashcard */}
        <div className="relative perspective-1000">
          <div
            className={`relative w-full h-80 transition-transform duration-700 transform-style-preserve-3d cursor-pointer ${
              isFlipped ? "rotate-y-180" : ""
            } ${
              slideDirection === "left"
                ? "animate-slide-out-left"
                : slideDirection === "right"
                  ? "animate-slide-out-right"
                  : "animate-slide-in"
            }`}
            onClick={() => !isAnimating && setIsFlipped(!isFlipped)}
          >
            {/* Front of card */}
            <Card className="absolute inset-0 w-full h-full backface-hidden border-2 border-blue-200 hover:border-blue-300 transition-colors">
              <CardContent className="p-8 flex flex-col justify-center items-center text-center h-full">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
                    <Eye className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold">Pergunta</h3>
                  <p className="text-lg text-gray-700">{currentCard.front}</p>
                  <p className="text-sm text-gray-500 animate-bounce">Clique para ver a resposta</p>
                </div>
              </CardContent>
            </Card>

            {/* Back of card */}
            <Card className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 border-2 border-green-200 hover:border-green-300 transition-colors">
              <CardContent className="p-8 flex flex-col justify-center items-center text-center h-full">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <EyeOff className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold">Resposta</h3>
                  <p className="text-lg text-gray-700">{currentCard.back}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Controls */}
        {isFlipped && (
          <Card className="animate-fade-in">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <h4 className="font-semibold">Como foi a dificuldade?</h4>
                <p className="text-sm text-gray-600">
                  Sua resposta ajuda a determinar quando revisar este card novamente
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    onClick={() => handleDifficultyResponse("easy")}
                    className="bg-green-600 hover:bg-green-700 transform hover:scale-105 transition-all duration-200"
                    disabled={isAnimating}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Fácil
                  </Button>
                  <Button
                    onClick={() => handleDifficultyResponse("medium")}
                    className="bg-yellow-600 hover:bg-yellow-700 transform hover:scale-105 transition-all duration-200"
                    disabled={isAnimating}
                  >
                    Médio
                  </Button>
                  <Button
                    onClick={() => handleDifficultyResponse("hard")}
                    className="bg-red-600 hover:bg-red-700 transform hover:scale-105 transition-all duration-200"
                    disabled={isAnimating}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Difícil
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => navigateCard("prev")}
            disabled={currentIndex === 0 || isAnimating}
            className="transform hover:scale-105 transition-all duration-200"
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            onClick={() => !isAnimating && setIsFlipped(!isFlipped)}
            disabled={isAnimating}
            className="transform hover:scale-105 transition-all duration-200"
          >
            {isFlipped ? "Ver Pergunta" : "Ver Resposta"}
          </Button>
          <Button
            variant="outline"
            onClick={() => navigateCard("next")}
            disabled={currentIndex === flashcards.length - 1 || isAnimating}
            className="transform hover:scale-105 transition-all duration-200"
          >
            Próximo
          </Button>
        </div>
      </div>
    </div>
  )
}
