"use client"

import { useEffect } from "react"
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Toast {
  id: string
  title: string
  description?: string
  type: "success" | "error" | "warning" | "info"
  duration?: number
}

interface ToastProps {
  toast: Toast
  onRemove: (id: string) => void
}

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
}

const styles = {
  success: "bg-green-50 border-green-200 text-green-800",
  error: "bg-red-50 border-red-200 text-red-800",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
}

export function Toast({ toast, onRemove }: ToastProps) {
  const Icon = icons[toast.type]

  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id)
    }, toast.duration || 5000)

    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, onRemove])

  return (
    <div className={cn("flex items-start gap-3 p-4 rounded-lg border shadow-lg animate-slide-in", styles[toast.type])}>
      <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <h4 className="font-semibold">{toast.title}</h4>
        {toast.description && <p className="text-sm opacity-90 mt-1">{toast.description}</p>}
      </div>
      <button onClick={() => onRemove(toast.id)} className="text-gray-400 hover:text-gray-600 transition-colors">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
