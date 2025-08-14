"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Play, Pause, Square, RotateCcw } from "lucide-react"

interface PomodoroTimerProps {
  workDuration: number
  breakDuration: number
  onSessionComplete: (type: "work" | "break", duration: number) => void
}

export function PomodoroTimer({ workDuration, breakDuration, onSessionComplete }: PomodoroTimerProps) {
  const [timeLeft, setTimeLeft] = useState(workDuration * 60)
  const [isActive, setIsActive] = useState(false)
  const [isWork, setIsWork] = useState(true)
  const [totalTime, setTotalTime] = useState(workDuration * 60)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      // Session completed
      onSessionComplete(isWork ? "work" : "break", isWork ? workDuration : breakDuration)

      // Switch to break or work
      const nextIsWork = !isWork
      const nextDuration = nextIsWork ? workDuration : breakDuration

      setIsWork(nextIsWork)
      setTimeLeft(nextDuration * 60)
      setTotalTime(nextDuration * 60)
      setIsActive(false)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, timeLeft, isWork, workDuration, breakDuration, onSessionComplete])

  const toggleTimer = () => {
    setIsActive(!isActive)
  }

  const resetTimer = () => {
    setIsActive(false)
    const duration = isWork ? workDuration : breakDuration
    setTimeLeft(duration * 60)
    setTotalTime(duration * 60)
  }

  const stopTimer = () => {
    setIsActive(false)
    setIsWork(true)
    setTimeLeft(workDuration * 60)
    setTotalTime(workDuration * 60)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const progress = ((totalTime - timeLeft) / totalTime) * 100

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className={`text-2xl ${isWork ? "text-red-600" : "text-green-600"}`}>
          {isWork ? "Tempo de Estudo" : "Tempo de Pausa"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Timer Display */}
        <div className="text-center">
          <div className={`text-6xl font-mono font-bold ${isWork ? "text-red-600" : "text-green-600"}`}>
            {formatTime(timeLeft)}
          </div>
          <Progress value={progress} className={`mt-4 h-2 ${isWork ? "[&>div]:bg-red-500" : "[&>div]:bg-green-500"}`} />
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-3">
          <Button
            onClick={toggleTimer}
            size="lg"
            className={isWork ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"}
          >
            {isActive ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </Button>
          <Button onClick={resetTimer} variant="outline" size="lg">
            <RotateCcw className="h-5 w-5" />
          </Button>
          <Button onClick={stopTimer} variant="outline" size="lg">
            <Square className="h-5 w-5" />
          </Button>
        </div>

        {/* Status */}
        <div className="text-center text-sm text-gray-600">{isActive ? "Em andamento..." : "Pausado"}</div>
      </CardContent>
    </Card>
  )
}
