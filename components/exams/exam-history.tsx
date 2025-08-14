import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, FileText } from "lucide-react"

export function ExamHistory() {
  const examHistory: any[] = []

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50"
    if (score >= 70) return "text-yellow-600 bg-yellow-50"
    return "text-red-600 bg-red-50"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          Histórico
        </CardTitle>
      </CardHeader>
      <CardContent>
        {examHistory.length === 0 ? (
          <div className="text-center py-6">
            <FileText className="h-8 w-8 text-gray-300 mx-auto mb-3" />
            <h4 className="font-medium text-gray-900 mb-2">Sem histórico</h4>
            <p className="text-sm text-gray-500 mb-4">Realize simulados para ver seu histórico aqui</p>
          </div>
        ) : (
          <div className="space-y-4">
            {examHistory.map((exam) => (
              <div key={exam.id} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-sm">{exam.name}</h4>
                  <Badge className={getScoreColor(exam.score)}>{exam.score}%</Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {exam.date}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {exam.duration}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
