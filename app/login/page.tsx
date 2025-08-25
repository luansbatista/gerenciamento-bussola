"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Mail } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { LogoImage } from "@/components/ui/logo-image"
import { createClient } from "@/utils/supabase/client"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isResetMode, setIsResetMode] = useState(false)
  const { login } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsLoading(true)

    try {
      await login(email, password)
      router.push("/")
    } catch (err) {
      console.error('❌ Erro no login:', err)
      if (err instanceof Error) {
        if (err.message.includes('Invalid login credentials')) {
          setError("Email ou senha incorretos")
        } else if (err.message.includes('Email not confirmed')) {
          setError("Email não confirmado. Verifique sua caixa de entrada.")
        } else {
          setError(`Erro no login: ${err.message}`)
        }
      } else {
        setError("Email ou senha incorretos")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`
      })

      if (error) {
        throw error
      }

      setSuccess("Email de recuperação enviado! Verifique sua caixa de entrada.")
      setIsResetMode(false)
    } catch (err) {
      console.error('❌ Erro no reset de senha:', err)
      if (err instanceof Error) {
        setError(`Erro ao enviar email: ${err.message}`)
      } else {
        setError("Erro ao enviar email de recuperação.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <div className="mx-auto mb-6">
            <LogoImage size="lg" className="justify-center" />
          </div>
          <p className="text-gray-600">Entre na sua conta</p>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-xl text-center">
              {isResetMode ? "Recuperar Senha" : "Fazer Login"}
            </CardTitle>
            <CardDescription className="text-center">
              {isResetMode 
                ? "Digite seu email para receber um link de recuperação" 
                : "Digite suas credenciais para acessar sua conta"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={isResetMode ? handleResetPassword : handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

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

              {!isResetMode && (
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Digite sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-11 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full h-11" disabled={isLoading}>
                {isLoading 
                  ? (isResetMode ? "Enviando..." : "Entrando...") 
                  : (isResetMode ? "Enviar email de recuperação" : "Entrar")
                }
              </Button>
            </form>

            <div className="mt-6 space-y-3">
              {!isResetMode ? (
                <div className="text-center text-sm">
                  <span className="text-gray-600">Não tem uma conta? </span>
                  <Link href="/signup" className="text-blue-600 hover:text-blue-500 font-medium">
                    Criar conta
                  </Link>
                </div>
              ) : (
                <div className="text-center text-sm">
                  <span className="text-gray-600">Lembrou sua senha? </span>
                  <button 
                    onClick={() => setIsResetMode(false)}
                    className="text-blue-600 hover:text-blue-500 font-medium"
                  >
                    Voltar ao login
                  </button>
                </div>
              )}
              
              {!isResetMode && (
                <div className="text-center text-sm">
                  <button 
                    onClick={() => setIsResetMode(true)}
                    className="text-blue-600 hover:text-blue-500 font-medium"
                  >
                    Esqueceu sua senha?
                  </button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-xs text-gray-500">
          <p>Sistema de estudos para concursos públicos</p>
        </div>
      </div>
    </div>
  )
}
