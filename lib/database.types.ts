export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          study_goal: number
          current_streak: number
          total_study_hours: number
          total_questions_answered: number
          accuracy_rate: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          study_goal?: number
          current_streak?: number
          total_study_hours?: number
          total_questions_answered?: number
          accuracy_rate?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          study_goal?: number
          current_streak?: number
          total_study_hours?: number
          total_questions_answered?: number
          accuracy_rate?: number
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
          color?: string
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
          disciplina: string | null
          subject: string | null
          assunto: string | null
          question: string | null
          enunciado: string | null
          opcao_a: string | null
          opcao_b: string | null
          opcao_c: string | null
          opcao_d: string | null
          alternativa_correta: string | null
          correct_answer: string | null
          difficulty: string
          nivel: string
          times_answered: number
          accuracy_rate: number
          created_at: string
        }
        Insert: {
          id?: string
          disciplina?: string | null
          subject?: string | null
          assunto?: string | null
          question?: string | null
          enunciado?: string | null
          opcao_a?: string | null
          opcao_b?: string | null
          opcao_c?: string | null
          opcao_d?: string | null
          alternativa_correta?: string | null
          correct_answer?: string | null
          difficulty?: string
          nivel?: string
          times_answered?: number
          accuracy_rate?: number
          created_at?: string
        }
        Update: {
          id?: string
          disciplina?: string | null
          subject?: string | null
          assunto?: string | null
          question?: string | null
          enunciado?: string | null
          opcao_a?: string | null
          opcao_b?: string | null
          opcao_c?: string | null
          opcao_d?: string | null
          alternativa_correta?: string | null
          correct_answer?: string | null
          difficulty?: string
          nivel?: string
          times_answered?: number
          accuracy_rate?: number
          created_at?: string
        }
      }
      question_attempts: {
        Row: {
          id: string
          user_id: string
          question_id: string
          selected_answer: string | null
          is_correct: boolean
          time_spent: number
          attempted_at: string
        }
        Insert: {
          id?: string
          user_id: string
          question_id: string
          selected_answer?: string | null
          is_correct: boolean
          time_spent?: number
          attempted_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          question_id?: string
          selected_answer?: string | null
          is_correct?: boolean
          time_spent?: number
          attempted_at?: string
        }
      }
      study_sessions: {
        Row: {
          id: string
          user_id: string
          subject_id: string | null
          start_time: string
          end_time: string | null
          duration_minutes: number
          activity_type: string
          questions_answered: number
          correct_answers: number
        }
        Insert: {
          id?: string
          user_id: string
          subject_id?: string | null
          start_time?: string
          end_time?: string | null
          duration_minutes?: number
          activity_type?: string
          questions_answered?: number
          correct_answers?: number
        }
        Update: {
          id?: string
          user_id?: string
          subject_id?: string | null
          start_time?: string
          end_time?: string | null
          duration_minutes?: number
          activity_type?: string
          questions_answered?: number
          correct_answers?: number
        }
      }
      assuntos_edital: {
        Row: {
          id: string
          disciplina: string
          assunto: string
          created_at: string
        }
        Insert: {
          id?: string
          disciplina: string
          assunto: string
          created_at?: string
        }
        Update: {
          id?: string
          disciplina?: string
          assunto?: string
          created_at?: string
        }
      }
      materials: {
        Row: {
          id: string
          title: string
          description: string | null
          subject: string | null
          file_url: string | null
          file_type: string | null
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          subject?: string | null
          file_url?: string | null
          file_type?: string | null
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          subject?: string | null
          file_url?: string | null
          file_type?: string | null
          created_by?: string
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          user_id: string
          subject: string
          topic: string
          difficulty: string
          review_level: number
          interval: number
          next_review_date: string
          last_review_result: string | null
          review_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subject: string
          topic: string
          difficulty?: string
          review_level?: number
          interval?: number
          next_review_date?: string
          last_review_result?: string | null
          review_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subject?: string
          topic?: string
          difficulty?: string
          review_level?: number
          interval?: number
          next_review_date?: string
          last_review_result?: string | null
          review_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      study_goals: {
        Row: {
          id: string
          user_id: string
          type: string
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
          type: string
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
          type?: string
          target?: number
          current_progress?: number
          description?: string | null
          deadline?: string | null
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      pomodoro_sessions: {
        Row: {
          id: string
          user_id: string
          subject_id: string | null
          session_type: string
          duration: number
          completed: boolean
          started_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          subject_id?: string | null
          session_type: string
          duration: number
          completed?: boolean
          started_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          subject_id?: string | null
          session_type?: string
          duration?: number
          completed?: boolean
          started_at?: string
          completed_at?: string | null
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
          selected_answer: string | null
          is_correct: boolean | null
          question_order: number
        }
        Insert: {
          id?: string
          exam_id: string
          question_id: string
          selected_answer?: string | null
          is_correct?: boolean | null
          question_order: number
        }
        Update: {
          id?: string
          exam_id?: string
          question_id?: string
          selected_answer?: string | null
          is_correct?: boolean | null
          question_order?: number
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
