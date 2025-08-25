"use client"

import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function DebugAdminPage() {
  const { user, isAdmin, isLoading } = useAuth()

  if (isLoading) {
    return <div className="p-8">Carregando...</div>
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Debug - Status do Admin</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Informações do Usuário</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <strong>ID:</strong> {user?.id || 'N/A'}
          </div>
          <div>
            <strong>Nome:</strong> {user?.name || 'N/A'}
          </div>
          <div>
            <strong>Email:</strong> {user?.email || 'N/A'}
          </div>
          <div>
            <strong>Role:</strong> 
            <Badge variant={user?.role === 'admin' ? 'default' : 'secondary'} className="ml-2">
              {user?.role || 'N/A'}
            </Badge>
          </div>
          <div>
            <strong>isAdmin:</strong> 
            <Badge variant={user?.isAdmin ? 'default' : 'secondary'} className="ml-2">
              {user?.isAdmin ? 'true' : 'false'}
            </Badge>
          </div>
          <div>
            <strong>isAdmin (context):</strong> 
            <Badge variant={isAdmin ? 'default' : 'secondary'} className="ml-2">
              {isAdmin ? 'true' : 'false'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dados Completos do Usuário</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Teste de Condição Admin</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <strong>user?.isAdmin === true:</strong> {user?.isAdmin === true ? '✅' : '❌'}
          </div>
          <div>
            <strong>user?.role === "admin":</strong> {user?.role === "admin" ? '✅' : '❌'}
          </div>
          <div>
            <strong>isAdmin (context):</strong> {isAdmin ? '✅' : '❌'}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

