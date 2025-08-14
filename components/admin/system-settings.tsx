"use client"

import { useState } from "react"
import { useAdmin } from "@/lib/admin-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Settings, Save, RefreshCw, Shield, Database, Users, Bell } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function SystemSettings() {
  const { config, isLoadingConfig, updateConfig } = useAdmin()
  const [localConfig, setLocalConfig] = useState(config)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Atualizar configuração local
  const updateLocalConfig = (updates: any) => {
    setLocalConfig(prev => ({ ...prev, ...updates }))
    setHasChanges(true)
  }

  // Salvar configurações
  const handleSave = async () => {
    if (!localConfig) return
    
    setIsSaving(true)
    try {
      await updateConfig(localConfig)
      setHasChanges(false)
    } catch (error) {
      console.error("Erro ao salvar configurações:", error)
    } finally {
      setIsSaving(false)
    }
  }

  // Resetar para valores padrão
  const handleReset = () => {
    setLocalConfig(config)
    setHasChanges(false)
  }

  if (isLoadingConfig || !localConfig) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Carregando configurações...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Configurações do Sistema</h2>
          <p className="text-gray-600">Configure parâmetros e comportamentos do sistema</p>
        </div>
        <div className="flex items-center space-x-2">
          {hasChanges && (
            <Badge variant="secondary" className="text-orange-600 bg-orange-50">
              Alterações não salvas
            </Badge>
          )}
          <Button variant="outline" onClick={handleReset} disabled={!hasChanges}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Resetar
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>

      {/* Configurações Gerais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Configurações Gerais</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="maintenance_mode">Modo de Manutenção</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="maintenance_mode"
                  checked={localConfig.maintenance_mode}
                  onCheckedChange={(checked) => updateLocalConfig({ maintenance_mode: checked })}
                />
                <span className="text-sm text-gray-600">
                  {localConfig.maintenance_mode ? "Ativado" : "Desativado"}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Quando ativado, apenas administradores podem acessar o sistema
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="session_timeout">Timeout de Sessão (minutos)</Label>
              <Input
                id="session_timeout"
                type="number"
                value={localConfig.session_timeout}
                onChange={(e) => updateLocalConfig({ session_timeout: parseInt(e.target.value) })}
                min="5"
                max="1440"
              />
              <p className="text-xs text-gray-500">
                Tempo máximo de inatividade antes do logout automático
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Limites do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Limites do Sistema</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="max_users">Máximo de Usuários</Label>
              <Input
                id="max_users"
                type="number"
                value={localConfig.max_users}
                onChange={(e) => updateLocalConfig({ max_users: parseInt(e.target.value) })}
                min="1"
                max="10000"
              />
              <p className="text-xs text-gray-500">
                Número máximo de usuários que podem se registrar
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_questions_per_subject">Questões por Matéria</Label>
              <Input
                id="max_questions_per_subject"
                type="number"
                value={localConfig.max_questions_per_subject}
                onChange={(e) => updateLocalConfig({ max_questions_per_subject: parseInt(e.target.value) })}
                min="1"
                max="10000"
              />
              <p className="text-xs text-gray-500">
                Número máximo de questões por matéria
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configurações de Estudo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Configurações de Estudo</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="study_goal_default">Meta de Estudo Padrão (horas/dia)</Label>
              <Input
                id="study_goal_default"
                type="number"
                value={localConfig.study_goal_default}
                onChange={(e) => updateLocalConfig({ study_goal_default: parseInt(e.target.value) })}
                min="1"
                max="24"
              />
              <p className="text-xs text-gray-500">
                Meta de estudo padrão para novos usuários
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="backup_frequency">Frequência de Backup</Label>
              <Select
                value={localConfig.backup_frequency}
                onValueChange={(value: 'daily' | 'weekly' | 'monthly') => 
                  updateLocalConfig({ backup_frequency: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Diário</SelectItem>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="monthly">Mensal</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Frequência de backup automático do banco de dados
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configurações de Notificações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Configurações de Notificações</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="email_notifications">Notificações por Email</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="email_notifications"
                  checked={true}
                  onCheckedChange={() => {}}
                />
                <span className="text-sm text-gray-600">Ativado</span>
              </div>
              <p className="text-xs text-gray-500">
                Enviar notificações por email para usuários
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="push_notifications">Notificações Push</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="push_notifications"
                  checked={true}
                  onCheckedChange={() => {}}
                />
                <span className="text-sm text-gray-600">Ativado</span>
              </div>
              <p className="text-xs text-gray-500">
                Enviar notificações push para dispositivos
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configurações de Segurança */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Configurações de Segurança</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="password_min_length">Tamanho Mínimo da Senha</Label>
              <Input
                id="password_min_length"
                type="number"
                value={8}
                onChange={() => {}}
                min="6"
                max="20"
              />
              <p className="text-xs text-gray-500">
                Tamanho mínimo para senhas de usuários
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_login_attempts">Tentativas de Login</Label>
              <Input
                id="max_login_attempts"
                type="number"
                value={5}
                onChange={() => {}}
                min="3"
                max="10"
              />
              <p className="text-xs text-gray-500">
                Número máximo de tentativas de login antes do bloqueio
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium">Políticas de Senha</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch checked={true} onCheckedChange={() => {}} />
                <span className="text-sm">Exigir letras maiúsculas</span>
              </div>
              <div className="flex items-center space-x-2">
                <Switch checked={true} onCheckedChange={() => {}} />
                <span className="text-sm">Exigir números</span>
              </div>
              <div className="flex items-center space-x-2">
                <Switch checked={true} onCheckedChange={() => {}} />
                <span className="text-sm">Exigir caracteres especiais</span>
              </div>
              <div className="flex items-center space-x-2">
                <Switch checked={false} onCheckedChange={() => {}} />
                <span className="text-sm">Não permitir senhas comuns</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Informações do Sistema</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Versão do Sistema</Label>
              <p className="text-sm text-gray-600">1.0.0</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Última Atualização</Label>
              <p className="text-sm text-gray-600">
                {new Date().toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Status do Banco</Label>
              <p className="text-sm text-green-600">Online</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
