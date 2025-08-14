"use client"

import { useState } from "react"
import { useAdmin } from "@/lib/admin-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, Search, Filter, MoreHorizontal, Edit, Trash2, Shield, UserCheck, UserX } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export function UsersManagement() {
  const { users, isLoadingUsers, updateUserStatus, makeUserAdmin, removeUserAdmin, deleteUser } = useAdmin()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [roleFilter, setRoleFilter] = useState<string>("all")

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || user.status === statusFilter
    const matchesRole = roleFilter === "all" || 
                       (roleFilter === "admin" && user.is_admin) ||
                       (roleFilter === "user" && !user.is_admin)
    
    return matchesSearch && matchesStatus && matchesRole
  })

  const handleStatusChange = async (userId: string, status: 'active' | 'inactive' | 'suspended') => {
    await updateUserStatus(userId, status)
  }

  const handleAdminToggle = async (userId: string, isAdmin: boolean) => {
    if (isAdmin) {
      await removeUserAdmin(userId)
    } else {
      await makeUserAdmin(userId)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (confirm("Tem certeza que deseja deletar este usuário? Esta ação não pode ser desfeita.")) {
      await deleteUser(userId)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'suspended': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo'
      case 'inactive': return 'Inativo'
      case 'suspended': return 'Suspenso'
      default: return 'Desconhecido'
    }
  }

  if (isLoadingUsers) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Carregando usuários...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gerenciar Usuários</h2>
          <p className="text-gray-600">Gerencie contas de usuários, permissões e status</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="text-sm">
            {filteredUsers.length} usuários
          </Badge>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar usuários..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
                <SelectItem value="suspended">Suspenso</SelectItem>
              </SelectContent>
            </Select>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Função" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as funções</SelectItem>
                <SelectItem value="admin">Administradores</SelectItem>
                <SelectItem value="user">Usuários</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>Filtros</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Usuários */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Lista de Usuários</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Horas de Estudo</TableHead>
                  <TableHead>Cadastro</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-gray-500">ID: {user.id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <span className="text-sm">{user.email}</span>
                    </TableCell>
                    
                    <TableCell>
                      <Select
                        value={user.status}
                        onValueChange={(value: 'active' | 'inactive' | 'suspended') => 
                          handleStatusChange(user.id, value)
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Ativo</SelectItem>
                          <SelectItem value="inactive">Inativo</SelectItem>
                          <SelectItem value="suspended">Suspenso</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {user.is_admin ? (
                          <Badge className="bg-red-100 text-red-800">
                            <Shield className="h-3 w-3 mr-1" />
                            Admin
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <UserCheck className="h-3 w-3 mr-1" />
                            Usuário
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-medium">{user.total_study_hours}h</p>
                        <p className="text-gray-500">Meta: {user.study_goal}h/dia</p>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-sm">
                        <p>{format(new Date(user.created_at), 'dd/MM/yyyy', { locale: ptBR })}</p>
                        <p className="text-gray-500">
                          {format(new Date(user.created_at), 'HH:mm', { locale: ptBR })}
                        </p>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAdminToggle(user.id, user.is_admin)}
                          className="h-8 w-8 p-0"
                        >
                          {user.is_admin ? (
                            <UserX className="h-4 w-4 text-orange-600" />
                          ) : (
                            <Shield className="h-4 w-4 text-blue-600" />
                          )}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum usuário encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
