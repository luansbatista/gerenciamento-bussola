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
  ChevronLeft,
  ChevronRight,
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
  
  // Debug logging
  console.log('Sidebar - User:', user)
  console.log('Sidebar - isAdmin:', isAdmin)
  console.log('Sidebar - user?.isAdmin:', user?.isAdmin)
  console.log('Sidebar - user?.role:', user?.role)
  console.log('Sidebar - isMobile:', isMobile)

  // Se for mobile, não renderizar o sidebar fixo
  if (isMobile) {
    return null
  }

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col bg-gray-50 border-r border-gray-200 transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      {/* Toggle Button */}
      <div className="flex items-center justify-end p-4">
        <Button variant="ghost" size="sm" onClick={toggleSidebar} className="h-8 w-8 p-0 hover:bg-gray-200">
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 pb-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
              )}
            >
              <item.icon
                className={cn(
                  "flex-shrink-0 h-5 w-5",
                  isActive ? "text-white" : "text-gray-500 group-hover:text-gray-700",
                  isCollapsed ? "mx-auto" : "mr-3",
                )}
              />
              {!isCollapsed && <span className="truncate">{item.name}</span>}
            </Link>
          )
        })}

        {/* Admin Section */}
        {isAdmin && (
          <>
            <div className="pt-4">
              {!isCollapsed && (
                <div className="px-2 pb-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Administração</h3>
                </div>
              )}
              {adminNavigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                      isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "flex-shrink-0 h-5 w-5",
                        isActive ? "text-white" : "text-gray-500 group-hover:text-gray-700",
                        isCollapsed ? "mx-auto" : "mr-3",
                      )}
                    />
                    {!isCollapsed && <span className="truncate">{item.name}</span>}
                  </Link>
                )
              })}
            </div>
          </>
        )}

        {/* User Actions */}
        <div className="pt-4">
          {!isCollapsed && (
            <div className="px-2 pb-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Ações</h3>
            </div>
          )}
          {userActions.map((item) => {
            const isActive = pathname === item.href
            return (
              <button
                key={item.name}
                onClick={() => {
                  if (item.action === "logout") {
                    logout()
                  }
                }}
                className={cn(
                  "group flex items-center w-full px-2 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive ? "bg-red-600 text-white" : "text-gray-700 hover:bg-red-50 hover:text-red-700",
                )}
              >
                <item.icon
                  className={cn(
                    "flex-shrink-0 h-5 w-5",
                    isActive ? "text-white" : "text-gray-500 group-hover:text-red-600",
                    isCollapsed ? "mx-auto" : "mr-3",
                  )}
                />
                {!isCollapsed && <span className="truncate">{item.name}</span>}
              </button>
            )
          })}
        </div>
      </nav>

      {/* User Info */}
      {!isCollapsed && user && (
        <div className="flex-shrink-0 p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
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
  )
}
