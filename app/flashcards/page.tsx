"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, BookOpen, Clock, RotateCcw, Trash2 } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { useFlashcards } from "@/lib/flashcard-context"
import { CreateFlashcardModal } from "@/components/flashcards/create-flashcard-modal"

export default function FlashcardsPage() {
  const { flashcards, getStats, deleteFlashcard } = useFlashcards()
  const [selectedSubject, setSelectedSubject] = useState<string>("all")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [subjects, setSubjects] = useState<any[]>([])
  const supabase = createClient()
  const stats = getStats()

  // Carregar disciplinas do Supabase
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const { data, error } = await supabase
          .from('assuntos_edital')
          .select('disciplina')
          .order('disciplina')
        
        if (error) {
          return
        }

        if (data) {
          const uniqueSubjects = Array.from(new Set(data.map(item => item.disciplina)))
          setSubjects(uniqueSubjects.map((disciplina, index) => ({
            id: index.toString(),
            name: disciplina
          })))
        }
      } catch (error) {
        // Silent error handling
      }
    }

    fetchSubjects()
  }, [supabase])
  const filteredFlashcards =
    selectedSubject === "all" ? flashcards : flashcards.filter((card) => card.subject === selectedSubject)

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "hard":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header com gradiente */}
      <div className="relative bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-pink-600/20 to-transparent"></div>

        <div className="relative px-8 py-12 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg animate-bounce-subtle">
                <BookOpen className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-pink-100 bg-clip-text text-transparent">
                  Flashcards
                </h1>
                <p className="text-pink-100 text-lg mt-2">Sistema de revisão espaçada para memorização eficiente</p>
              </div>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-all duration-300 hover:scale-105"
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar Flashcard
            </Button>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-fade-in-up animation-delay-100">
          <Card className="shadow-soft border-0 hover:shadow-lg hover:scale-105 transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100/50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <BookOpen className="w-6 h-6 text-blue-600 animate-pulse-subtle" />
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total de Cards</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft border-0 hover:shadow-lg hover:scale-105 transition-all duration-300 bg-gradient-to-br from-orange-50 to-orange-100/50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Clock className="w-6 h-6 text-orange-600 animate-pulse-subtle" />
                <div>
                  <p className="text-sm text-gray-600 font-medium">Para Revisar</p>
                  <p className="text-3xl font-bold">{stats.dueForReview}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft border-0 hover:shadow-lg hover:scale-105 transition-all duration-300 bg-gradient-to-br from-green-50 to-green-100/50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <RotateCcw className="w-6 h-6 text-green-600 animate-pulse-subtle" />
                <div>
                  <p className="text-sm text-gray-600 font-medium">Revisados</p>
                  <p className="text-3xl font-bold">{stats.totalReviewed}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft border-0 hover:shadow-lg hover:scale-105 transition-all duration-300 bg-gradient-to-br from-purple-50 to-purple-100/50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Clock className="w-6 h-6 text-purple-600 animate-pulse-subtle" />
                <div>
                  <p className="text-sm text-gray-600 font-medium">Taxa Acerto</p>
                  <p className="text-3xl font-bold">{stats.accuracy.toFixed(0)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-soft border-0 hover:shadow-lg transition-all duration-300 animate-fade-in-up animation-delay-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-pink-100 rounded-lg animate-pulse-subtle">
                <BookOpen className="h-5 w-5 text-pink-600" />
              </div>
              Filtrar por Matéria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button
                variant={selectedSubject === "all" ? "default" : "outline"}
                onClick={() => setSelectedSubject("all")}
                size="sm"
                className="hover:scale-105 transition-transform duration-200"
              >
                Todas ({stats.total})
              </Button>
              {subjects.map((subject) => {
                const count = flashcards.filter((card) => card.subject === subject.name).length
                return (
                  <Button
                    key={subject.id}
                    variant={selectedSubject === subject.name ? "default" : "outline"}
                    onClick={() => setSelectedSubject(subject.name)}
                    size="sm"
                    className="hover:scale-105 transition-transform duration-200"
                    style={{
                      backgroundColor: selectedSubject === subject.name ? subject.color : undefined,
                      borderColor: subject.color,
                    }}
                  >
                    {subject.name} ({count})
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {filteredFlashcards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFlashcards.map((card, index) => (
              <Card
                key={card.id}
                className="shadow-soft border-0 hover:shadow-lg hover:scale-105 transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(card.difficulty)}`}
                      >
                        {card.difficulty === "easy" ? "Fácil" : card.difficulty === "medium" ? "Médio" : "Difícil"}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteFlashcard(card.id)}
                      className="hover:bg-red-100 text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      {card.subject} • {card.topic}
                    </p>
                    <CardTitle className="text-lg">{card.front}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm">{card.back}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Revisões: {card.reviewCount}</span>
                    <span>Acertos: {card.correctCount}</span>
                  </div>
                  {card.nextReview && (
                    <p className="text-xs text-muted-foreground">
                      Próxima revisão: {new Date(card.nextReview).toLocaleDateString("pt-BR")}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="shadow-soft border-0 hover:shadow-lg transition-all duration-300 animate-fade-in-up animation-delay-400">
            <CardContent className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="p-4 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <BookOpen className="h-10 w-10 text-pink-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {selectedSubject === "all" ? "Nenhum flashcard criado" : `Nenhum flashcard em ${selectedSubject}`}
                </h3>
                <p className="text-muted-foreground mb-6">
                  Comece criando seu primeiro flashcard para iniciar seus estudos com revisão espaçada
                </p>
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeiro Flashcard
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <CreateFlashcardModal open={showCreateModal} onOpenChange={setShowCreateModal} />
    </div>
  )
}
