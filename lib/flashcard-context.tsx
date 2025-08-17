"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface Flashcard {
  id: string
  front: string
  back: string
  subject: string
  topic: string
  difficulty: "easy" | "medium" | "hard"
  nextReview: string
  reviewCount: number
  correctCount: number
  createdAt: string
  lastReviewed?: string
}

interface FlashcardContextType {
  flashcards: Flashcard[]
  createFlashcard: (
    flashcard: Omit<Flashcard, "id" | "nextReview" | "reviewCount" | "correctCount" | "createdAt">,
  ) => void
  updateFlashcard: (id: string, updates: Partial<Flashcard>) => void
  deleteFlashcard: (id: string) => void
  reviewFlashcard: (id: string, correct: boolean) => void
  getDueForReview: () => Flashcard[]
  getFlashcardsBySubject: (subject: string) => Flashcard[]
  getStats: () => { total: number; dueForReview: number; totalReviewed: number; accuracy: number }
}

const FlashcardContext = createContext<FlashcardContextType | undefined>(undefined)

export function FlashcardProvider({ children }: { children: ReactNode }) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])

  // Load flashcards from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("flashcards")
    if (saved) {
      try {
        setFlashcards(JSON.parse(saved))
          } catch (error) {
      // Silent error handling
    }
    }
  }, [])

  // Save flashcards to localStorage
  useEffect(() => {
    localStorage.setItem("flashcards", JSON.stringify(flashcards))
  }, [flashcards])

  const calculateNextReview = (difficulty: "easy" | "medium" | "hard", reviewCount: number, correct: boolean) => {
    let days = 1

    if (correct) {
      switch (difficulty) {
        case "easy":
          days = Math.min(reviewCount * 3, 30)
          break
        case "medium":
          days = Math.min(reviewCount * 2, 21)
          break
        case "hard":
          days = Math.min(reviewCount * 1.5, 14)
          break
      }
    } else {
      days = 1 // Review again tomorrow if incorrect
    }

    const nextReview = new Date()
    nextReview.setDate(nextReview.getDate() + days)
    return nextReview.toISOString()
  }

  const createFlashcard = (
    flashcard: Omit<Flashcard, "id" | "nextReview" | "reviewCount" | "correctCount" | "createdAt">,
  ) => {
    const newFlashcard: Flashcard = {
      ...flashcard,
      id: Date.now().toString(),
      nextReview: calculateNextReview(flashcard.difficulty, 1, true),
      reviewCount: 0,
      correctCount: 0,
      createdAt: new Date().toISOString(),
    }
    setFlashcards((prev) => [...prev, newFlashcard])
  }

  const updateFlashcard = (id: string, updates: Partial<Flashcard>) => {
    setFlashcards((prev) => prev.map((card) => (card.id === id ? { ...card, ...updates } : card)))
  }

  const deleteFlashcard = (id: string) => {
    setFlashcards((prev) => prev.filter((card) => card.id !== id))
  }

  const reviewFlashcard = (id: string, correct: boolean) => {
    setFlashcards((prev) =>
      prev.map((card) => {
        if (card.id === id) {
          const newReviewCount = card.reviewCount + 1
          const newCorrectCount = correct ? card.correctCount + 1 : card.correctCount
          return {
            ...card,
            reviewCount: newReviewCount,
            correctCount: newCorrectCount,
            nextReview: calculateNextReview(card.difficulty, newReviewCount, correct),
            lastReviewed: new Date().toISOString(),
          }
        }
        return card
      }),
    )
  }

  const getDueForReview = () => {
    const now = new Date()
    return flashcards.filter((card) => new Date(card.nextReview) <= now)
  }

  const getFlashcardsBySubject = (subject: string) => {
    return flashcards.filter((card) => card.subject === subject)
  }

  const getStats = () => {
    const total = flashcards.length
    const dueForReview = getDueForReview().length
    const totalReviewed = flashcards.filter((card) => card.reviewCount > 0).length
    const totalReviews = flashcards.reduce((sum, card) => sum + card.reviewCount, 0)
    const totalCorrect = flashcards.reduce((sum, card) => sum + card.correctCount, 0)
    const accuracy = totalReviews > 0 ? (totalCorrect / totalReviews) * 100 : 0

    return { total, dueForReview, totalReviewed, accuracy }
  }

  const value: FlashcardContextType = {
    flashcards,
    createFlashcard,
    updateFlashcard,
    deleteFlashcard,
    reviewFlashcard,
    getDueForReview,
    getFlashcardsBySubject,
    getStats,
  }

  return <FlashcardContext.Provider value={value}>{children}</FlashcardContext.Provider>
}

export function useFlashcards() {
  const context = useContext(FlashcardContext)
  if (context === undefined) {
    throw new Error("useFlashcards must be used within a FlashcardProvider")
  }
  return context
}
