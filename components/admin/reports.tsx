"use client"

import { useState } from "react"
import { useAdmin } from "@/lib/admin-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, Users, Database, TrendingUp, Download, Calendar, Activity } from "lucide-react"

export function Reports() {
  const { stats, generateUserReport, generateQuestionReport, generateSystemReport } = useAdmin()
  const [selectedReport, setSelectedReport] = useState<string>("overview")
  const [reportData, setReportData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleGenerateReport = async (reportType: string) => {
    setIsLoading(true)
    try {
      let result
      switch (reportType) {
        case "users":
          result = await generateUserReport()
          break
        case "questions":
          result = await generateQuestionReport()
          break
        case "system":
          result = await generateSystemReport()
          break
        default:
          return
      }
      
      if (result.success) {
        setReportData(result.data)
      }
    } catch (error) {
      console.error("Erro ao gerar relatório:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const downloadReport = (data: any, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Relatórios</h2>
          <p className="text-gray-600">Visualize relatórios e análises do sistema</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedReport} onValueChange={setSelectedReport}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Selecionar relatório" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Visão Geral</SelectItem>
              <SelectItem value="users">Relatório de Usuários</SelectItem>
              <SelectItem value="questions">Relatório de Questões</SelectItem>
              <SelectItem value="system">Relatório do Sistema</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={() => handleGenerateReport(selectedReport)}
            disabled={isLoading || selectedReport === "overview"}
            className="flex items-center space-x-2"
          >
            <BarChart3 className="h-4 w-4" />
            <span>{isLoading ? "Gerando..." : "Gerar Relatório"}</span>
          </Button>
        </div>
      </div>

      {/* Visão Geral */}
      {selectedReport === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.activeUsers || 0} usuários ativos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Questões Cadastradas</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalQuestions || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.questionsAnswered || 0} tentativas realizadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Precisão Média</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.averageAccuracy || 0}%</div>
              <p className="text-xs text-muted-foreground">
                Baseado em {stats?.questionsAnswered || 0} tentativas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sessões de Estudo</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalStudySessions || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.totalExams || 0} simulados realizados
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Relatório de Usuários */}
      {selectedReport === "users" && reportData && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Relatório de Usuários</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadReport(reportData, 'relatorio-usuarios.json')}
                  className="flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Exportar</span>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Estatísticas Gerais</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total de Usuários:</span>
                      <Badge variant="secondary">{reportData.totalUsers}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Usuários Ativos:</span>
                      <Badge variant="secondary">{reportData.activeUsers}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Novos este mês:</span>
                      <Badge variant="secondary">{reportData.newUsersThisMonth}</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Status dos Usuários</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Ativos:</span>
                      <Badge className="bg-green-100 text-green-800">{reportData.usersByStatus.active}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Inativos:</span>
                      <Badge className="bg-gray-100 text-gray-800">{reportData.usersByStatus.inactive}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Suspensos:</span>
                      <Badge className="bg-red-100 text-red-800">{reportData.usersByStatus.suspended}</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Top 10 Usuários</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {reportData.topUsers.map((user: any, index: number) => (
                      <div key={user.id} className="flex justify-between items-center text-sm">
                        <span className="truncate">{user.name}</span>
                        <Badge variant="outline">{user.total_study_hours}h</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Relatório de Questões */}
      {selectedReport === "questions" && reportData && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Relatório de Questões</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadReport(reportData, 'relatorio-questoes.json')}
                  className="flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Exportar</span>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Estatísticas Gerais</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total de Questões:</span>
                      <Badge variant="secondary">{reportData.totalQuestions}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Precisão Média:</span>
                      <Badge variant="secondary">{reportData.averageAccuracy}%</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Por Dificuldade</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Fácil:</span>
                      <Badge className="bg-green-100 text-green-800">{reportData.questionsByDifficulty.easy}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Médio:</span>
                      <Badge className="bg-yellow-100 text-yellow-800">{reportData.questionsByDifficulty.medium}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Difícil:</span>
                      <Badge className="bg-red-100 text-red-800">{reportData.questionsByDifficulty.hard}</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Por Matéria</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {Object.entries(reportData.questionsBySubject).map(([subject, count]: [string, any]) => (
                      <div key={subject} className="flex justify-between items-center text-sm">
                        <span className="truncate">{subject}</span>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold mb-4">Questões Mais Respondidas</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {reportData.mostAnsweredQuestions.map((question: any, index: number) => (
                    <div key={question.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm line-clamp-1">{question.question}</p>
                        <p className="text-xs text-gray-500">{question.subject}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{question.times_answered} tentativas</Badge>
                        <Badge className="bg-blue-100 text-blue-800">{question.accuracy_rate}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Relatório do Sistema */}
      {selectedReport === "system" && reportData && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Relatório do Sistema</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadReport(reportData, 'relatorio-sistema.json')}
                  className="flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Exportar</span>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Performance do Sistema</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Tempo de Resposta:</span>
                      <Badge variant="secondary">{reportData.performance.averageResponseTime}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Uptime:</span>
                      <Badge className="bg-green-100 text-green-800">{reportData.performance.uptime}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Tamanho do Banco:</span>
                      <Badge variant="secondary">{reportData.performance.databaseSize}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Conexões Ativas:</span>
                      <Badge variant="secondary">{reportData.performance.activeConnections}</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Atividade Recente</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Último Backup:</span>
                      <Badge variant="secondary">
                        {new Date(reportData.recentActivity.lastBackup).toLocaleDateString('pt-BR')}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Última Manutenção:</span>
                      <Badge variant="secondary">
                        {new Date(reportData.recentActivity.lastMaintenance).toLocaleDateString('pt-BR')}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Erros (24h):</span>
                      <Badge className="bg-red-100 text-red-800">{reportData.recentActivity.errorsLast24h}</Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold mb-4">Estatísticas do Sistema</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{reportData.systemStats?.totalUsers || 0}</div>
                    <p className="text-sm text-gray-600">Usuários</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{reportData.systemStats?.totalQuestions || 0}</div>
                    <p className="text-sm text-gray-600">Questões</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{reportData.systemStats?.totalExams || 0}</div>
                    <p className="text-sm text-gray-600">Simulados</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{reportData.systemStats?.totalStudySessions || 0}</div>
                    <p className="text-sm text-gray-600">Sessões</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Estado vazio */}
      {selectedReport !== "overview" && !reportData && !isLoading && (
        <Card>
          <CardContent className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Clique em "Gerar Relatório" para visualizar os dados</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
