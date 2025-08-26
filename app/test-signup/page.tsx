"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuthSimple } from "@/lib/auth-context-simple"

export default function TestSignupPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { signup } = useAuthSimple()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("As senhas não coincidem")
      return
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres")
      return
    }

    setIsLoading(true)

    try {
      console.log('🔄 TestSignupPage: Iniciando signup para:', email)
      await signup(name, email, password)
      console.log('✅ TestSignupPage: Signup realizado com sucesso')
      router.push("/")
    } catch (err) {
      console.error('❌ TestSignupPage: Erro no signup:', err)
      console.error('❌ TestSignupPage: Tipo do erro:', typeof err)
      console.error('❌ TestSignupPage: Erro completo:', JSON.stringify(err, null, 2))
      
      if (err instanceof Error) {
        console.error('❌ TestSignupPage: Mensagem do erro:', err.message)
        console.error('❌ TestSignupPage: Stack trace:', err.stack)
        
        if (err.message.includes('already registered') || err.message.includes('User already registered')) {
          setError("Este email já está cadastrado. Tente fazer login ou use outro email.")
        } else if (err.message.includes('password')) {
          setError("A senha deve ter pelo menos 6 caracteres.")
        } else if (err.message.includes('email')) {
          setError("Digite um email válido.")
        } else if (err.message.includes('network') || err.message.includes('fetch')) {
          setError("Erro de conexão. Verifique sua internet e tente novamente.")
        } else if (err.message.includes('Database error')) {
          setError("Erro no banco de dados. Tente novamente em alguns instantes.")
        } else if (err.message.includes('Failed to fetch')) {
          setError("Erro de conexão com o servidor. Verifique sua internet e tente novamente.")
        } else {
          setError(`Erro ao criar conta: ${err.message}`)
        }
      } else {
        console.error('❌ TestSignupPage: Erro não é uma instância de Error:', err)
        setError("Erro ao criar conta. Tente novamente.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <Card className="border-0 shadow-xl">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-xl text-center">Teste de Signup</CardTitle>
            <CardDescription className="text-center">Teste com cliente Supabase simplificado</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirme sua senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11"
                disabled={isLoading}
              >
                {isLoading ? "Criando conta..." : "Criar Conta"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
