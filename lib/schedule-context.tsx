"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useStudy } from "./study-context"
import { useCoach } from "./coach-context"
import { useReviews } from "./review-context"

interface StudyPreferences {
  studyHoursPerDay: number
  preferredStudyTimes: string[] // ["morning", "afternoon", "evening", "night"]
  studyDaysPerWeek: number
  breakDuration: number // minutes
  sessionDuration: number // minutes
  prioritizeWeakSubjects: boolean
  includeReviews: boolean
}

interface ScheduleItem {
  id: string
  date: string
  startTime: string
  endTime: string
  subject: string
  topic?: string
  type: "study" | "review" | "practice" | "break"
  priority: "high" | "medium" | "low"
  completed: boolean
  estimatedDuration: number // minutes
}

interface WeeklySchedule {
  weekStart: string
  items: ScheduleItem[]
  totalHours: number
  completedHours: number
}

interface ScheduleContextType {
  preferences: StudyPreferences
  currentWeekSchedule: WeeklySchedule | null
  updatePreferences: (prefs: Partial<StudyPreferences>) => void
  generateSchedule: () => void
  markItemCompleted: (itemId: string, actualDuration?: number) => void
  getScheduleForDate: (date: string) => ScheduleItem[]
  getWeeklyProgress: () => { planned: number; completed: number; percentage: number }
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined)

const defaultPreferences: StudyPreferences = {
  studyHoursPerDay: 4,
  preferredStudyTimes: ["morning", "afternoon"],
  studyDaysPerWeek: 6,
  breakDuration: 15,
  sessionDuration: 50,
  prioritizeWeakSubjects: true,
  includeReviews: true,
}

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<StudyPreferences>(defaultPreferences)
  const [currentWeekSchedule, setCurrentWeekSchedule] = useState<WeeklySchedule | null>(null)

  const studyContext = useStudy()
  const coachContext = useCoach()
  const reviewContext = useReviews()

  const { dailyGoals = {}, getSubjectProgress } = studyContext || {}
  const { studiedTopics = [], recommendations = [] } = coachContext || {}
  const { getDueReviews, getUpcomingReviews } = reviewContext || {}

  // Ensure all required functions and arrays are available
  const safeGetSubjectProgress = getSubjectProgress && typeof getSubjectProgress === "function" ? getSubjectProgress : () => ({ accuracy: 50, total: 0, correct: 0 })
  const safeStudiedTopics = Array.isArray(studiedTopics) ? studiedTopics : []
  const safeRecommendations = Array.isArray(recommendations) ? recommendations : []

  useEffect(() => {
    const saved = localStorage.getItem("study-preferences")
    if (saved) {
      try {
        setPreferences(JSON.parse(saved))
      } catch (error) {
        console.error("Error loading preferences:", error)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("study-preferences", JSON.stringify(preferences))
  }, [preferences])

  useEffect(() => {
    if (!studyContext || !coachContext || !reviewContext) return

    const saved = localStorage.getItem("current-week-schedule")
    if (saved) {
      try {
        const schedule = JSON.parse(saved)
        const weekStart = new Date(schedule.weekStart)
        const now = new Date()
        const currentWeekStart = new Date(now.setDate(now.getDate() - now.getDay()))

        if (weekStart.toDateString() === currentWeekStart.toDateString()) {
          setCurrentWeekSchedule(schedule)
        } else {
          generateSchedule()
        }
      } catch (error) {
        console.error("Error loading schedule:", error)
        generateSchedule()
      }
    } else {
      generateSchedule()
    }
  }, [studyContext, coachContext, reviewContext])

  useEffect(() => {
    if (currentWeekSchedule) {
      localStorage.setItem("current-week-schedule", JSON.stringify(currentWeekSchedule))
    }
  }, [currentWeekSchedule])

  const updatePreferences = (prefs: Partial<StudyPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...prefs }))
  }

  const getTimeSlots = (date: Date, preferredTimes: string[]) => {
    const slots: { start: string; end: string; period: string }[] = []

    preferredTimes.forEach((period) => {
      switch (period) {
        case "morning":
          slots.push({ start: "08:00", end: "12:00", period: "Manhã" })
          break
        case "afternoon":
          slots.push({ start: "14:00", end: "18:00", period: "Tarde" })
          break
        case "evening":
          slots.push({ start: "19:00", end: "22:00", period: "Noite" })
          break
        case "night":
          slots.push({ start: "22:00", end: "24:00", period: "Madrugada" })
          break
      }
    })

    return slots
  }

  const generateSchedule = () => {
    try {
      if (!studyContext || !coachContext || !reviewContext) {
        console.warn("Contexts not ready for schedule generation")
        return
      }

      // Use safe versions of functions and arrays
      const getSubjectProgress = safeGetSubjectProgress
      const studiedTopics = safeStudiedTopics
      const recommendations = safeRecommendations
      const now = new Date()
      const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
      const scheduleItems: ScheduleItem[] = []

      let dueReviews: any[] = []
      try {
        if (getDueReviews && typeof getDueReviews === "function") {
          const reviews = getDueReviews()
          dueReviews = Array.isArray(reviews) ? reviews : []
        }
      } catch (error) {
        console.error("Error getting due reviews:", error)
        dueReviews = []
      }

      const validDueReviews = Array.isArray(dueReviews) ? dueReviews.filter((review) => {
        try {
          return (
            review &&
            review !== null &&
            review !== undefined &&
            typeof review === "object" &&
            review.subject &&
            typeof review.subject === "string" &&
            review.subject.trim().length > 0
          )
        } catch (error) {
          console.error("Error filtering review:", error)
          return false
        }
      }) : []
      
      // Ensure validDueReviews is always a valid array
      if (!Array.isArray(validDueReviews)) {
        console.warn("validDueReviews is not an array, setting to empty array")
        validDueReviews = []
      }

      const subjects = [
        "Português",
        "Matemática",
        "Direito Constitucional",
        "História do Brasil",
        "Geografia do Brasil",
      ]

      const subjectPriorities = subjects
        .map((subjectName) => {
          let progress = { accuracy: 50, total: 0, correct: 0 }
          try {
            const subjectProgress = getSubjectProgress(subjectName)
            if (subjectProgress && typeof subjectProgress === "object") {
              progress = { ...progress, ...subjectProgress }
            }
          } catch (error) {
            console.error(`Error getting progress for ${subjectName}:`, error)
          }

          const studiedCount = studiedTopics.filter((topic) => {
            try {
              return (
                topic &&
                typeof topic === "object" &&
                topic.subject &&
                typeof topic.subject === "string" &&
                topic.subject === subjectName
              )
            } catch (error) {
              console.error("Error filtering studied topics:", error)
              return false
            }
          }).length

          let priority: "high" | "medium" | "low" = "medium"
          if (progress.accuracy < 60 || studiedCount < 2) priority = "high"
          else if (progress.accuracy > 80 && studiedCount > 5) priority = "low"

          return {
            subject: subjectName,
            priority,
            accuracy: progress.accuracy,
            studiedCount,
          }
        })
        .sort((a, b) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        })
        .filter((item) => item && item.subject && typeof item.subject === "string") // Ensure all items are valid

      // Ensure subjectPriorities is always a valid array
      if (!Array.isArray(subjectPriorities) || subjectPriorities.length === 0) {
        console.warn("subjectPriorities is invalid, using default")
        subjectPriorities = [{ subject: "Português", priority: "medium" as const }]
      }

      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const currentDate = new Date(weekStart)
        currentDate.setDate(weekStart.getDate() + dayOffset)

        if (dayOffset === 0 || dayOffset > preferences.studyDaysPerWeek) continue

        const dateStr = currentDate.toISOString().split("T")[0]
        const timeSlots = getTimeSlots(currentDate, preferences.preferredStudyTimes)

        let dailyHoursScheduled = 0
        const targetHours = preferences.studyHoursPerDay

        timeSlots.forEach((slot) => {
          if (dailyHoursScheduled >= targetHours) return

          const slotStart = new Date(`${dateStr}T${slot.start}:00`)
          let currentTime = new Date(slotStart)

          while (
            dailyHoursScheduled < targetHours &&
            currentTime.getHours() < Number.parseInt(slot.end.split(":")[0])
          ) {
            if (preferences.includeReviews && Array.isArray(validDueReviews) && validDueReviews.length > 0 && Math.random() > 0.7) {
              const reviewIndex = Math.floor(Math.random() * validDueReviews.length)
              const review = validDueReviews[reviewIndex]
              
              // Skip if review is undefined or invalid
              if (!review) continue

              // Extra safety check - verify subject exists and is valid
              if (review && 
                  typeof review === "object" && 
                  review !== null &&
                  review.subject && 
                  typeof review.subject === "string" && 
                  review.subject.trim().length > 0) {
                
                // Double-check subject before using it
                const reviewSubject = review.subject
                if (!reviewSubject || typeof reviewSubject !== "string" || reviewSubject.trim().length === 0) {
                  continue // Skip this review if subject is invalid
                }
                
                const endTime = new Date(currentTime.getTime() + 30 * 60000)
                const reviewTopic = review.topic && typeof review.topic === "string" ? review.topic : "Revisão Geral"

                scheduleItems.push({
                  id: `review-${Date.now()}-${Math.random()}`,
                  date: dateStr,
                  startTime: currentTime.toTimeString().slice(0, 5),
                  endTime: endTime.toTimeString().slice(0, 5),
                  subject: reviewSubject, // Use the verified subject
                  topic: reviewTopic,
                  type: "review",
                  priority: "high",
                  completed: false,
                  estimatedDuration: 30,
                })

                currentTime = new Date(endTime.getTime() + preferences.breakDuration * 60000)
                dailyHoursScheduled += 0.5
                continue
              }
            }

            let subjectToStudy = { subject: "Português", priority: "medium" as const }
            
            try {
              if (Array.isArray(subjectPriorities) && subjectPriorities.length > 0) {
                const selectedSubject = subjectPriorities[dailyHoursScheduled % subjectPriorities.length]
                if (selectedSubject && selectedSubject.subject && typeof selectedSubject.subject === "string") {
                  subjectToStudy = selectedSubject
                }
              }
            } catch (error) {
              console.error("Error selecting subject:", error)
              // Use default subjectToStudy
            }

            const endTime = new Date(currentTime.getTime() + preferences.sessionDuration * 60000)

            scheduleItems.push({
              id: `study-${Date.now()}-${Math.random()}`,
              date: dateStr,
              startTime: currentTime.toTimeString().slice(0, 5),
              endTime: endTime.toTimeString().slice(0, 5),
              subject: subjectToStudy.subject,
              type: "study",
              priority: subjectToStudy.priority,
              completed: false,
              estimatedDuration: preferences.sessionDuration,
            })

            const breakEnd = new Date(endTime.getTime() + preferences.breakDuration * 60000)
            scheduleItems.push({
              id: `break-${Date.now()}-${Math.random()}`,
              date: dateStr,
              startTime: endTime.toTimeString().slice(0, 5),
              endTime: breakEnd.toTimeString().slice(0, 5),
              subject: "Pausa",
              type: "break",
              priority: "low",
              completed: false,
              estimatedDuration: preferences.breakDuration,
            })

            currentTime = breakEnd
            dailyHoursScheduled += preferences.sessionDuration / 60
          }
        })
      }

      const totalHours = scheduleItems
        .filter((item) => item.type !== "break")
        .reduce((sum, item) => sum + item.estimatedDuration / 60, 0)

      const newSchedule: WeeklySchedule = {
        weekStart: weekStart.toISOString(),
        items: scheduleItems,
        totalHours,
        completedHours: 0,
      }

      setCurrentWeekSchedule(newSchedule)
    } catch (error) {
      console.error("Error generating schedule:", error)
      setCurrentWeekSchedule({
        weekStart: new Date().toISOString(),
        items: [],
        totalHours: 0,
        completedHours: 0,
      })
    }
  }

  const markItemCompleted = (itemId: string, actualDuration?: number) => {
    if (!currentWeekSchedule) return

    setCurrentWeekSchedule((prev) => {
      if (!prev) return prev

      const updatedItems = prev.items.map((item) => {
        if (item.id === itemId) {
          return { ...item, completed: true }
        }
        return item
      })

      const completedHours = updatedItems
        .filter((item) => item.completed && item.type !== "break")
        .reduce((sum, item) => sum + (actualDuration || item.estimatedDuration) / 60, 0)

      return {
        ...prev,
        items: updatedItems,
        completedHours,
      }
    })
  }

  const getScheduleForDate = (date: string) => {
    if (!currentWeekSchedule) return []
    return currentWeekSchedule.items.filter((item) => item.date === date)
  }

  const getWeeklyProgress = () => {
    if (!currentWeekSchedule) return { planned: 0, completed: 0, percentage: 0 }

    const planned = currentWeekSchedule.totalHours
    const completed = currentWeekSchedule.completedHours
    const percentage = planned > 0 ? (completed / planned) * 100 : 0

    return { planned, completed, percentage }
  }

  const value: ScheduleContextType = {
    preferences,
    currentWeekSchedule,
    updatePreferences,
    generateSchedule,
    markItemCompleted,
    getScheduleForDate,
    getWeeklyProgress,
  }

  return <ScheduleContext.Provider value={value}>{children}</ScheduleContext.Provider>
}

export function useSchedule() {
  const context = useContext(ScheduleContext)
  if (context === undefined) {
    throw new Error("useSchedule must be used within a ScheduleProvider")
  }
  return context
}
