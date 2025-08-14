"use client"

import { useState, useCallback } from "react"
import { useAdmin } from "@/lib/admin-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Database, Search, Filter, Plus, Edit, Trash2, Eye, BarChart3 } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { QuestionsFilters } from "@/components/admin/questions-filters"

export function QuestionsManagement() {
  const { questions, isLoadingQuestions, addQuestion, updateQuestion, deleteQuestion } = useAdmin()
  const [searchTerm, setSearchTerm] = useState("")
  const [subjectFilter, setSubjectFilter] = useState<string>("all")
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<any>(null)
  const [activeFilters, setActiveFilters] = useState<{
    disciplina?: string
    assunto?: string
    difficulty?: string
    search?: string
  }>({})

  // Estado para nova questão
  const [newQuestion, setNewQuestion] = useState({
    subject: "",
    question: "",
    options: ["", "", "", ""],
    correct_answer: 0,
    difficulty: "medium" as 'easy' | 'medium' | 'hard'
  })

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         q.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (q.disciplina && q.disciplina.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (q.assunto && q.assunto.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesSubject = subjectFilter === "all" || q.subject === subjectFilter
    const matchesDifficulty = difficultyFilter === "all" || q.difficulty === difficultyFilter
    
    // Filtros avançados
    const matchesDisciplina = !activeFilters.disciplina || q.disciplina === activeFilters.disciplina
    const matchesAssunto = !activeFilters.assunto || q.assunto === activeFilters.assunto
    const matchesDifficultyAdvanced = !activeFilters.difficulty || q.difficulty === activeFilters.difficulty
    const matchesSearchAdvanced = !activeFilters.search || 
      q.question.toLowerCase().includes(activeFilters.search.toLowerCase()) ||
      q.subject.toLowerCase().includes(activeFilters.search.toLowerCase()) ||
      (q.disciplina && q.disciplina.toLowerCase().includes(activeFilters.search.toLowerCase())) ||
      (q.assunto && q.assunto.toLowerCase().includes(activeFilters.search.toLowerCase()))
    
    return matchesSearch && matchesSubject && matchesDifficulty && 
           matchesDisciplina && matchesAssunto && matchesDifficultyAdvanced && matchesSearchAdvanced
  })



  const subjects = Array.from(new Set(questions.map(q => q.subject)))

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Fácil'
      case 'medium': return 'Médio'
      case 'hard': return 'Difícil'
      default: return 'Desconhecido'
    }
  }

  const handleAddQuestion = async () => {
    if (!newQuestion.subject || !newQuestion.question || newQuestion.options.some(opt => !opt)) {
      alert("Por favor, preencha todos os campos obrigatórios")
      return
    }

    await addQuestion(newQuestion)
    setNewQuestion({
      subject: "",
      question: "",
      options: ["", "", "", ""],
      correct_answer: 0,
      difficulty: "medium"
    })
    setIsAddDialogOpen(false)
  }

  const handleEditQuestion = async () => {
    if (!editingQuestion) return

    await updateQuestion(editingQuestion.id, editingQuestion)
    setEditingQuestion(null)
  }

  const handleDeleteQuestion = async (id: string) => {
    if (confirm("Tem certeza que deseja deletar esta questão? Esta ação não pode ser desfeita.")) {
      await deleteQuestion(id)
    }
  }

  const handleFiltersChange = useCallback((filters: {
    disciplina?: string
    assunto?: string
    difficulty?: string
    search?: string
  }) => {
    setActiveFilters(prev => {
      // Só atualiza se os filtros realmente mudaram
      if (JSON.stringify(prev) !== JSON.stringify(filters)) {
        return filters
      }
      return prev
    })
  }, [])

  if (isLoadingQuestions) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Carregando questões...</span>
      </div>
    )
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gerenciar Questões</h2>
          <p className="text-gray-600">Gerencie o banco de questões e matérias</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="text-sm">
            {filteredQuestions.length} questões
          </Badge>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Adicionar Questão</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Adicionar Nova Questão</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Matéria</label>
                  <Input
                    value={newQuestion.subject}
                    onChange={(e) => setNewQuestion({ ...newQuestion, subject: e.target.value })}
                    placeholder="Ex: Português, Matemática..."
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Questão</label>
                  <Textarea
                    value={newQuestion.question}
                    onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                    placeholder="Digite a questão..."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Dificuldade</label>
                  <Select
                    value={newQuestion.difficulty}
                    onValueChange={(value: 'easy' | 'medium' | 'hard') => 
                      setNewQuestion({ ...newQuestion, difficulty: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Fácil</SelectItem>
                      <SelectItem value="medium">Médio</SelectItem>
                      <SelectItem value="hard">Difícil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Alternativas</label>
                  <div className="space-y-2">
                    {newQuestion.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="correct_answer"
                          checked={newQuestion.correct_answer === index}
                          onChange={() => setNewQuestion({ ...newQuestion, correct_answer: index })}
                          className="text-blue-600"
                        />
                        <Input
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...newQuestion.options]
                            newOptions[index] = e.target.value
                            setNewQuestion({ ...newQuestion, options: newOptions })
                          }}
                          placeholder={`Alternativa ${index + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddQuestion}>
                    Adicionar Questão
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-6">
          <QuestionsFilters onFiltersChange={handleFiltersChange} />
        </CardContent>
      </Card>

      {/* Tabela de Questões */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Lista de Questões</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Questão</TableHead>
                  <TableHead>Disciplina</TableHead>
                  <TableHead>Assunto</TableHead>
                  <TableHead>Dificuldade</TableHead>
                  <TableHead>Estatísticas</TableHead>
                  <TableHead>Criada em</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuestions.map((question) => (
                  <TableRow key={question.id}>
                    <TableCell>
                      <div className="max-w-md">
                        <p className="font-medium text-sm line-clamp-2">{question.question}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Alternativa correta: {question.correct_answer + 1}
                        </p>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge variant="outline">{question.disciplina || question.subject}</Badge>
                    </TableCell>
                    
                    <TableCell>
                      <span className="text-sm text-gray-600">{question.assunto || '-'}</span>
                    </TableCell>
                    
                    <TableCell>
                      <Badge className={getDifficultyColor(question.difficulty)}>
                        {getDifficultyText(question.difficulty)}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-medium">{question.times_answered} tentativas</p>
                        <p className="text-gray-500">{question.accuracy_rate}% acerto</p>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-sm">
                        <p>{format(new Date(question.created_at), 'dd/MM/yyyy', { locale: ptBR })}</p>
                        <p className="text-gray-500">
                          {format(new Date(question.created_at), 'HH:mm', { locale: ptBR })}
                        </p>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingQuestion(question)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4 text-blue-600" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredQuestions.length === 0 && (
            <div className="text-center py-8">
              <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma questão encontrada</p>
              <p className="text-sm text-gray-400 mt-2">
                Total de questões no estado: {questions.length} | 
                Questões filtradas: {filteredQuestions.length}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Edição */}
      {editingQuestion && (
        <Dialog open={!!editingQuestion} onOpenChange={() => setEditingQuestion(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Questão</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Matéria</label>
                <Input
                  value={editingQuestion.subject}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, subject: e.target.value })}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Questão</label>
                <Textarea
                  value={editingQuestion.question}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, question: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Dificuldade</label>
                <Select
                  value={editingQuestion.difficulty}
                  onValueChange={(value: 'easy' | 'medium' | 'hard') => 
                    setEditingQuestion({ ...editingQuestion, difficulty: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Fácil</SelectItem>
                    <SelectItem value="medium">Médio</SelectItem>
                    <SelectItem value="hard">Difícil</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Alternativas</label>
                <div className="space-y-2">
                  {editingQuestion.options.map((option: string, index: number) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="correct_answer_edit"
                        checked={editingQuestion.correct_answer === index}
                        onChange={() => setEditingQuestion({ ...editingQuestion, correct_answer: index })}
                        className="text-blue-600"
                      />
                      <Input
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...editingQuestion.options]
                          newOptions[index] = e.target.value
                          setEditingQuestion({ ...editingQuestion, options: newOptions })
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditingQuestion(null)}>
                  Cancelar
                </Button>
                <Button onClick={handleEditQuestion}>
                  Salvar Alterações
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
