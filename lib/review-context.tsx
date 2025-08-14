"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useCoach } from "./coach-context"

interface ReviewItem {
  id: string
  subject: string
  topic: string
  studiedAt: string
  reviewLevel: number // 0 = first review, 1 = second review, etc.
  nextReviewDate: string
  difficulty: "easy" | "medium" | "hard"
  lastReviewResult?: "easy" | "good" | "hard" | "again"
  reviewCount: number
  interval: number // days until next review
}

interface ReviewContextType {
  reviewItems: ReviewItem[]
  getDueReviews: () => ReviewItem[]
  getUpcomingReviews: (days: number) => ReviewItem[]
  completeReview: (id: string, result: "easy" | "good" | "hard" | "again") => void
  addTopicForReview: (subject: string, topic: string, difficulty?: "easy" | "medium" | "hard") => void
  getReviewStats: () => { total: number; due: number; upcoming: number; completed: number }
}

const ReviewContext = createContext<ReviewContextType | undefined>(undefined)

// Spaced Repetition Algorithm based on SuperMemo SM-2
const calculateNextReview = (
  reviewLevel: number,
  result: "easy" | "good" | "hard" | "again",
  currentInterval: number,
  easeFactor = 2.5,
): { interval: number; easeFactor: number } => {
  let newEaseFactor = easeFactor
  let newInterval = currentInterval

  switch (result) {
    case "again":
      newInterval = 1
      newEaseFactor = Math.max(1.3, easeFactor - 0.2)
      break
    case "hard":
      newInterval = Math.max(1, Math.floor(currentInterval * 1.2))
      newEaseFactor = Math.max(1.3, easeFactor - 0.15)
      break
    case "good":
      if (reviewLevel === 0) {
        newInterval = 1
      } else if (reviewLevel === 1) {
        newInterval = 6
      } else {
        newInterval = Math.floor(currentInterval * easeFactor)
      }
      break
    case "easy":
      if (reviewLevel === 0) {
        newInterval = 4
      } else if (reviewLevel === 1) {
        newInterval = 6
      } else {
        newInterval = Math.floor(currentInterval * easeFactor * 1.3)
      }
      newEaseFactor = easeFactor + 0.15
      break
  }

  return { interval: newInterval, easeFactor: newEaseFactor }
}

export function ReviewProvider({ children }: { children: ReactNode }) {
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([])
  const { studiedTopics } = useCoach()

  // Load review items from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("review-items")
    if (saved) {
      try {
        setReviewItems(JSON.parse(saved))
      } catch (error) {
        console.error("Error loading review items:", error)
      }
    }
  }, [])

  // Save review items to localStorage
  useEffect(() => {
    localStorage.setItem("review-items", JSON.stringify(reviewItems))
  }, [reviewItems])

  // Auto-add studied topics to review system
  useEffect(() => {
    studiedTopics.forEach((studiedTopic) => {
      const existingReview = reviewItems.find(
        (item) => item.subject === studiedTopic.subject && item.topic === studiedTopic.topic,
      )

      if (!existingReview) {
        // Determine difficulty based on accuracy
        let difficulty: "easy" | "medium" | "hard" = "medium"
        if (studiedTopic.questionsAnswered > 0) {
          const accuracy = (studiedTopic.correctAnswers / studiedTopic.questionsAnswered) * 100
          if (accuracy >= 80) difficulty = "easy"
          else if (accuracy < 60) difficulty = "hard"
        }

        addTopicForReview(studiedTopic.subject, studiedTopic.topic, difficulty)
      }
    })
  }, [studiedTopics])

  const addTopicForReview = (subject: string, topic: string, difficulty: "easy" | "medium" | "hard" = "medium") => {
    const existingItem = reviewItems.find((item) => item.subject === subject && item.topic === topic)
    if (existingItem) return

    const initialInterval = difficulty === "easy" ? 4 : difficulty === "hard" ? 1 : 1
    const nextReviewDate = new Date()
    nextReviewDate.setDate(nextReviewDate.getDate() + initialInterval)

    const newItem: ReviewItem = {
      id: Date.now().toString(),
      subject,
      topic,
      studiedAt: new Date().toISOString(),
      reviewLevel: 0,
      nextReviewDate: nextReviewDate.toISOString(),
      difficulty,
      reviewCount: 0,
      interval: initialInterval,
    }

    setReviewItems((prev) => [...prev, newItem])
  }

  const getDueReviews = () => {
    const now = new Date()
    return reviewItems.filter((item) => new Date(item.nextReviewDate) <= now)
  }

  const getUpcomingReviews = (days: number) => {
    const now = new Date()
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + days)

    return reviewItems.filter((item) => {
      const reviewDate = new Date(item.nextReviewDate)
      return reviewDate > now && reviewDate <= futureDate
    })
  }

  const completeReview = (id: string, result: "easy" | "good" | "hard" | "again") => {
    setReviewItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const { interval, easeFactor } = calculateNextReview(item.reviewLevel, result, item.interval)
          const nextReviewDate = new Date()
          nextReviewDate.setDate(nextReviewDate.getDate() + interval)

          return {
            ...item,
            reviewLevel: result === "again" ? item.reviewLevel : item.reviewLevel + 1,
            nextReviewDate: nextReviewDate.toISOString(),
            lastReviewResult: result,
            reviewCount: item.reviewCount + 1,
            interval,
          }
        }
        return item
      }),
    )
  }

  const getReviewStats = () => {
    const total = reviewItems.length
    const due = getDueReviews().length
    const upcoming = getUpcomingReviews(7).length
    const completed = reviewItems.filter((item) => item.reviewCount > 0).length

    return { total, due, upcoming, completed }
  }

  const value: ReviewContextType = {
    reviewItems,
    getDueReviews,
    getUpcomingReviews,
    completeReview,
    addTopicForReview,
    getReviewStats,
  }

  return <ReviewContext.Provider value={value}>{children}</ReviewContext.Provider>
}

export function useReviews() {
  const context = useContext(ReviewContext)
  if (context === undefined) {
    throw new Error("useReviews must be used within a ReviewProvider")
  }
  return context
}
