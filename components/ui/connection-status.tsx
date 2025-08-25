"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { checkSupabaseConnection } from "@/lib/supabase"
import { Wifi, WifiOff, RefreshCw } from "lucide-react"

export function ConnectionStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null)
  const [isChecking, setIsChecking] = useState(false)

  const checkConnection = async () => {
    setIsChecking(true)
    try {
      const connected = await checkSupabaseConnection()
      setIsConnected(connected)
    } catch (error) {
      console.error('Erro ao verificar conexão:', error)
      setIsConnected(false)
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    checkConnection()
  }, [])

  if (isConnected === null) {
    return (
      <Badge variant="outline" className="flex items-center gap-1">
        <RefreshCw className="h-3 w-3 animate-spin" />
        Verificando...
      </Badge>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant={isConnected ? "default" : "destructive"}
        className="flex items-center gap-1"
      >
        {isConnected ? (
          <>
            <Wifi className="h-3 w-3" />
            Conectado
          </>
        ) : (
          <>
            <WifiOff className="h-3 w-3" />
            Desconectado
          </>
        )}
      </Badge>
      
      <Button
        variant="outline"
        size="sm"
        onClick={checkConnection}
        disabled={isChecking}
        className="h-6 px-2"
      >
        <RefreshCw className={`h-3 w-3 ${isChecking ? 'animate-spin' : ''}`} />
      </Button>
    </div>
  )
}
