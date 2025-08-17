"use client"

import { Button } from "@/components/ui/button"
import { useSidebar } from "@/lib/sidebar-context"
import { Menu, X } from "lucide-react"

export function DesktopMenuButton() {
  const { isCollapsed, toggleSidebar } = useSidebar()

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleSidebar}
      className="hidden md:flex h-8 w-8 p-0 text-white hover:bg-white/10"
    >
      {isCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
    </Button>
  )
}
