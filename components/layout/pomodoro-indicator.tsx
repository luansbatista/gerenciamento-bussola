"use client"

import { usePomodoro } from "@/lib/pomodoro-context"
import { Timer, Play, Pause, Square } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"

export default function PomodoroIndicator() {
  const {
    timerState,
    timeLeft,
    formatTime,
    getSessionLabel,
    getSessionColor,
    progress,
    pauseTimer,
    startTimer,
    stopTimer,
  } = usePomodoro()

  // Only show when timer is active
  if (timerState === "idle") {
    return null
  }

  return (
    <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20 animate-fade-in-right">
      <div className="flex items-center space-x-2">
        <Timer className="w-4 h-4 text-white" />
        <Badge className={`bg-gradient-to-r ${getSessionColor()} text-white text-xs px-2 py-1`}>
          {getSessionLabel()}
        </Badge>
      </div>

      <div className="text-white font-mono text-sm font-medium">{formatTime(timeLeft)}</div>

      <div className="w-16">
        <Progress value={progress} className="h-1" />
      </div>

      <div className="flex items-center space-x-1">
        {timerState === "running" && (
          <Button size="sm" variant="ghost" onClick={pauseTimer} className="h-6 w-6 p-0 text-white hover:bg-white/20">
            <Pause className="w-3 h-3" />
          </Button>
        )}

        {timerState === "paused" && (
          <Button size="sm" variant="ghost" onClick={startTimer} className="h-6 w-6 p-0 text-white hover:bg-white/20">
            <Play className="w-3 h-3" />
          </Button>
        )}

        <Button size="sm" variant="ghost" onClick={stopTimer} className="h-6 w-6 p-0 text-white hover:bg-white/20">
          <Square className="w-3 h-3" />
        </Button>

        <Link href="/pomodoro">
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-white hover:bg-white/20">
            <Timer className="w-3 h-3" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
