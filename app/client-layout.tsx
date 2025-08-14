"use client"

import type React from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { MobileMenu } from "@/components/layout/mobile-menu"
import { AuthProvider } from "@/lib/auth-context"
import { SidebarProvider, useSidebar } from "@/lib/sidebar-context"
import { NotificationProvider } from "@/lib/notification-context"
import { PomodoroProvider } from "@/lib/pomodoro-context"
import { StudyProvider } from "@/lib/study-context"
import { FlashcardProvider } from "@/lib/flashcard-context"
import { CoachProvider } from "@/lib/coach-context"
import { ReviewProvider } from "@/lib/review-context"
import { ScheduleProvider } from "@/lib/schedule-context"
import { AnalyticsProvider } from "@/lib/analytics-context"
import { InsightsProvider } from "@/lib/insights-context"
import { AdminProvider } from "@/lib/admin-context"
import { QuestionsProvider } from "@/lib/questions-context"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { usePathname } from "next/navigation"
import NotificationBell from "@/components/layout/notification-bell"
import PomodoroIndicator from "@/components/layout/pomodoro-indicator"
import Image from "next/image"

function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = pathname === "/login" || pathname === "/signup"
  const { isCollapsed } = useSidebar()

  if (isAuthPage) {
    return <div className="min-h-screen">{children}</div>
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen">
        <Sidebar />
        <div className={`flex-1 flex flex-col transition-all duration-300 ${isCollapsed ? "md:ml-20" : "md:ml-72"}`}>
          <div className="relative bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 shadow-2xl border-b border-blue-500/20 overflow-hidden">
            {/* Elementos decorativos de fundo */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-transparent to-blue-600/10"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400"></div>

            {/* Efeitos de brilho */}
            <div className="absolute top-2 left-1/4 w-32 h-32 bg-blue-400/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-4 right-1/3 w-24 h-24 bg-cyan-400/5 rounded-full blur-2xl animate-pulse delay-1000"></div>

            <div className="relative px-4 md:px-8 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 md:space-x-4">
                  {/* Mobile Menu Button */}
                  <MobileMenu />
                  
                  <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center">
                    <Image
                      src="/bussola-header-logo.png"
                      alt="Bússola Logo"
                      width={64}
                      height={64}
                      className="drop-shadow-lg w-full h-full object-contain"
                    />
                  </div>

                  <div className="hidden sm:block">
                    <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent drop-shadow-sm">
                      Bússola da Aprovação
                    </h1>
                    <p className="text-blue-200/80 text-xs font-medium tracking-wide">Sistema de Estudos</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 md:space-x-6">
                  <NotificationBell />

                  <PomodoroIndicator />

                  {/* Status indicator melhorado */}
                  <div className="hidden md:flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 border border-white/20">
                    <div className="relative">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <div className="absolute inset-0 w-2 h-2 bg-green-400 rounded-full animate-ping opacity-75"></div>
                    </div>
                    <span className="text-white/90 text-xs font-medium">Sistema Online</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="h-2 bg-gradient-to-b from-gray-50 to-transparent"></div>

          <main className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-blue-50/30">
            <div>{children}</div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <AuthProvider>
      <NotificationProvider>
        <PomodoroProvider>
          <StudyProvider>
            <FlashcardProvider>
              <CoachProvider>
                <ReviewProvider>
                  <ScheduleProvider>
                    <AnalyticsProvider>
                      <InsightsProvider>
                        <AdminProvider>
                          <QuestionsProvider>
                            <SidebarProvider>
                              <ConditionalLayout>{children}</ConditionalLayout>
                            </SidebarProvider>
                          </QuestionsProvider>
                        </AdminProvider>
                      </InsightsProvider>
                    </AnalyticsProvider>
                  </ScheduleProvider>
                </ReviewProvider>
              </CoachProvider>
            </FlashcardProvider>
          </StudyProvider>
        </PomodoroProvider>
      </NotificationProvider>
    </AuthProvider>
  )
}
