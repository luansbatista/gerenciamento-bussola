"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function TestConnectionPage() {
  const [connectionStatus, setConnectionStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [testResults, setTestResults] = useState<any>({})

  const supabase = createClient()

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    try {
      setConnectionStatus('loading')
      setErrorMessage('')

      // Teste 1: Verificar se consegue acessar a API
      const { data: apiTest, error: apiError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1)

      if (apiError) {
        throw new Error(`Erro na API: ${apiError.message}`)
      }

      // Teste 2: Verificar autenticação
      const { data: { session }, error: authError } = await supabase.auth.getSession()
      
      if (authError) {
        throw new Error(`Erro na autenticação: ${authError.message}`)
      }

      // Teste 3: Verificar se as tabelas existem
      const tables = ['profiles', 'subjects', 'questions', 'study_sessions']
      const tableResults: any = {}

      for (const table of tables) {
        try {
          const { data, error } = await supabase
            .from(table)
    .select('*')
            .limit(1)
          
          tableResults[table] = {
            exists: !error,
            error: error?.message || null
          }
        } catch (err) {
          tableResults[table] = {
            exists: false,
            error: err instanceof Error ? err.message : 'Erro desconhecido'
          }
        }
      }

      setTestResults({
        api: { success: true },
        auth: { success: true, session: !!session },
        tables: tableResults
      })

      setConnectionStatus('success')

    } catch (error) {
      setConnectionStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Erro desconhecido')
    }
  }

  const getStatusColor = (status: 'loading' | 'success' | 'error') => {
    switch (status) {
      case 'loading': return 'bg-yellow-500'
      case 'success': return 'bg-green-500'
      case 'error': return 'bg-red-500'
    }
  }

  const getStatusText = (status: 'loading' | 'success' | 'error') => {
    switch (status) {
      case 'loading': return 'Testando...'
      case 'success': return 'Conectado'
      case 'error': return 'Erro'
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Teste de Conexão - Supabase</h1>
        <Button onClick={testConnection} disabled={connectionStatus === 'loading'}>
          Testar Novamente
        </Button>
      </div>

      {/* Status Geral */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Status da Conexão
            <div className={`w-3 h-3 rounded-full ${getStatusColor(connectionStatus)}`} />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Badge variant={connectionStatus === 'success' ? 'default' : connectionStatus === 'error' ? 'destructive' : 'secondary'}>
              {getStatusText(connectionStatus)}
            </Badge>
            {connectionStatus === 'error' && (
              <span className="text-red-600 font-medium">{errorMessage}</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Configurações */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações do Supabase</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">URL:</label>
            <p className="text-sm text-gray-600 break-all">
              {process.env.NEXT_PUBLIC_SUPABASE_URL || 'Não definida'}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium">Chave Anônima:</label>
            <p className="text-sm text-gray-600 break-all">
              {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 50) + '...' : 
                'Não definida'
              }
            </p>
            </div>
        </CardContent>
      </Card>

      {/* Resultados dos Testes */}
      {connectionStatus !== 'loading' && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados dos Testes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Teste da API */}
            <div>
              <h4 className="font-medium mb-2">API REST</h4>
              <Badge variant={testResults.api?.success ? 'default' : 'destructive'}>
                {testResults.api?.success ? '✅ Funcionando' : '❌ Erro'}
              </Badge>
            </div>

            {/* Teste de Autenticação */}
            <div>
              <h4 className="font-medium mb-2">Autenticação</h4>
              <Badge variant={testResults.auth?.success ? 'default' : 'destructive'}>
                {testResults.auth?.success ? '✅ Funcionando' : '❌ Erro'}
              </Badge>
              {testResults.auth?.session && (
                <p className="text-sm text-gray-600 mt-1">Sessão ativa: {testResults.auth.session ? 'Sim' : 'Não'}</p>
          )}
        </div>

            {/* Teste das Tabelas */}
            <div>
              <h4 className="font-medium mb-2">Tabelas do Banco</h4>
              <div className="space-y-2">
                {testResults.tables && Object.entries(testResults.tables).map(([table, result]: [string, any]) => (
                  <div key={table} className="flex items-center gap-2">
                    <Badge variant={result.exists ? 'default' : 'destructive'}>
                      {result.exists ? '✅' : '❌'} {table}
                    </Badge>
                    {result.error && (
                      <span className="text-sm text-red-600">({result.error})</span>
          )}
        </div>
                ))}
          </div>
        </div>
          </CardContent>
        </Card>
      )}

      {/* Instruções */}
      {connectionStatus === 'error' && (
        <Alert>
          <AlertDescription>
            <strong>Para resolver o problema:</strong>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>Verifique se o projeto Supabase está ativo</li>
              <li>Confirme se as credenciais estão corretas</li>
              <li>Execute o script SQL no painel do Supabase</li>
              <li>Verifique se as tabelas foram criadas</li>
              <li>Teste novamente a conexão</li>
            </ol>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
