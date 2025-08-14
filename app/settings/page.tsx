"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Settings,
  User,
  Bell,
  Shield,
  Database,
  Palette,
  Globe,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
} from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/lib/auth-context"

export default function SettingsPage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: false,
      studyReminders: true,
      examReminders: true,
      weeklyReports: true,
    },
    study: {
      defaultSessionDuration: 50,
      defaultBreakDuration: 15,
      autoStartBreaks: true,
      autoStartSessions: false,
    },
    appearance: {
      theme: "system",
      compactMode: false,
      showAnimations: true,
    },
    privacy: {
      shareProgress: false,
      showInRanking: true,
      allowAnalytics: true,
    },
  })

  const handleSave = async () => {
    setIsLoading(true)
    // Simular salvamento
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
  }

  const handleReset = () => {
    setSettings({
      notifications: {
        email: true,
        push: false,
        studyReminders: true,
        examReminders: true,
        weeklyReports: true,
      },
      study: {
        defaultSessionDuration: 50,
        defaultBreakDuration: 15,
        autoStartBreaks: true,
        autoStartSessions: false,
      },
      appearance: {
        theme: "system",
        compactMode: false,
        showAnimations: true,
      },
      privacy: {
        shareProgress: false,
        showInRanking: true,
        allowAnalytics: true,
      },
    })
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-slate-600 via-blue-600 to-indigo-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative px-8 py-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg">
              <Settings className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                Configurações
              </h1>
              <p className="text-blue-100 text-lg mt-2">
                Personalize sua experiência de estudo e gerencie suas preferências
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-8 space-y-8">
        {/* User Info */}
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10">
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Informações do Usuário
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome</Label>
                  <Input id="name" defaultValue={user.name || "Usuário"} />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" defaultValue={user.email} disabled />
                </div>
                <div>
                  <Label htmlFor="studyGoal">Meta de Estudo Diária (horas)</Label>
                  <Input id="studyGoal" type="number" defaultValue={user.studyGoal || 4} min="1" max="12" />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label>Status da Conta</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={user.isAdmin ? "default" : "secondary"}>
                      {user.isAdmin ? "Administrador" : "Estudante"}
                    </Badge>
                    <Badge variant="outline">
                      Membro desde {user.createdAt?.toLocaleDateString("pt-BR")}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label>Estatísticas</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{user.currentStreak || 0}</div>
                      <div className="text-sm text-blue-600">Dias seguidos</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{user.totalStudyHours || 0}h</div>
                      <div className="text-sm text-green-600">Total estudado</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-green-500/10 to-emerald-500/10">
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-green-600" />
              Notificações
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Notificações por Email</Label>
                      <p className="text-sm text-gray-600">Receber lembretes e relatórios por email</p>
                    </div>
                    <Switch
                      checked={settings.notifications.email}
                      onCheckedChange={(checked) =>
                        setSettings(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, email: checked }
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Notificações Push</Label>
                      <p className="text-sm text-gray-600">Receber notificações no navegador</p>
                    </div>
                    <Switch
                      checked={settings.notifications.push}
                      onCheckedChange={(checked) =>
                        setSettings(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, push: checked }
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Lembretes de Estudo</Label>
                      <p className="text-sm text-gray-600">Lembretes para iniciar sessões de estudo</p>
                    </div>
                    <Switch
                      checked={settings.notifications.studyReminders}
                      onCheckedChange={(checked) =>
                        setSettings(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, studyReminders: checked }
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Relatórios Semanais</Label>
                      <p className="text-sm text-gray-600">Receber resumo semanal do progresso</p>
                    </div>
                    <Switch
                      checked={settings.notifications.weeklyReports}
                      onCheckedChange={(checked) =>
                        setSettings(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, weeklyReports: checked }
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Study Preferences */}
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-purple-500/10 to-pink-500/10">
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-purple-600" />
              Preferências de Estudo
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="sessionDuration">Duração da Sessão (minutos)</Label>
                  <Select
                    value={settings.study.defaultSessionDuration.toString()}
                    onValueChange={(value) =>
                      setSettings(prev => ({
                        ...prev,
                        study: { ...prev.study, defaultSessionDuration: parseInt(value) }
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="25">25 minutos</SelectItem>
                      <SelectItem value="30">30 minutos</SelectItem>
                      <SelectItem value="45">45 minutos</SelectItem>
                      <SelectItem value="50">50 minutos</SelectItem>
                      <SelectItem value="60">60 minutos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="breakDuration">Duração da Pausa (minutos)</Label>
                  <Select
                    value={settings.study.defaultBreakDuration.toString()}
                    onValueChange={(value) =>
                      setSettings(prev => ({
                        ...prev,
                        study: { ...prev.study, defaultBreakDuration: parseInt(value) }
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 minutos</SelectItem>
                      <SelectItem value="10">10 minutos</SelectItem>
                      <SelectItem value="15">15 minutos</SelectItem>
                      <SelectItem value="20">20 minutos</SelectItem>
                      <SelectItem value="30">30 minutos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Iniciar Pausas Automaticamente</Label>
                    <p className="text-sm text-gray-600">Iniciar pausas após sessões de estudo</p>
                  </div>
                  <Switch
                    checked={settings.study.autoStartBreaks}
                    onCheckedChange={(checked) =>
                      setSettings(prev => ({
                        ...prev,
                        study: { ...prev.study, autoStartBreaks: checked }
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Modo Compacto</Label>
                    <p className="text-sm text-gray-600">Interface mais compacta para estudo</p>
                  </div>
                  <Switch
                    checked={settings.appearance.compactMode}
                    onCheckedChange={(checked) =>
                      setSettings(prev => ({
                        ...prev,
                        appearance: { ...prev.appearance, compactMode: checked }
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-red-500/10 to-orange-500/10">
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-600" />
              Privacidade e Segurança
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Compartilhar Progresso</Label>
                      <p className="text-sm text-gray-600">Permitir que outros vejam seu progresso</p>
                    </div>
                    <Switch
                      checked={settings.privacy.shareProgress}
                      onCheckedChange={(checked) =>
                        setSettings(prev => ({
                          ...prev,
                          privacy: { ...prev.privacy, shareProgress: checked }
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Aparecer no Ranking</Label>
                      <p className="text-sm text-gray-600">Incluir seu nome no ranking de estudantes</p>
                    </div>
                    <Switch
                      checked={settings.privacy.showInRanking}
                      onCheckedChange={(checked) =>
                        setSettings(prev => ({
                          ...prev,
                          privacy: { ...prev.privacy, showInRanking: checked }
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Analytics</Label>
                      <p className="text-sm text-gray-600">Permitir coleta de dados para melhorias</p>
                    </div>
                    <Switch
                      checked={settings.privacy.allowAnalytics}
                      onCheckedChange={(checked) =>
                        setSettings(prev => ({
                          ...prev,
                          privacy: { ...prev.privacy, allowAnalytics: checked }
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Animações</Label>
                      <p className="text-sm text-gray-600">Mostrar animações na interface</p>
                    </div>
                    <Switch
                      checked={settings.appearance.showAnimations}
                      onCheckedChange={(checked) =>
                        setSettings(prev => ({
                          ...prev,
                          appearance: { ...prev.appearance, showAnimations: checked }
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Info */}
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-gray-500/10 to-slate-500/10">
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-gray-600" />
              Informações do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">v1.0.0</div>
                <div className="text-sm text-blue-600">Versão do Sistema</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  <CheckCircle className="w-6 h-6 mx-auto" />
                </div>
                <div className="text-sm text-green-600">Sistema Operacional</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  <Globe className="w-6 h-6 mx-auto" />
                </div>
                <div className="text-sm text-purple-600">Conectado</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={handleReset} className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Restaurar Padrões
          </Button>
          <Button onClick={handleSave} disabled={isLoading} className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            {isLoading ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </div>
      </div>
    </div>
  )
}
