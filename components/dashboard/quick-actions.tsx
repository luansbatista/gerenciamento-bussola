import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Brain, PlayCircle, Timer, FileText, Target } from "lucide-react"
import Link from "next/link"

export function QuickActions() {
  const actions = [
    {
      title: "Resolver Questões",
      description: "Banco de questões",
      icon: FileText,
      href: "/questions",
      gradient: "from-blue-500 to-blue-600",
    },
    // {
    //   title: "Fazer Simulado",
    //   description: "Teste seus conhecimentos",
    //   icon: PlayCircle,
    //   href: "/exams",
    //   gradient: "from-green-500 to-green-600",
    // }, // Temporariamente oculto
    {
      title: "Flashcards",
      description: "Revisão rápida",
      icon: Brain,
      href: "/flashcards",
      gradient: "from-purple-500 to-purple-600",
    },
    {
      title: "Pomodoro",
      description: "Sessão focada",
      icon: Timer,
      href: "/pomodoro",
      gradient: "from-orange-500 to-orange-600",
    },
  ]

  return (
    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-2">
            <Target className="h-5 w-5 text-white" />
          </div>
          Ações Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        {actions.map((action) => (
          <Link key={action.title} href={action.href}>
            <Button
              variant="outline"
              className="h-24 w-full p-4 flex flex-col items-center justify-center gap-3 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-slate-50 border-slate-200 hover:border-slate-300 group"
            >
              <div
                className={`h-10 w-10 rounded-xl bg-gradient-to-r ${action.gradient} flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-300`}
              >
                <action.icon className="h-5 w-5 text-white" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                  {action.title}
                </p>
                <p className="text-xs text-slate-500 group-hover:text-slate-600 transition-colors">
                  {action.description}
                </p>
              </div>
            </Button>
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}
