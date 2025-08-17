"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/lib/sidebar-context"
import { useAuth } from "@/lib/auth-context"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  Home,
  FileText,
  BookOpen,
  Brain,
  FolderOpen,
  RotateCcw,
  Calendar,
  Timer,
  Target,
  Medal,
  BarChart3,
  Trophy,
  Shield,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react"
import React from "react"

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Banco de Questões", href: "/questions", icon: FileText },
  { name: "Simulados", href: "/exams", icon: BookOpen },
  { name: "Flashcards", href: "/flashcards", icon: Brain },
  { name: "Materiais", href: "/materials", icon: FolderOpen },
  { name: "Revisões", href: "/reviews", icon: RotateCcw },
  { name: "Cronograma", href: "/schedule", icon: Calendar },
  { name: "Pomodoro", href: "/pomodoro", icon: Timer },
  { name: "Coach de Estudo", href: "/coach", icon: Target },
  { name: "Ranking", href: "/ranking", icon: Medal },
  { name: "Estatísticas", href: "/stats", icon: BarChart3 },
  { name: "Metas", href: "/goals", icon: Trophy },
]

const adminNavigation = [
  { name: "Administrador", href: "/admin", icon: Shield },
  { name: "Configurações", href: "/settings", icon: Settings },
]

const userActions = [
  { name: "Sair", href: "/logout", icon: LogOut, action: "logout" },
]

export function Sidebar() {
  const pathname = usePathname()
  const { isCollapsed, toggleSidebar } = useSidebar()
  const { user, logout } = useAuth()
  const isMobile = useIsMobile()

  const isAdmin = user?.isAdmin || user?.role === "admin"

  const handleNavigation = (href: string) => {
    toggleSidebar()
  }

  const handleLogout = () => {
    logout()
    toggleSidebar()
  }

  // Se for mobile, não renderizar o sidebar fixo
  if (isMobile) {
    return null
  }

  return (
    <>
      {/* Desktop Menu Overlay */}
      {!isCollapsed && (
        <div className="fixed inset-0 z-50 hidden md:block">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50" 
            onClick={toggleSidebar}
          />
          
          {/* Menu Panel */}
          <div className="fixed inset-y-0 left-0 w-80 bg-white shadow-xl">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleSidebar}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => handleNavigation(item.href)}
                      className={cn(
                        "group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors",
                        isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                      )}
                    >
                      <item.icon
                        className={cn(
                          "flex-shrink-0 h-5 w-5 mr-3",
                          isActive ? "text-white" : "text-gray-500 group-hover:text-gray-700",
                        )}
                      />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}

                {/* Admin Section */}
                {isAdmin && (
                  <>
                    <div className="pt-6">
                      <div className="px-3 pb-2">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Administração</h3>
                      </div>
                      {adminNavigation.map((item) => {
                        const isActive = pathname === item.href
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => handleNavigation(item.href)}
                            className={cn(
                              "group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors",
                              isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                            )}
                          >
                            <item.icon
                              className={cn(
                                "flex-shrink-0 h-5 w-5 mr-3",
                                isActive ? "text-white" : "text-gray-500 group-hover:text-gray-700",
                              )}
                            />
                            <span>{item.name}</span>
                          </Link>
                        )
                      })}
                    </div>
                  </>
                )}

                {/* User Actions */}
                <div className="pt-6">
                  <div className="px-3 pb-2">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Ações</h3>
                  </div>
                  {userActions.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <button
                        key={item.name}
                        onClick={() => {
                          if (item.action === "logout") {
                            handleLogout()
                          }
                        }}
                        className={cn(
                          "group flex items-center w-full px-3 py-3 text-sm font-medium rounded-lg transition-colors",
                          isActive ? "bg-red-600 text-white" : "text-gray-700 hover:bg-red-50 hover:text-red-700",
                        )}
                      >
                        <item.icon
                          className={cn(
                            "flex-shrink-0 h-5 w-5 mr-3",
                            isActive ? "text-white" : "text-gray-500 group-hover:text-red-600",
                          )}
                        />
                        <span>{item.name}</span>
                      </button>
                    )
                  })}
                </div>
              </nav>

              {/* User Info */}
              {user && (
                <div className="flex-shrink-0 p-4 border-t border-gray-200">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                        <span className="text-sm font-medium text-white">{user.name?.charAt(0).toUpperCase() || "U"}</span>
                      </div>
                    </div>
                    <div className="ml-3 min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{user.name || "Usuário"}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
