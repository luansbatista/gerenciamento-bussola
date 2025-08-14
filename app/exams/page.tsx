"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PlayCircle, Clock, FileText, Trophy, Plus } from "lucide-react"
import { ExamSetup } from "@/components/exams/exam-setup"
import { ExamHistory } from "@/components/exams/exam-history"
import { ExamStats } from "@/components/exams/exam-stats"
import { useSidebar } from "@/lib/sidebar-context"

export default function ExamsPage() {
  const { isCollapsed } = useSidebar()
  const [showSetup, setShowSetup] = useState(false)

  const recentExams: any[] = []

  return (
    <div className="min-h-screen">
      {/* Header com gradiente */}
      <div className="relative bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-transparent"></div>

        <div className="relative px-8 py-12 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg animate-bounce-subtle">
                <PlayCircle className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">
                  Simulados
                </h1>
                <p className="text-green-100 text-lg mt-2">Teste seus conhecimentos com simulados cronometrados</p>
              </div>
            </div>
            <Button
              onClick={() => setShowSetup(true)}
              className="flex items-center gap-2 px-6 py-3 font-medium bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-all duration-300 hover:scale-105"
            >
              <Plus className="h-4 w-4" />
              Novo Simulado
            </Button>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8">
        <div className="animate-fade-in-up animation-delay-100">
          <ExamStats />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in-up animation-delay-200">
          {/* Quick Start Options */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="shadow-soft border-0 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl font-semibold text-slate-800">
                  <div className="p-2 bg-green-100 rounded-lg animate-pulse-subtle">
                    <PlayCircle className="h-5 w-5 text-green-600" />
                  </div>
                  Simulados Rápidos
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Button
                  variant="outline"
                  className="h-auto p-6 flex flex-col items-start gap-3 hover:shadow-lg hover:scale-105 transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200"
                  onClick={() => setShowSetup(true)}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-lg">Simulado Completo</p>
                      <p className="text-sm text-gray-500">50 questões • 2h30min</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Todas as matérias
                  </Badge>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto p-6 flex flex-col items-start gap-3 hover:shadow-lg hover:scale-105 transition-all duration-300 bg-gradient-to-br from-green-50 to-green-100/50 border-green-200"
                  onClick={() => setShowSetup(true)}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Clock className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-lg">Simulado Rápido</p>
                      <p className="text-sm text-gray-500">20 questões • 1h</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Matérias selecionadas
                  </Badge>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto p-6 flex flex-col items-start gap-3 hover:shadow-lg hover:scale-105 transition-all duration-300 bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200"
                  onClick={() => setShowSetup(true)}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Trophy className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-lg">Simulado Personalizado</p>
                      <p className="text-sm text-gray-500">Configure do seu jeito</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Personalizável
                  </Badge>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto p-6 flex flex-col items-start gap-3 hover:shadow-lg hover:scale-105 transition-all duration-300 bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200"
                  onClick={() => setShowSetup(true)}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-lg">Revisão de Erros</p>
                      <p className="text-sm text-gray-500">Questões que você errou</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Revisão
                  </Badge>
                </Button>
              </CardContent>
            </Card>

            {/* Recent Exams */}
            <Card className="shadow-soft border-0 hover:shadow-lg transition-all duration-300 animate-fade-in-up animation-delay-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl font-semibold text-slate-800">
                  <div className="p-2 bg-purple-100 rounded-lg animate-pulse-subtle">
                    <FileText className="h-5 w-5 text-purple-600" />
                  </div>
                  Simulados Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="p-4 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                    <FileText className="h-10 w-10 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Nenhum simulado realizado</h3>
                  <p className="text-muted-foreground mb-6">Comece sua preparação realizando seu primeiro simulado</p>
                  <Button
                    onClick={() => setShowSetup(true)}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Fazer Primeiro Simulado
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8 animate-fade-in-up animation-delay-400">
            <ExamHistory />
          </div>
        </div>

        {/* Exam Setup Modal */}
        {showSetup && <ExamSetup onClose={() => setShowSetup(false)} />}
      </div>
    </div>
  )
}
