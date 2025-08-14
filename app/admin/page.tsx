"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useAdmin } from "@/lib/admin-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, Users, Database, Settings, BarChart3, RefreshCw } from "lucide-react"
import { redirect } from "next/navigation"
import { UsersManagement } from "@/components/admin/users-management"
import { QuestionsManagement } from "@/components/admin/questions-management"
import { ImportQuestions } from "@/components/admin/import-questions"
import { Reports } from "@/components/admin/reports"
import { SystemSettings } from "@/components/admin/system-settings"

export default function AdminPage() {
  const { user, isAdmin, isLoading } = useAuth()
  const { stats, isLoadingStats, refreshAllData } = useAdmin()
  const [activeTab, setActiveTab] = useState("overview")

  // Redirect if not admin
  if (!isLoading && !isAdmin) {
    redirect("/")
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Painel Administrativo</h1>
              <p className="text-gray-600 mt-2">Gerencie o sistema Bússola da Aprovação</p>
            </div>
            <Badge className="text-lg font-bold px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white">
              ADMIN
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={refreshAllData}
              disabled={isLoadingStats}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoadingStats ? 'animate-spin' : ''}`} />
              <span>Atualizar</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="questions" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Questões
          </TabsTrigger>
          <TabsTrigger value="import" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Importar
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Relatórios
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurações
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoadingStats ? "..." : stats?.totalUsers || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Usuários registrados no sistema
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Questões</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoadingStats ? "..." : stats?.totalQuestions || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Questões no banco de dados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoadingStats ? "..." : stats?.activeUsers || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Últimos 7 dias
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Acerto</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoadingStats ? "..." : `${stats?.averageAccuracy || 0}%`}
                </div>
                <p className="text-xs text-muted-foreground">
                  Média geral do sistema
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Atividade Recente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Questões respondidas hoje</span>
                    <Badge variant="secondary">
                      {isLoadingStats ? "..." : stats?.questionsAnswered || 0}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Sessões de estudo</span>
                    <Badge variant="secondary">
                      {isLoadingStats ? "..." : stats?.totalStudySessions || 0}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Exames realizados</span>
                    <Badge variant="secondary">
                      {isLoadingStats ? "..." : stats?.totalExams || 0}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setActiveTab("users")}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Gerenciar Usuários
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setActiveTab("questions")}
                  >
                    <Database className="h-4 w-4 mr-2" />
                    Gerenciar Questões
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setActiveTab("import")}
                  >
                    <Database className="h-4 w-4 mr-2" />
                    Importar Questões
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setActiveTab("reports")}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Ver Relatórios
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <UsersManagement />
        </TabsContent>

        {/* Questions Tab */}
        <TabsContent value="questions">
          <QuestionsManagement />
        </TabsContent>

        {/* Import Tab */}
        <TabsContent value="import">
          <ImportQuestions />
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports">
          <Reports />
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <SystemSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}
