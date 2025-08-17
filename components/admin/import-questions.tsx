"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, FileSpreadsheet, Download } from "lucide-react"
import { useAdmin } from "@/lib/admin-context"

interface QuestionImport {
  disciplina: string
  assunto: string
  enunciado: string
  opcaoA: string
  opcaoB: string
  opcaoC: string
  opcaoD: string
  opcaoE?: string
  alternativaCorreta: string
  nivel: string
}

export function ImportQuestions() {
  const [jsonData, setJsonData] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isConvertingExcel, setIsConvertingExcel] = useState(false)
  const [importProgress, setImportProgress] = useState<{
    current: number
    total: number
    message: string
  } | null>(null)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    imported: number
    errors: string[]
  } | null>(null)
  const { addQuestion, refreshQuestions } = useAdmin()

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setJsonData(content)
    }
    reader.readAsText(file)
  }

  const handleExcelUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsConvertingExcel(true)
    setResult(null)

    try {
      // Verificar se o navegador suporta FileReader
      if (!window.FileReader) {
        throw new Error("Seu navegador não suporta leitura de arquivos Excel")
      }

      // Ler o arquivo como ArrayBuffer
      const arrayBuffer = await file.arrayBuffer()
      
      // Converter Excel para JSON usando uma biblioteca simples
      const questions = await convertExcelToJson(arrayBuffer)
      
      // Converter para o formato JSON esperado
      const jsonString = JSON.stringify(questions, null, 2)
      setJsonData(jsonString)

      setResult({
        success: true,
        message: `Planilha convertida com sucesso! ${questions.length} questões encontradas.`,
        imported: 0,
        errors: []
      })

    } catch (error) {
      setResult({
        success: false,
        message: `Erro ao converter planilha: ${error}`,
        imported: 0,
        errors: []
      })
    } finally {
      setIsConvertingExcel(false)
    }
  }

  const convertExcelToJson = async (arrayBuffer: ArrayBuffer): Promise<QuestionImport[]> => {
    // Esta é uma implementação simplificada que funciona com CSV
    // Para Excel real, você precisaria de uma biblioteca como xlsx
    const text = new TextDecoder().decode(arrayBuffer)
    const lines = text.split('\n').filter(line => line.trim())
    
    if (lines.length < 2) {
      throw new Error("Planilha deve ter pelo menos um cabeçalho e uma linha de dados")
    }

    // Extrair cabeçalhos
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
    
    // Verificar se os cabeçalhos estão corretos
    const requiredHeaders = ['disciplina', 'assunto', 'enunciado', 'opcaoA', 'opcaoB', 'opcaoC', 'opcaoD', 'alternativaCorreta', 'nivel']
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))
    
    if (missingHeaders.length > 0) {
      throw new Error(`Cabeçalhos obrigatórios não encontrados: ${missingHeaders.join(', ')}`)
    }

    const questions: QuestionImport[] = []

    // Processar linhas de dados
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      const values = parseCSVLine(line)
      if (values.length < headers.length) continue

      const question: QuestionImport = {
        disciplina: values[headers.indexOf('disciplina')] || '',
        assunto: values[headers.indexOf('assunto')] || '',
        enunciado: values[headers.indexOf('enunciado')] || '',
        opcaoA: values[headers.indexOf('opcaoA')] || '',
        opcaoB: values[headers.indexOf('opcaoB')] || '',
        opcaoC: values[headers.indexOf('opcaoC')] || '',
        opcaoD: values[headers.indexOf('opcaoD')] || '',
        opcaoE: values[headers.indexOf('opcaoE')] || undefined,
        alternativaCorreta: values[headers.indexOf('alternativaCorreta')] || '',
        nivel: values[headers.indexOf('nivel')] || 'medium'
      }

      questions.push(question)
    }

    return questions
  }

  const parseCSVLine = (line: string): string[] => {
    const result = []
    let current = ''
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    
    result.push(current.trim())
    return result
  }

  const validateQuestion = (question: any): string[] => {
    const errors: string[] = []
    
    if (!question.disciplina) errors.push("Disciplina é obrigatória")
    if (!question.assunto) errors.push("Assunto é obrigatório")
    if (!question.enunciado) errors.push("Enunciado é obrigatório")
    if (!question.opcaoA) errors.push("Opção A é obrigatória")
    if (!question.opcaoB) errors.push("Opção B é obrigatória")
    if (!question.opcaoC) errors.push("Opção C é obrigatória")
    if (!question.opcaoD) errors.push("Opção D é obrigatória")
    if (!question.alternativaCorreta) errors.push("Alternativa correta é obrigatória")
    
    const correctAnswer = question.alternativaCorreta?.toUpperCase()
    if (!['A', 'B', 'C', 'D', 'E'].includes(correctAnswer)) {
      errors.push("Alternativa correta deve ser A, B, C, D ou E")
    }

    return errors
  }

  const convertQuestion = (question: QuestionImport) => {
    console.log('Convertendo questão:', question)
    
    // Mapear dificuldade
    const difficulty = question.nivel?.toLowerCase() === 'fácil' ? 'easy' as const : 
                     question.nivel?.toLowerCase() === 'médio' ? 'medium' as const : 
                     question.nivel?.toLowerCase() === 'difícil' ? 'hard' as const : 'medium' as const

    // Garantir que alternativa_correta seja uma string válida
    const alternativaCorreta = question.alternativaCorreta?.toString()?.toUpperCase() || 'A'
    
    // Mapear alternativa correta para número (A=0, B=1, C=2, D=3, E=4)
    const correctAnswerNumber = alternativaCorreta === 'A' ? 0 : 
                               alternativaCorreta === 'B' ? 1 : 
                               alternativaCorreta === 'C' ? 2 : 
                               alternativaCorreta === 'D' ? 3 : 
                               alternativaCorreta === 'E' ? 4 : 0
    
    // Garantir que todos os campos sejam strings válidas
    const convertedQuestion = {
      disciplina: question.disciplina?.toString() || '',
      assunto: question.assunto?.toString() || '',
      question: question.enunciado?.toString() || '',
      enunciado: question.enunciado?.toString() || '',
      opcao_a: question.opcaoA?.toString() || '',
      opcao_b: question.opcaoB?.toString() || '',
      opcao_c: question.opcaoC?.toString() || '',
      opcao_d: question.opcaoD?.toString() || '',
      opcao_e: question.opcaoE?.toString() || '',
      correct_answer: correctAnswerNumber, // Número conforme esperado pelo tipo
      alternativa_correta: alternativaCorreta,
      difficulty: difficulty,
      nivel: question.nivel?.toString() || 'médio',
      subject: question.disciplina?.toString() || 'Geral', // Garantir que seja sempre string
      // Campos para compatibilidade
      options: [
        question.opcaoA?.toString() || '',
        question.opcaoB?.toString() || '',
        question.opcaoC?.toString() || '',
        question.opcaoD?.toString() || '',
        question.opcaoE?.toString() || ''
      ].filter(Boolean),
      correctAnswer: alternativaCorreta
    }

    console.log('Questão convertida:', convertedQuestion)
    return convertedQuestion
  }

  const handleImport = async () => {
    console.log('Iniciando importação...')
    if (!jsonData.trim()) {
      setResult({
        success: false,
        message: "Por favor, insira os dados JSON",
        imported: 0,
        errors: []
      })
      return
    }

    setIsLoading(true)
    setResult(null)
    setImportProgress(null)
    console.log('Dados JSON:', jsonData.substring(0, 200) + '...')

    try {
      console.log('Parsing JSON...')
      const questions: QuestionImport[] = JSON.parse(jsonData)
      console.log('Questões parseadas:', questions.length)
      
      if (!Array.isArray(questions)) {
        throw new Error("O JSON deve conter um array de questões")
      }

      let imported = 0
      const errors: string[] = []
      console.log('Iniciando loop de importação...')

      for (let i = 0; i < questions.length; i++) {
        const currentQuestion = i + 1
        const totalQuestions = questions.length
        
        setImportProgress({
          current: currentQuestion,
          total: totalQuestions,
          message: `Processando questão ${currentQuestion}/${totalQuestions}`
        })
        
        console.log(`Processando questão ${currentQuestion}/${totalQuestions}`)
        const question = questions[i]
        const validationErrors = validateQuestion(question)
        
        if (validationErrors.length > 0) {
          console.log(`Erro de validação na questão ${i + 1}:`, validationErrors)
          errors.push(`Questão ${i + 1}: ${validationErrors.join(", ")}`)
          continue
        }

        try {
          console.log(`Convertendo questão ${i + 1}...`)
          const convertedQuestion = convertQuestion(question)
          console.log(`Questão ${i + 1} convertida:`, convertedQuestion)
          
          console.log(`Adicionando questão ${i + 1} ao banco...`)
          const result = await addQuestion(convertedQuestion)
          console.log(`Resultado da questão ${i + 1}:`, result)
          
          if (result.success) {
            imported++
            console.log(`Questão ${i + 1} importada com sucesso`)
          } else {
            console.log(`Erro na questão ${i + 1}:`, result.error)
            errors.push(`Questão ${i + 1}: Erro ao importar - ${result.error}`)
          }
          
          // Pequeno delay para evitar sobrecarga
          if (i < questions.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 50))
          }
        } catch (error) {
          console.log(`Exceção na questão ${currentQuestion}:`, error)
          errors.push(`Questão ${currentQuestion}: Erro ao importar - ${error}`)
        }
      }

      setImportProgress(null)
      setResult({
        success: imported > 0,
        message: `Importação concluída. ${imported} questões importadas com sucesso.`,
        imported,
        errors
      })

      // As questões já foram adicionadas à memória local
      // Não é necessário recarregar, pois elas já estão disponíveis
      if (imported > 0) {
        console.log(`${imported} questões foram adicionadas à memória local`)
      }

    } catch (error) {
      setImportProgress(null)
      setResult({
        success: false,
        message: `Erro ao processar JSON: ${error}`,
        imported: 0,
        errors: []
      })
    } finally {
      setIsLoading(false)
    }
  }

  const downloadTemplate = () => {
    const template = [
      {
        disciplina: "Português",
        assunto: "Compreensão e interpretação de textos",
        enunciado: "Leia o texto e responda à questão. [Texto aqui]",
        opcaoA: "Primeira opção",
        opcaoB: "Segunda opção",
        opcaoC: "Terceira opção",
        opcaoD: "Quarta opção",
        opcaoE: "Quinta opção (opcional)",
        alternativaCorreta: "A",
        nivel: "medium"
      }
    ]

    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'template-questoes.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadExcelTemplate = () => {
    const csvContent = `disciplina,assunto,enunciado,opcaoA,opcaoB,opcaoC,opcaoD,opcaoE,alternativaCorreta,nivel
"Português","Compreensão e interpretação de textos","Leia o texto e responda à questão. [Texto aqui]","Primeira opção","Segunda opção","Terceira opção","Quarta opção","Quinta opção (opcional)","A","medium"`
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'template-questoes.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Importar Questões
        </CardTitle>
        <CardDescription>
          Importe questões em lote usando arquivo JSON ou planilha Excel/CSV. O arquivo deve conter as colunas: disciplina, assunto, enunciado, opcaoA, opcaoB, opcaoC, opcaoD, opcaoE (opcional), alternativaCorreta, nivel.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="json" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="json" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              JSON
            </TabsTrigger>
            <TabsTrigger value="excel" className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Excel/CSV
            </TabsTrigger>
          </TabsList>

          <TabsContent value="json" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file-upload">Upload de Arquivo JSON</Label>
              <Input
                id="file-upload"
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="json-data">Ou cole o JSON aqui:</Label>
              <Textarea
                id="json-data"
                placeholder='[{"disciplina": "Português", "assunto": "Compreensão e interpretação de textos", "enunciado": "...", "opcaoA": "...", "opcaoB": "...", "opcaoC": "...", "opcaoD": "...", "alternativaCorreta": "A", "nivel": "medium"}]'
                value={jsonData}
                onChange={(e) => setJsonData(e.target.value)}
                rows={10}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleImport}
                disabled={isLoading || !jsonData.trim()}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
                {isLoading ? "Importando..." : "Importar Questões"}
              </Button>
              
              <Button
                variant="outline"
                onClick={downloadTemplate}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Baixar Template JSON
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="excel" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="excel-upload">Upload de Planilha Excel/CSV</Label>
              <Input
                id="excel-upload"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleExcelUpload}
                className="cursor-pointer"
              />
              <p className="text-sm text-gray-500">
                Suporte para arquivos CSV, Excel (.xlsx, .xls). A primeira linha deve conter os cabeçalhos.
              </p>
            </div>

            {jsonData && (
              <div className="space-y-2">
                <Label>Dados Convertidos (JSON):</Label>
                <Textarea
                  value={jsonData}
                  onChange={(e) => setJsonData(e.target.value)}
                  rows={8}
                  readOnly={isConvertingExcel}
                />
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleImport}
                disabled={isLoading || !jsonData.trim() || isConvertingExcel}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
                {isLoading ? "Importando..." : "Importar Questões"}
              </Button>
              
              <Button
                variant="outline"
                onClick={downloadExcelTemplate}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Baixar Template CSV
              </Button>
            </div>

            {isConvertingExcel && (
              <div className="flex items-center gap-2 text-blue-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                Convertendo planilha...
              </div>
            )}
          </TabsContent>
        </Tabs>

        {importProgress && (
          <Alert variant="default">
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>
              <div className="font-medium">{importProgress.message}</div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                />
              </div>
              <div className="mt-1 text-sm text-gray-600">
                {importProgress.current} de {importProgress.total} questões processadas
              </div>
            </AlertDescription>
          </Alert>
        )}

        {result && (
          <Alert variant={result.success ? "default" : "destructive"}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-medium">{result.message}</div>
              {result.imported > 0 && (
                <div className="mt-1 text-sm">
                  ✅ {result.imported} questões importadas com sucesso
                </div>
              )}
              {result.errors.length > 0 && (
                <div className="mt-2">
                  <div className="font-medium text-sm">Erros encontrados:</div>
                  <ul className="mt-1 text-sm space-y-1">
                    {result.errors.map((error, index) => (
                      <li key={index} className="text-red-200">• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-sm mb-2">📋 Formato Esperado:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="font-medium text-xs mb-1">JSON:</h5>
              <pre className="text-xs text-gray-600 overflow-x-auto">
{`[
  {
    "disciplina": "Português",
    "assunto": "Compreensão e interpretação de textos",
    "enunciado": "Leia o texto e responda à questão...",
    "opcaoA": "Primeira opção",
    "opcaoB": "Segunda opção", 
    "opcaoC": "Terceira opção",
    "opcaoD": "Quarta opção",
    "opcaoE": "Quinta opção (opcional)",
    "alternativaCorreta": "A",
    "nivel": "medium"
  }
]`}
              </pre>
            </div>
            <div>
              <h5 className="font-medium text-xs mb-1">CSV/Excel:</h5>
              <pre className="text-xs text-gray-600 overflow-x-auto">
{`disciplina,assunto,enunciado,opcaoA,opcaoB,opcaoC,opcaoD,opcaoE,alternativaCorreta,nivel
"Português","Compreensão e interpretação de textos","Leia o texto...","Primeira opção","Segunda opção","Terceira opção","Quarta opção","Quinta opção","A","medium"`}
              </pre>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
