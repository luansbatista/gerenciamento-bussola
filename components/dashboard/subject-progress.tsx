import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BookOpen } from "lucide-react"
import { useStudy } from "@/lib/study-context"

export function SubjectProgress() {
  const { getSubjectProgress } = useStudy()
  
  const subjects = [
    { id: "portugues", name: "Português", color: "#3B82F6" },
    { id: "matematica", name: "Matemática", color: "#10B981" },
    { id: "direito-constitucional", name: "Direito Constitucional", color: "#F59E0B" },
    { id: "historia-brasil", name: "História do Brasil", color: "#EF4444" },
    { id: "geografia-brasil", name: "Geografia do Brasil", color: "#8B5CF6" },
  ]

  const subjectProgress = subjects.map((subject) => {
    const progress = getSubjectProgress(subject.name)
    return {
      ...subject,
      completed: progress.total || 0,
      accuracy: progress.accuracy || 0,
      totalQuestions: progress.total || 0,
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-blue-600" />
          Progresso por Matéria
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {subjectProgress.map((subject) => {
          const progressPercentage = (subject.completed / subject.totalQuestions) * 100
          return (
            <div key={subject.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: subject.color }} />
                  <span className="text-sm font-medium">{subject.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium">
                    {subject.completed}/{subject.totalQuestions}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">{subject.accuracy}% acerto</span>
                </div>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
