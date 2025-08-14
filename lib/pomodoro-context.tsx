"use client"

import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react"

type TimerState = "idle" | "running" | "paused"
type SessionType = "work" | "shortBreak" | "longBreak"

interface PomodoroSettings {
  workDuration: number
  shortBreakDuration: number
  longBreakDuration: number
  sessionsUntilLongBreak: number
}

interface PomodoroContextType {
  timerState: TimerState
  sessionType: SessionType
  timeLeft: number
  selectedSubject: string
  sessionsCompleted: number
  totalFocusTime: number
  settings: PomodoroSettings
  startTimer: () => void
  pauseTimer: () => void
  stopTimer: () => void
  setSelectedSubject: (subject: string) => void
  updateSettings: (newSettings: PomodoroSettings) => void
  formatTime: (seconds: number) => string
  getCurrentDuration: () => number
  getSessionLabel: () => string
  getSessionColor: () => string
  progress: number
}

const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined)

const defaultSettings: PomodoroSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsUntilLongBreak: 4,
}

export function PomodoroProvider({ children }: { children: ReactNode }) {
  const [timerState, setTimerState] = useState<TimerState>("idle")
  const [sessionType, setSessionType] = useState<SessionType>("work")
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [selectedSubject, setSelectedSubject] = useState("")
  const [sessionsCompleted, setSessionsCompleted] = useState(0)
  const [totalFocusTime, setTotalFocusTime] = useState(0)
  const [settings, setSettings] = useState<PomodoroSettings>(defaultSettings)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem("pomodoro-state")
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState)
        setTimerState(parsed.timerState || "idle")
        setSessionType(parsed.sessionType || "work")
        setTimeLeft(parsed.timeLeft || 25 * 60)
        setSelectedSubject(parsed.selectedSubject || "")
        setSessionsCompleted(parsed.sessionsCompleted || 0)
        setTotalFocusTime(parsed.totalFocusTime || 0)
        setSettings(parsed.settings || defaultSettings)
      } catch (error) {
        console.error("Error loading Pomodoro state:", error)
      }
    }
  }, [])

  // Save state to localStorage whenever it changes
  useEffect(() => {
    const state = {
      timerState,
      sessionType,
      timeLeft,
      selectedSubject,
      sessionsCompleted,
      totalFocusTime,
      settings,
    }
    localStorage.setItem("pomodoro-state", JSON.stringify(state))
  }, [timerState, sessionType, timeLeft, selectedSubject, sessionsCompleted, totalFocusTime, settings])

  const getCurrentDuration = () => {
    switch (sessionType) {
      case "work":
        return settings.workDuration * 60
      case "shortBreak":
        return settings.shortBreakDuration * 60
      case "longBreak":
        return settings.longBreakDuration * 60
      default:
        return settings.workDuration * 60
    }
  }

  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = 800
      oscillator.type = "sine"

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    } catch (error) {
      console.error("Error playing notification sound:", error)
    }
  }

  const completeSession = () => {
    playNotificationSound()

    if (sessionType === "work") {
      setSessionsCompleted((prev) => prev + 1)
      setTotalFocusTime((prev) => prev + settings.workDuration)

      // Determine next session type
      const nextSessionsCompleted = sessionsCompleted + 1
      if (nextSessionsCompleted % settings.sessionsUntilLongBreak === 0) {
        setSessionType("longBreak")
      } else {
        setSessionType("shortBreak")
      }
    } else {
      setSessionType("work")
    }

    setTimerState("idle")
    setTimeLeft(getCurrentDuration())
  }

  const startTimer = () => {
    if (timerState === "idle") {
      setTimeLeft(getCurrentDuration())
    }
    setTimerState("running")
  }

  const pauseTimer = () => {
    setTimerState("paused")
  }

  const stopTimer = () => {
    setTimerState("idle")
    setTimeLeft(getCurrentDuration())
  }

  const updateSettings = (newSettings: PomodoroSettings) => {
    setSettings(newSettings)
    if (timerState === "idle") {
      setTimeLeft(getCurrentDuration())
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getSessionColor = () => {
    switch (sessionType) {
      case "work":
        return "from-red-500 to-red-600"
      case "shortBreak":
        return "from-green-500 to-green-600"
      case "longBreak":
        return "from-blue-500 to-blue-600"
      default:
        return "from-red-500 to-red-600"
    }
  }

  const getSessionLabel = () => {
    switch (sessionType) {
      case "work":
        return "Foco"
      case "shortBreak":
        return "Pausa Curta"
      case "longBreak":
        return "Pausa Longa"
      default:
        return "Foco"
    }
  }

  const progress = ((getCurrentDuration() - timeLeft) / getCurrentDuration()) * 100

  // Timer effect
  useEffect(() => {
    if (timerState === "running") {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            completeSession()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [timerState, sessionType, settings, sessionsCompleted])

  // Update timeLeft when session type or settings change (only when idle)
  useEffect(() => {
    if (timerState === "idle") {
      setTimeLeft(getCurrentDuration())
    }
  }, [sessionType, settings])

  const value: PomodoroContextType = {
    timerState,
    sessionType,
    timeLeft,
    selectedSubject,
    sessionsCompleted,
    totalFocusTime,
    settings,
    startTimer,
    pauseTimer,
    stopTimer,
    setSelectedSubject,
    updateSettings,
    formatTime,
    getCurrentDuration,
    getSessionLabel,
    getSessionColor,
    progress,
  }

  return <PomodoroContext.Provider value={value}>{children}</PomodoroContext.Provider>
}

export function usePomodoro() {
  const context = useContext(PomodoroContext)
  if (context === undefined) {
    throw new Error("usePomodoro must be used within a PomodoroProvider")
  }
  return context
}
