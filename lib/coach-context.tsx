"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useStudy } from "./study-context"

interface StudiedTopic {
  id: string
  subject: string
  topic: string
  studiedAt: string
  timeSpent: number // in minutes
  questionsAnswered: number
  correctAnswers: number
}

interface CoachRecommendation {
  id: string
  type: "study_topic" | "review_topic" | "practice_questions" | "take_break"
  subject: string
  topic?: string
  priority: "high" | "medium" | "low"
  reason: string
  estimatedTime: number
  createdAt: string
}

interface CoachContextType {
  studiedTopics: StudiedTopic[]
  recommendations: CoachRecommendation[]
  markTopicAsStudied: (
    subject: string,
    topic: string,
    timeSpent: number,
    questionsAnswered?: number,
    correctAnswers?: number,
  ) => void
  isTopicStudied: (subject: string, topic: string) => boolean
  getTopicStudyData: (subject: string, topic: string) => StudiedTopic | undefined
  generateRecommendations: () => void
  getSubjectProgress: (subject: string) => { studiedTopics: number; totalTime: number; accuracy: number }
}

const CoachContext = createContext<CoachContextType | undefined>(undefined)

export function CoachProvider({ children }: { children: ReactNode }) {
  const [studiedTopics, setStudiedTopics] = useState<StudiedTopic[]>([])
  const [recommendations, setRecommendations] = useState<CoachRecommendation[]>([])
  const { getWeeklyStats, getSubjectProgress } = useStudy()

  // Load data from localStorage
  useEffect(() => {
    const savedTopics = localStorage.getItem("studied-topics")
    const savedRecommendations = localStorage.getItem("coach-recommendations")

    if (savedTopics) {
      try {
        setStudiedTopics(JSON.parse(savedTopics))
      } catch (error) {
        console.error("Error loading studied topics:", error)
      }
    }

    if (savedRecommendations) {
      try {
        setRecommendations(JSON.parse(savedRecommendations))
      } catch (error) {
        console.error("Error loading recommendations:", error)
      }
    }
  }, [])

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem("studied-topics", JSON.stringify(studiedTopics))
  }, [studiedTopics])

  useEffect(() => {
    localStorage.setItem("coach-recommendations", JSON.stringify(recommendations))
  }, [recommendations])

  const markTopicAsStudied = (
    subject: string,
    topic: string,
    timeSpent: number,
    questionsAnswered = 0,
    correctAnswers = 0,
  ) => {
    const existingTopic = studiedTopics.find((t) => t.subject === subject && t.topic === topic)

    if (existingTopic) {
      // Update existing topic
      setStudiedTopics((prev) =>
        prev.map((t) =>
          t.id === existingTopic.id
            ? {
                ...t,
                studiedAt: new Date().toISOString(),
                timeSpent: t.timeSpent + timeSpent,
                questionsAnswered: t.questionsAnswered + questionsAnswered,
                correctAnswers: t.correctAnswers + correctAnswers,
              }
            : t,
        ),
      )
    } else {
      // Add new topic
      const newTopic: StudiedTopic = {
        id: Date.now().toString(),
        subject,
        topic,
        studiedAt: new Date().toISOString(),
        timeSpent,
        questionsAnswered,
        correctAnswers,
      }
      setStudiedTopics((prev) => [...prev, newTopic])
    }

    // Generate new recommendations after studying
    setTimeout(generateRecommendations, 100)
  }

  const isTopicStudied = (subject: string, topic: string) => {
    return studiedTopics.some((t) => t.subject === subject && t.topic === topic)
  }

  const getTopicStudyData = (subject: string, topic: string) => {
    return studiedTopics.find((t) => t.subject === subject && t.topic === topic)
  }

  const generateRecommendations = () => {
    const weeklyStats = getWeeklyStats()
    const newRecommendations: CoachRecommendation[] = []

    // Clear old recommendations
    setRecommendations([])

    // Recommendation 1: Study high-frequency topics
    if (studiedTopics.length < 5) {
      newRecommendations.push({
        id: "high-freq-topics",
        type: "study_topic",
        subject: "Português",
        topic: "Compreensão e interpretação de textos",
        priority: "high",
        reason: "Este tópico representa 57% das questões de Português. Priorize seu estudo!",
        estimatedTime: 60,
        createdAt: new Date().toISOString(),
      })
    }

    // Recommendation 2: Practice questions if low accuracy
    if (weeklyStats.accuracy < 70 && weeklyStats.totalQuestions > 10) {
      newRecommendations.push({
        id: "practice-questions",
        type: "practice_questions",
        subject: "Geral",
        priority: "high",
        reason: `Sua taxa de acerto está em ${weeklyStats.accuracy.toFixed(1)}%. Pratique mais questões para melhorar.`,
        estimatedTime: 45,
        createdAt: new Date().toISOString(),
      })
    }

    // Recommendation 3: Review topics studied more than 3 days ago
    const threeDaysAgo = new Date()
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

    const topicsToReview = studiedTopics.filter((topic) => new Date(topic.studiedAt) < threeDaysAgo)

    if (topicsToReview.length > 0) {
      const oldestTopic = topicsToReview.sort(
        (a, b) => new Date(a.studiedAt).getTime() - new Date(b.studiedAt).getTime(),
      )[0]

      newRecommendations.push({
        id: "review-topic",
        type: "review_topic",
        subject: oldestTopic.subject,
        topic: oldestTopic.topic,
        priority: "medium",
        reason: "É hora de revisar este tópico para fixar o conhecimento na memória de longo prazo.",
        estimatedTime: 30,
        createdAt: new Date().toISOString(),
      })
    }

    // Recommendation 4: Take a break if studying too much
    if (weeklyStats.totalHours > 40) {
      newRecommendations.push({
        id: "take-break",
        type: "take_break",
        subject: "Geral",
        priority: "medium",
        reason: "Você estudou muito esta semana! Considere fazer uma pausa para evitar burnout.",
        estimatedTime: 0,
        createdAt: new Date().toISOString(),
      })
    }

    // Recommendation 5: Focus on weak subjects
    const subjects = ["Português", "Matemática", "Direito Constitucional", "História do Brasil"]
    subjects.forEach((subject) => {
      const subjectProgress = getSubjectProgress(subject)
      if (subjectProgress.accuracy < 60 && subjectProgress.questions > 5) {
        newRecommendations.push({
          id: `weak-subject-${subject}`,
          type: "study_topic",
          subject,
          priority: "high",
          reason: `Sua performance em ${subject} está abaixo da média (${subjectProgress.accuracy.toFixed(1)}%). Foque nesta matéria.`,
          estimatedTime: 90,
          createdAt: new Date().toISOString(),
        })
      }
    })

    setRecommendations(newRecommendations.slice(0, 5)) // Limit to 5 recommendations
  }

  const getSubjectProgressLocal = (subject: string) => {
    const subjectTopics = studiedTopics.filter((t) => t.subject === subject)
    const studiedTopicsCount = subjectTopics.length
    const totalTime = subjectTopics.reduce((sum, t) => sum + t.timeSpent, 0)
    const totalQuestions = subjectTopics.reduce((sum, t) => sum + t.questionsAnswered, 0)
    const totalCorrect = subjectTopics.reduce((sum, t) => sum + t.correctAnswers, 0)
    const accuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0

    return { studiedTopics: studiedTopicsCount, totalTime, accuracy }
  }

  // Generate initial recommendations
  useEffect(() => {
    if (studiedTopics.length === 0 && recommendations.length === 0) {
      generateRecommendations()
    }
  }, [])

  const value: CoachContextType = {
    studiedTopics,
    recommendations,
    markTopicAsStudied,
    isTopicStudied,
    getTopicStudyData,
    generateRecommendations,
    getSubjectProgress: getSubjectProgressLocal,
  }

  return <CoachContext.Provider value={value}>{children}</CoachContext.Provider>
}

export function useCoach() {
  const context = useContext(CoachContext)
  if (context === undefined) {
    throw new Error("useCoach must be used within a CoachProvider")
  }
  return context
}
