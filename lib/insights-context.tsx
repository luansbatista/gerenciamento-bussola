"use client"

import type React from "react"
import { createContext, useContext } from "react"
import { useStudy } from "./study-context"
import { useCoach } from "./coach-context"

interface PersonalizedTip {
  id: string
  title: string
  message: string
  category: "study" | "motivation" | "performance" | "strategy"
  actionable: boolean
}

interface MotivationalMessage {
  title: string
  message: string
  type: "encouragement" | "achievement" | "challenge"
}

interface PerformanceAnalysis {
  type: "positive" | "warning" | "negative"
  title: string
  message: string
  recommendation?: string
}

interface InsightsContextType {
  getPersonalizedTips: () => PersonalizedTip[]
  getMotivationalMessage: () => MotivationalMessage
  getPerformanceAnalysis: () => PerformanceAnalysis[]
}

const InsightsContext = createContext<InsightsContextType | undefined>(undefined)

export function InsightsProvider({ children }: { children: React.ReactNode }) {
  const { getWeeklyStats } = useStudy()
  const { studiedTopics } = useCoach()

  const getPersonalizedTips = (): PersonalizedTip[] => {
    // Usar valores padrão para evitar erros de async
    const weeklyStats = { totalHours: 0, totalQuestions: 0, accuracy: 0 }
    const tips: PersonalizedTip[] = []

    // Study tips based on performance
    if (weeklyStats.accuracy < 70 && weeklyStats.totalQuestions > 0) {
      tips.push({
        id: "accuracy-low",
        title: "Melhore sua Taxa de Acerto",
        message: "Foque em revisar conceitos antes de fazer mais questões. Qualidade é melhor que quantidade.",
        category: "study",
        actionable: true,
      })
    }

    if (weeklyStats.totalHours < 10 && weeklyStats.totalHours > 0) {
      tips.push({
        id: "study-time-low",
        title: "Aumente Gradualmente suas Horas",
        message: "Tente adicionar 30 minutos por dia à sua rotina de estudos para melhor preparação.",
        category: "strategy",
        actionable: true,
      })
    }

    if (studiedTopics.length < 5) {
      tips.push({
        id: "topics-few",
        title: "Diversifique seus Estudos",
        message: "Estude diferentes tópicos para ter uma preparação mais completa e equilibrada.",
        category: "study",
        actionable: true,
      })
    }

    // Motivational tips
    if (weeklyStats.totalQuestions > 50) {
      tips.push({
        id: "questions-high",
        title: "Excelente Dedicação!",
        message: "Você está no caminho certo com essa quantidade de questões. Continue assim!",
        category: "motivation",
        actionable: false,
      })
    }

    // Performance tips
    if (weeklyStats.accuracy > 80) {
      tips.push({
        id: "accuracy-high",
        title: "Performance Excepcional",
        message: "Sua taxa de acerto está excelente. Considere aumentar a dificuldade dos estudos.",
        category: "performance",
        actionable: true,
      })
    }

    // Default tips if no specific conditions are met
    if (tips.length === 0) {
      tips.push(
        {
          id: "start-studying",
          title: "Comece sua Jornada",
          message: "Defina uma meta diária de estudos e comece com os tópicos que mais caem no concurso.",
          category: "strategy",
          actionable: true,
        },
        {
          id: "consistency",
          title: "Consistência é a Chave",
          message: "Estudar um pouco todos os dias é mais eficaz que estudar muito em poucos dias.",
          category: "motivation",
          actionable: false,
        },
      )
    }

    return tips
  }

  const getMotivationalMessage = (): MotivationalMessage => {
    // Usar valores padrão para evitar erros de async
    const weeklyStats = { totalHours: 0, totalQuestions: 0, accuracy: 0 }

    if (weeklyStats.totalQuestions === 0 && studiedTopics.length === 0) {
      return {
        title: "Sua Jornada Começa Agora!",
        message: "Cada grande conquista começa com a decisão de tentar. Você já deu o primeiro passo ao estar aqui!",
        type: "encouragement",
      }
    }

    if (weeklyStats.accuracy > 80 && weeklyStats.totalQuestions > 20) {
      return {
        title: "Você Está Brilhando!",
        message: "Sua dedicação e performance estão excepcionais. Continue assim e a aprovação será sua!",
        type: "achievement",
      }
    }

    if (studiedTopics.length > 10) {
      return {
        title: "Conhecimento em Construção!",
        message: "Cada tópico estudado é um tijolo na construção do seu sucesso. Você está edificando algo grandioso!",
        type: "achievement",
      }
    }

    if (weeklyStats.totalHours > 15) {
      return {
        title: "Disciplina Admirável!",
        message: "Sua dedicação semanal mostra o quanto você quer essa aprovação. O esforço sempre compensa!",
        type: "achievement",
      }
    }

    return {
      title: "Foco no Objetivo!",
      message: "Lembre-se: você não está apenas estudando, está construindo seu futuro. Cada minuto conta!",
      type: "challenge",
    }
  }

  const getPerformanceAnalysis = (): PerformanceAnalysis[] => {
    // Usar valores padrão para evitar erros de async
    const weeklyStats = { totalHours: 0, totalQuestions: 0, accuracy: 0 }
    const analysis: PerformanceAnalysis[] = []

    // Accuracy analysis
    if (weeklyStats.accuracy >= 80) {
      analysis.push({
        type: "positive",
        title: "Taxa de Acerto Excelente",
        message: `Sua taxa de acerto de ${weeklyStats.accuracy.toFixed(1)}% está acima da média esperada.`,
        recommendation: "Continue mantendo esse nível e considere aumentar a dificuldade.",
      })
    } else if (weeklyStats.accuracy >= 60) {
      analysis.push({
        type: "warning",
        title: "Taxa de Acerto Moderada",
        message: `Sua taxa de acerto de ${weeklyStats.accuracy.toFixed(1)}% pode ser melhorada.`,
        recommendation: "Foque em revisar os conceitos antes de fazer mais questões.",
      })
    } else if (weeklyStats.totalQuestions > 0) {
      analysis.push({
        type: "negative",
        title: "Taxa de Acerto Baixa",
        message: `Sua taxa de acerto de ${weeklyStats.accuracy.toFixed(1)}% precisa de atenção.`,
        recommendation: "Revise a teoria antes de continuar com as questões.",
      })
    }

    // Study time analysis
    if (weeklyStats.totalHours >= 20) {
      analysis.push({
        type: "positive",
        title: "Dedicação Excepcional",
        message: `${weeklyStats.totalHours.toFixed(1)} horas de estudo esta semana demonstram grande comprometimento.`,
      })
    } else if (weeklyStats.totalHours >= 10) {
      analysis.push({
        type: "positive",
        title: "Boa Dedicação",
        message: `${weeklyStats.totalHours.toFixed(1)} horas de estudo esta semana estão no caminho certo.`,
        recommendation: "Tente aumentar gradualmente para 15-20 horas semanais.",
      })
    } else if (weeklyStats.totalHours > 0) {
      analysis.push({
        type: "warning",
        title: "Tempo de Estudo Limitado",
        message: `${weeklyStats.totalHours.toFixed(1)} horas esta semana podem não ser suficientes.`,
        recommendation: "Tente organizar sua rotina para dedicar mais tempo aos estudos.",
      })
    }

    // Questions analysis
    if (weeklyStats.totalQuestions >= 100) {
      analysis.push({
        type: "positive",
        title: "Prática Intensa",
        message: `${weeklyStats.totalQuestions} questões esta semana mostram dedicação à prática.`,
      })
    } else if (weeklyStats.totalQuestions >= 50) {
      analysis.push({
        type: "positive",
        title: "Boa Prática",
        message: `${weeklyStats.totalQuestions} questões esta semana é um bom volume de prática.`,
        recommendation: "Continue mantendo esse ritmo ou aumente gradualmente.",
      })
    } else if (weeklyStats.totalQuestions > 0) {
      analysis.push({
        type: "warning",
        title: "Poucas Questões",
        message: `${weeklyStats.totalQuestions} questões esta semana podem ser insuficientes.`,
        recommendation: "Tente resolver pelo menos 10-15 questões por dia.",
      })
    }

    // Topics analysis
    if (studiedTopics.length >= 15) {
      analysis.push({
        type: "positive",
        title: "Cobertura Ampla",
        message: `${studiedTopics.length} tópicos estudados mostram boa diversificação.`,
      })
    } else if (studiedTopics.length >= 5) {
      analysis.push({
        type: "positive",
        title: "Progresso Consistente",
        message: `${studiedTopics.length} tópicos estudados demonstram progresso.`,
        recommendation: "Continue explorando novos tópicos para ampliar seu conhecimento.",
      })
    } else if (studiedTopics.length > 0) {
      analysis.push({
        type: "warning",
        title: "Poucos Tópicos Estudados",
        message: `${studiedTopics.length} tópicos podem não cobrir todo o conteúdo necessário.`,
        recommendation: "Diversifique seus estudos explorando mais tópicos.",
      })
    }

    // Default analysis if no data
    if (analysis.length === 0) {
      analysis.push({
        type: "warning",
        title: "Dados Insuficientes",
        message: "Comece a estudar para receber uma análise detalhada de sua performance.",
        recommendation: "Inicie com os tópicos que mais caem no concurso.",
      })
    }

    return analysis
  }

  return (
    <InsightsContext.Provider
      value={{
        getPersonalizedTips,
        getMotivationalMessage,
        getPerformanceAnalysis,
      }}
    >
      {children}
    </InsightsContext.Provider>
  )
}

export function useInsights() {
  const context = useContext(InsightsContext)
  if (context === undefined) {
    throw new Error("useInsights must be used within an InsightsProvider")
  }
  return context
}
