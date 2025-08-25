"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Filter, X } from "lucide-react"
import { createClient } from "@/utils/supabase/client"

interface Assunto {
  id: string
  subject_id: string
  topic_name: string
  percentage: number
  priority: number
  subjects?: {
    name: string
  }
}

interface QuestionsFiltersProps {
  onFiltersChange: (filters: {
    disciplina?: string
    assunto?: string
    difficulty?: string
    search?: string
  }) => void
}

export function QuestionsFilters({ onFiltersChange }: QuestionsFiltersProps) {
  const [disciplinas, setDisciplinas] = useState<string[]>([])
  const [assuntos, setAssuntos] = useState<Assunto[]>([])
  const [filteredAssuntos, setFilteredAssuntos] = useState<Assunto[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const [selectedDisciplina, setSelectedDisciplina] = useState<string>("all")
  const [selectedAssunto, setSelectedAssunto] = useState<string>("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState<string>("")

  // Buscar disciplinas e assuntos da tabela subjects_topics
  const fetchAssuntos = useCallback(async () => {
    if (isLoading) return // Evitar múltiplas chamadas
    
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('subjects_topics')
        .select(`
          *,
          subjects:subject_id (
            name
          )
        `)
        .order('subject_id')
        .order('topic_name')

      if (error) {
        console.error('Erro ao buscar assuntos:', error)
        return
      }

      setAssuntos(data || [])
      
      // Extrair disciplinas únicas
      const disciplinasUnicas = [...new Set(data?.map(a => a.subjects?.name || `Subject ID: ${a.subject_id}`) || [])]
      setDisciplinas(disciplinasUnicas)
    } catch (error) {
      console.error('Erro ao buscar assuntos:', error)
    } finally {
      setIsLoading(false)
    }
  }, [isLoading])

  // Carregar dados apenas uma vez
  useEffect(() => {
    fetchAssuntos()
  }, []) // Apenas na montagem

  // Filtrar assuntos quando disciplina muda
  useEffect(() => {
    if (selectedDisciplina && selectedDisciplina !== "all") {
      const filtrados = assuntos.filter(a => a.subjects?.name === selectedDisciplina)
      setFilteredAssuntos(filtrados)
      setSelectedAssunto("all") // Reset assunto quando disciplina muda
    } else {
      setFilteredAssuntos([])
      setSelectedAssunto("all")
    }
  }, [selectedDisciplina, assuntos])

  // Aplicar filtros com debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onFiltersChange({
        disciplina: selectedDisciplina === "all" ? undefined : selectedDisciplina || undefined,
        assunto: selectedAssunto === "all" ? undefined : selectedAssunto || undefined,
        difficulty: selectedDifficulty === "all" ? undefined : selectedDifficulty || undefined,
        search: searchTerm || undefined
      })
    }, 300) // Debounce de 300ms

    return () => clearTimeout(timeoutId)
  }, [selectedDisciplina, selectedAssunto, selectedDifficulty, searchTerm, onFiltersChange])

  const clearFilters = useCallback(() => {
    setSelectedDisciplina("all")
    setSelectedAssunto("all")
    setSelectedDifficulty("all")
    setSearchTerm("")
  }, [])

  const hasActiveFilters = (selectedDisciplina && selectedDisciplina !== "all") || 
                          (selectedAssunto && selectedAssunto !== "all") || 
                          (selectedDifficulty && selectedDifficulty !== "all") || 
                          searchTerm

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtros
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Buscar questões..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Disciplina */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Disciplina
            </label>
            <Select value={selectedDisciplina} onValueChange={setSelectedDisciplina}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as disciplinas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as disciplinas</SelectItem>
                {disciplinas.map((disciplina) => (
                  <SelectItem key={disciplina} value={disciplina}>
                    {disciplina}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Assunto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assunto
            </label>
            <Select value={selectedAssunto} onValueChange={setSelectedAssunto}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os assuntos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os assuntos</SelectItem>
                {filteredAssuntos.map((assunto) => (
                  <SelectItem key={assunto.id} value={assunto.topic_name}>
                    {assunto.topic_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Dificuldade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dificuldade
            </label>
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as dificuldades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as dificuldades</SelectItem>
                <SelectItem value="easy">Fácil</SelectItem>
                <SelectItem value="medium">Médio</SelectItem>
                <SelectItem value="hard">Difícil</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filtros ativos */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600">Filtros ativos:</span>
            {selectedDisciplina !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Disciplina: {selectedDisciplina}
                <button
                  onClick={() => setSelectedDisciplina("all")}
                  className="ml-1 hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {selectedAssunto !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Assunto: {selectedAssunto}
                <button
                  onClick={() => setSelectedAssunto("all")}
                  className="ml-1 hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {selectedDifficulty !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Dificuldade: {selectedDifficulty === 'easy' ? 'Fácil' : selectedDifficulty === 'medium' ? 'Médio' : 'Difícil'}
                <button
                  onClick={() => setSelectedDifficulty("all")}
                  className="ml-1 hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {searchTerm && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Busca: {searchTerm}
                <button
                  onClick={() => setSearchTerm("")}
                  className="ml-1 hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="ml-2"
            >
              Limpar todos
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
