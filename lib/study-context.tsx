"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { usePomodoro } from "./pomodoro-context"

interface StudySession {
  id: string
  subject: string
  topic: string
  duration: number // in minutes
  questionsAnswered: number
  correctAnswers: number
  date: string
  type: "pomodoro" | "questions" | "exam"
}

interface DailyGoal {
  id: string
  title: string
  type: "daily" | "weekly" | "monthly"
  category: "questions" | "hours" | "exams"
  target: number
  current: number
  deadline: string
  completed: boolean
  subjects?: string[] // For hour-based goals
}

interface StudyContextType {
  studySessions: StudySession[]
  dailyGoals: DailyGoal[]
  addStudySession: (session: Omit<StudySession, "id" | "date">) => void
  updateGoalProgress: (goalId: string, progress: number) => void
  createGoal: (goal: Omit<DailyGoal, "id" | "current" | "completed">) => void
  deleteGoal: (goalId: string) => void
  getTodayStudyTime: () => number
  getTodayQuestionsCount: () => number
  getWeeklyStats: () => { totalHours: number; totalQuestions: number; accuracy: number }
  getSubjectProgress: (subject: string) => { hours: number; questions: number; accuracy: number }
}

const StudyContext = createContext<StudyContextType | undefined>(undefined)

export function StudyProvider({ children }: { children: ReactNode }) {
  const [studySessions, setStudySessions] = useState<StudySession[]>([])
  const [dailyGoals, setDailyGoals] = useState<DailyGoal[]>([])
  const { totalFocusTime, sessionsCompleted } = usePomodoro()

  // Load data from localStorage
  useEffect(() => {
    const savedSessions = localStorage.getItem("study-sessions")
    const savedGoals = localStorage.getItem("daily-goals")

    if (savedSessions) {
      try {
        setStudySessions(JSON.parse(savedSessions))
      } catch (error) {
        console.error("Error loading study sessions:", error)
      }
    }

    if (savedGoals) {
      try {
        setDailyGoals(JSON.parse(savedGoals))
      } catch (error) {
        console.error("Error loading daily goals:", error)
      }
    } else {
      // Create default daily goals
      const defaultGoals: DailyGoal[] = [
        {
          id: "default-questions",
          title: "Questões Diárias",
          type: "daily",
          category: "questions",
          target: 50,
          current: 0,
          deadline: new Date().toISOString().split("T")[0],
          completed: false,
        },
        {
          id: "default-hours",
          title: "Horas de Estudo Diárias",
          type: "daily",
          category: "hours",
          target: 4,
          current: 0,
          deadline: new Date().toISOString().split("T")[0],
          completed: false,
        },
      ]
      setDailyGoals(defaultGoals)
    }
  }, [])

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem("study-sessions", JSON.stringify(studySessions))
  }, [studySessions])

  useEffect(() => {
    localStorage.setItem("daily-goals", JSON.stringify(dailyGoals))
  }, [dailyGoals])

  // Update hour-based goals when Pomodoro sessions are completed
  useEffect(() => {
    const todayHours = Math.floor((totalFocusTime / 60) * 100) / 100 // Convert to hours with 2 decimal places

    setDailyGoals((prev) =>
      prev.map((goal) => {
        if (goal.category === "hours" && goal.type === "daily") {
          return {
            ...goal,
            current: todayHours,
            completed: todayHours >= goal.target,
          }
        }
        return goal
      }),
    )
  }, [totalFocusTime])

  const addStudySession = (session: Omit<StudySession, "id" | "date">) => {
    const newSession: StudySession = {
      ...session,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    }

    setStudySessions((prev) => [...prev, newSession])

    // Update question-based goals
    if (session.questionsAnswered > 0) {
      setDailyGoals((prev) =>
        prev.map((goal) => {
          if (goal.category === "questions" && goal.type === "daily") {
            const newCurrent = goal.current + session.questionsAnswered
            return {
              ...goal,
              current: newCurrent,
              completed: newCurrent >= goal.target,
            }
          }
          return goal
        }),
      )
    }
  }

  const updateGoalProgress = (goalId: string, progress: number) => {
    setDailyGoals((prev) =>
      prev.map((goal) => {
        if (goal.id === goalId) {
          const newCurrent = Math.min(goal.current + progress, goal.target)
          return {
            ...goal,
            current: newCurrent,
            completed: newCurrent >= goal.target,
          }
        }
        return goal
      }),
    )
  }

  const createGoal = (goal: Omit<DailyGoal, "id" | "current" | "completed">) => {
    const newGoal: DailyGoal = {
      ...goal,
      id: Date.now().toString(),
      current: 0,
      completed: false,
    }
    setDailyGoals((prev) => [...prev, newGoal])
  }

  const deleteGoal = (goalId: string) => {
    setDailyGoals((prev) => prev.filter((goal) => goal.id !== goalId))
  }

  const getTodayStudyTime = () => {
    const today = new Date().toDateString()
    return studySessions
      .filter((session) => new Date(session.date).toDateString() === today)
      .reduce((total, session) => total + session.duration, 0)
  }

  const getTodayQuestionsCount = () => {
    const today = new Date().toDateString()
    return studySessions
      .filter((session) => new Date(session.date).toDateString() === today)
      .reduce((total, session) => total + session.questionsAnswered, 0)
  }

  const getWeeklyStats = () => {
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const weekSessions = studySessions.filter((session) => new Date(session.date) >= oneWeekAgo)

    const totalHours = weekSessions.reduce((total, session) => total + session.duration, 0) / 60
    const totalQuestions = weekSessions.reduce((total, session) => total + session.questionsAnswered, 0)
    const totalCorrect = weekSessions.reduce((total, session) => total + session.correctAnswers, 0)
    const accuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0

    return { totalHours, totalQuestions, accuracy }
  }

  const getSubjectProgress = (subject: string) => {
    const subjectSessions = studySessions.filter((session) => session.subject === subject)

    const hours = subjectSessions.reduce((total, session) => total + session.duration, 0) / 60
    const questions = subjectSessions.reduce((total, session) => total + session.questionsAnswered, 0)
    const correct = subjectSessions.reduce((total, session) => total + session.correctAnswers, 0)
    const accuracy = questions > 0 ? (correct / questions) * 100 : 0

    return { hours, questions, accuracy }
  }

  const value: StudyContextType = {
    studySessions,
    dailyGoals,
    addStudySession,
    updateGoalProgress,
    createGoal,
    deleteGoal,
    getTodayStudyTime,
    getTodayQuestionsCount,
    getWeeklyStats,
    getSubjectProgress,
  }

  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>
}

export function useStudy() {
  const context = useContext(StudyContext)
  if (context === undefined) {
    throw new Error("useStudy must be used within a StudyProvider")
  }
  return context
}
