export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          avatar_url: string | null
          study_goal: number
          current_streak: number
          total_study_hours: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          avatar_url?: string | null
          study_goal?: number
          current_streak?: number
          total_study_hours?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          avatar_url?: string | null
          study_goal?: number
          current_streak?: number
          total_study_hours?: number
          created_at?: string
          updated_at?: string
        }
      }
      subjects: {
        Row: {
          id: string
          name: string
          color: string
          total_questions: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          color: string
          total_questions?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          color?: string
          total_questions?: number
          created_at?: string
        }
      }
      questions: {
        Row: {
          id: string
          subject_id: string
          question: string
          options: Json
          correct_answer: number
          explanation: string | null
          difficulty: "easy" | "medium" | "hard"
          year: number | null
          institution: string
          created_at: string
        }
        Insert: {
          id?: string
          subject_id: string
          question: string
          options: Json
          correct_answer: number
          explanation?: string | null
          difficulty: "easy" | "medium" | "hard"
          year?: number | null
          institution?: string
          created_at?: string
        }
        Update: {
          id?: string
          subject_id?: string
          question?: string
          options?: Json
          correct_answer?: number
          explanation?: string | null
          difficulty?: "easy" | "medium" | "hard"
          year?: number | null
          institution?: string
          created_at?: string
        }
      }
      flashcards: {
        Row: {
          id: string
          user_id: string
          subject_id: string
          front: string
          back: string
          difficulty: number
          next_review: string
          review_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subject_id: string
          front: string
          back: string
          difficulty?: number
          next_review?: string
          review_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subject_id?: string
          front?: string
          back?: string
          difficulty?: number
          next_review?: string
          review_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      study_goals: {
        Row: {
          id: string
          user_id: string
          type: "daily" | "weekly" | "monthly"
          target: number
          current_progress: number
          description: string | null
          deadline: string | null
          completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: "daily" | "weekly" | "monthly"
          target: number
          current_progress?: number
          description?: string | null
          deadline?: string | null
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: "daily" | "weekly" | "monthly"
          target?: number
          current_progress?: number
          description?: string | null
          deadline?: string | null
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      question_attempts: {
        Row: {
          id: string
          user_id: string
          question_id: string
          selected_answer: number
          is_correct: boolean
          time_spent: number | null
          attempted_at: string
        }
        Insert: {
          id?: string
          user_id: string
          question_id: string
          selected_answer: number
          is_correct: boolean
          time_spent?: number | null
          attempted_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          question_id?: string
          selected_answer?: number
          is_correct?: boolean
          time_spent?: number | null
          attempted_at?: string
        }
      }
      exams: {
        Row: {
          id: string
          user_id: string
          title: string
          total_questions: number
          time_limit: number | null
          score: number | null
          total_time: number | null
          completed: boolean
          started_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          total_questions: number
          time_limit?: number | null
          score?: number | null
          total_time?: number | null
          completed?: boolean
          started_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          total_questions?: number
          time_limit?: number | null
          score?: number | null
          total_time?: number | null
          completed?: boolean
          started_at?: string
          completed_at?: string | null
        }
      }
      exam_questions: {
        Row: {
          id: string
          exam_id: string
          question_id: string
          selected_answer: number | null
          is_correct: boolean | null
          question_order: number
        }
        Insert: {
          id?: string
          exam_id: string
          question_id: string
          selected_answer?: number | null
          is_correct?: boolean | null
          question_order: number
        }
        Update: {
          id?: string
          exam_id?: string
          question_id?: string
          selected_answer?: number | null
          is_correct?: boolean | null
          question_order?: number
        }
      }
      pomodoro_sessions: {
        Row: {
          id: string
          user_id: string
          subject_id: string | null
          session_type: "study" | "break" | "long_break"
          duration: number
          completed: boolean
          started_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          subject_id?: string | null
          session_type: "study" | "break" | "long_break"
          duration: number
          completed?: boolean
          started_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          subject_id?: string | null
          session_type?: "study" | "break" | "long_break"
          duration?: number
          completed?: boolean
          started_at?: string
          completed_at?: string | null
        }
      }
      study_sessions: {
        Row: {
          id: string
          user_id: string
          subject_id: string | null
          duration: number
          activity_type: string
          questions_answered: number
          correct_answers: number
          started_at: string
          ended_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subject_id?: string | null
          duration: number
          activity_type: string
          questions_answered?: number
          correct_answers?: number
          started_at?: string
          ended_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subject_id?: string | null
          duration?: number
          activity_type?: string
          questions_answered?: number
          correct_answers?: number
          started_at?: string
          ended_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      difficulty_level: "easy" | "medium" | "hard"
      goal_type: "daily" | "weekly" | "monthly"
      session_type: "study" | "break" | "long_break"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
