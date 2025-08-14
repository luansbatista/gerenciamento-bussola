// Tipos principais do sistema de estudos PMBA

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  createdAt: Date
  studyGoal: number // horas por dia
  currentStreak: number
  totalStudyHours: number
  role?: "student" | "admin" // Adicionando campo role para controle de acesso
  isAdmin?: boolean // Campo para verificar se é administrador
}

export interface Subject {
  id: string
  name: string
  color: string
  totalQuestions: number
}

export interface Question {
  id: string
  subjectId: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  difficulty: "easy" | "medium" | "hard"
  year?: number
  institution?: string
}

export interface StudySession {
  id: string
  userId: string
  subjectId: string
  startTime: Date
  endTime?: Date
  questionsAnswered: number
  correctAnswers: number
  type: "practice" | "exam" | "review"
}

export interface Flashcard {
  id: string
  subjectId: string
  front: string
  back: string
  difficulty: number // 1-5
  nextReview: Date
  reviewCount: number
}

export interface PomodoroSession {
  id: string
  userId: string
  duration: number // em minutos
  type: "study" | "break"
  completed: boolean
  startTime: Date
  endTime?: Date
}

export interface StudyGoal {
  id: string
  userId: string
  type: "daily" | "weekly" | "monthly"
  target: number
  current: number
  description: string
  deadline: Date
}

export interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  createdAt: Date
  read: boolean
  userId?: string // Para notificações específicas de usuário
}
