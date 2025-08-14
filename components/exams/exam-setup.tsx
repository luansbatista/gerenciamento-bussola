"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { X, Settings, PlayCircle } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"

interface ExamSetupProps {
  onClose: () => void
}

export function ExamSetup({ onClose }: ExamSetupProps) {
  const router = useRouter()
  const supabase = createClient()
  const [examName, setExamName] = useState("Simulado PMBA")
  const [questionCount, setQuestionCount] = useState(50)
  const [timeLimit, setTimeLimit] = useState(150) // em minutos
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const [difficulty, setDifficulty] = useState<string[]>(["easy", "medium", "hard"])
  const [subjects, setSubjects] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const handleSubjectToggle = (subjectId: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subjectId) ? prev.filter((id) => id !== subjectId) : [...prev, subjectId],
    )
  }

  const handleDifficultyToggle = (diff: string) => {
    setDifficulty((prev) => (prev.includes(diff) ? prev.filter((d) => d !== diff) : [...prev, diff]))
  }

  // Carregar disciplinas do Supabase
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const { data, error } = await supabase
          .from('assuntos_edital')
          .select('disciplina')
          .order('disciplina')
        
        if (error) {
          console.error('Erro ao buscar disciplinas:', error)
          return
        }

        if (data) {
          const uniqueSubjects = Array.from(new Set(data.map(item => item.disciplina)))
          setSubjects(uniqueSubjects.map((disciplina, index) => ({
            id: index.toString(),
            name: disciplina
          })))
          setSelectedSubjects(uniqueSubjects.map((_, index) => index.toString()))
        }
      } catch (error) {
        console.error('Erro ao buscar disciplinas:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSubjects()
  }, [supabase])

  const startExam = () => {
    // Criar configuração do simulado e navegar para a página do simulado
    const examConfig = {
      name: examName,
      questionCount,
      timeLimit,
      subjects: selectedSubjects,
      difficulty,
    }

    // Salvar configuração no localStorage para usar na página do simulado
    localStorage.setItem("currentExamConfig", JSON.stringify(examConfig))
    router.push("/exams/take")
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-600" />
              Configurar Simulado
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Settings */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="examName">Nome do Simulado</Label>
              <Input
                id="examName"
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                placeholder="Digite o nome do simulado"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="questionCount">Número de Questões</Label>
                <Input
                  id="questionCount"
                  type="number"
                  min="10"
                  max="100"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="timeLimit">Tempo Limite (minutos)</Label>
                <Input
                  id="timeLimit"
                  type="number"
                  min="30"
                  max="300"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* Subject Selection */}
          <div>
            <Label className="text-base font-medium">Matérias</Label>
            <p className="text-sm text-gray-500 mb-3">Selecione as matérias que deseja incluir no simulado</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {subjects.map((subject) => (
                <div key={subject.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={subject.id}
                    checked={selectedSubjects.includes(subject.id)}
                    onCheckedChange={() => handleSubjectToggle(subject.id)}
                  />
                  <Label htmlFor={subject.id} className="flex items-center gap-2 cursor-pointer">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: subject.color }} />
                    {subject.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Difficulty Selection */}
          <div>
            <Label className="text-base font-medium">Nível de Dificuldade</Label>
            <p className="text-sm text-gray-500 mb-3">Escolha os níveis de dificuldade das questões</p>
            <div className="flex gap-4">
              {[
                { value: "easy", label: "Fácil", color: "bg-green-100 text-green-700" },
                { value: "medium", label: "Médio", color: "bg-yellow-100 text-yellow-700" },
                { value: "hard", label: "Difícil", color: "bg-red-100 text-red-700" },
              ].map((diff) => (
                <div key={diff.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={diff.value}
                    checked={difficulty.includes(diff.value)}
                    onCheckedChange={() => handleDifficultyToggle(diff.value)}
                  />
                  <Label htmlFor={diff.value} className="cursor-pointer">
                    <Badge className={diff.color}>{diff.label}</Badge>
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Resumo do Simulado</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• {questionCount} questões selecionadas</p>
              <p>
                • Tempo limite: {Math.floor(timeLimit / 60)}h {timeLimit % 60}min
              </p>
              <p>• {selectedSubjects.length} matérias incluídas</p>
              <p>
                • Níveis:{" "}
                {difficulty.map((d) => (d === "easy" ? "Fácil" : d === "medium" ? "Médio" : "Difícil")).join(", ")}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancelar
            </Button>
            <Button onClick={startExam} className="flex-1 flex items-center gap-2">
              <PlayCircle className="h-4 w-4" />
              Iniciar Simulado
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
