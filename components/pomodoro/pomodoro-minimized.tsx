"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Play, Pause, Square, Minimize2, Maximize2 } from "lucide-react"
import { usePomodoro } from "@/lib/pomodoro-context"
import { cn } from "@/lib/utils"

export function PomodoroMinimized() {
  const {
    timerState,
    sessionType,
    timeLeft,
    totalFocusTime,
    startTimer,
    pauseTimer,
    stopTimer,
    formatTime,
    getSessionLabel,
    getSessionColor,
    progress,
  } = usePomodoro()

  const [isMinimized, setIsMinimized] = useState(true)

  if (timerState === "idle" && totalFocusTime === 0) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className={cn(
        "shadow-lg border-0 transition-all duration-300",
        isMinimized ? "w-16 h-16" : "w-64",
        timerState === "running" && "animate-pulse"
      )}>
        <CardContent className={cn(
          "p-0 h-full flex items-center justify-center",
          isMinimized ? "p-0" : "p-4"
        )}>
          {isMinimized ? (
            <div className="w-full h-full flex items-center justify-center relative">
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-red-500 to-red-600 opacity-20" />
              <div className="relative z-10">
                {timerState === "running" ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={pauseTimer}
                    className="h-8 w-8 p-0 text-white hover:bg-white/20"
                  >
                    <Pause className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={startTimer}
                    className="h-8 w-8 p-0 text-white hover:bg-white/20"
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsMinimized(false)}
                className="absolute -top-1 -right-1 h-4 w-4 p-0 text-white hover:bg-white/20"
              >
                <Maximize2 className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div className="w-full space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn("w-3 h-3 rounded-full", {
                    "bg-red-500": sessionType === "work",
                    "bg-green-500": sessionType === "shortBreak",
                    "bg-blue-500": sessionType === "longBreak"
                  })} />
                  <span className="text-sm font-medium">{getSessionLabel()}</span>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsMinimized(true)}
                    className="h-6 w-6 p-0"
                  >
                    <Minimize2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold font-mono">
                  {formatTime(timeLeft)}
                </div>
                <div className="text-xs text-gray-500">
                  Total: {Math.floor(totalFocusTime / 60)}h {totalFocusTime % 60}min
                </div>
              </div>

              <Progress value={progress} className="h-2" />

              <div className="flex gap-2">
                {timerState === "running" ? (
                  <Button
                    size="sm"
                    onClick={pauseTimer}
                    className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                  >
                    <Pause className="h-3 w-3 mr-1" />
                    Pausar
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={startTimer}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Iniciar
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={stopTimer}
                  className="px-2"
                >
                  <Square className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}



