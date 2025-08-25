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
  comentario?: string // Comentário explicativo da questão
  explanation?: string // Explicação detalhada da resposta correta
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
    
    // Verificar se os cabeçalhos estão corretos - baseado na estrutura real da tabela
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
        nivel: values[headers.indexOf('nivel')] || 'médio',
        comentario: values[headers.indexOf('comentario')] || undefined,
        explanation: values[headers.indexOf('explanation')] || undefined
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
    
    // Mapear dificuldade baseado no nível
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
      difficulty: difficulty,
      nivel: question.nivel?.toString() || 'médio',
      subject: question.disciplina?.toString() || 'Geral', // Usar disciplina como subject
      comentario: question.comentario?.toString() || undefined, // Comentário da questão
      explanation: question.explanation?.toString() || undefined, // Explicação detalhada
      // Campo obrigatório para compatibilidade com o tipo Question
      options: [
        question.opcaoA?.toString() || '',
        question.opcaoB?.toString() || '',
        question.opcaoC?.toString() || '',
        question.opcaoD?.toString() || '',
        question.opcaoE?.toString() || ''
      ].filter(Boolean)
    }

    console.log('Questão convertida:', convertedQuestion)
    return convertedQuestion
  }

  const handleImport = async () => {
    console.log('🚀 Iniciando importação...')
    if (!jsonData.trim()) {
      console.log('❌ JSON vazio')
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
    console.log('📝 Dados JSON recebidos, tamanho:', jsonData.length)

    try {
      console.log('🔄 Parsing JSON...')
      const questions: QuestionImport[] = JSON.parse(jsonData)
      console.log('✅ JSON parseado com sucesso, questões:', questions.length)
      
      if (!Array.isArray(questions)) {
        console.log('❌ JSON não é um array')
        throw new Error("O JSON deve conter um array de questões")
      }

      let imported = 0
      const errors: string[] = []
      console.log('🔄 Iniciando processamento em lotes...')

      // Processar em lotes de 5 questões
      const batchSize = 5
      const totalBatches = Math.ceil(questions.length / batchSize)
      console.log(`🔍 Processando ${questions.length} questões em ${totalBatches} lotes de ${batchSize}`)

      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        const startIndex = batchIndex * batchSize
        const endIndex = Math.min(startIndex + batchSize, questions.length)
        const batchQuestions = questions.slice(startIndex, endIndex)
        
        console.log(`📦 Processando lote ${batchIndex + 1}/${totalBatches} (questões ${startIndex + 1}-${endIndex})`)
        
        setImportProgress({
          current: startIndex + 1,
          total: questions.length,
          message: `Processando lote ${batchIndex + 1}/${totalBatches}`
        })

        // Converter e validar questões do lote
        const validQuestions = []
        for (let i = 0; i < batchQuestions.length; i++) {
          const question = batchQuestions[i]
          const questionNumber = startIndex + i + 1
          
          console.log(`🔍 Validando questão ${questionNumber}...`)
          const validationErrors = validateQuestion(question)
          
          if (validationErrors.length > 0) {
            console.log(`❌ Erro de validação na questão ${questionNumber}:`, validationErrors)
            errors.push(`Questão ${questionNumber}: ${validationErrors.join(", ")}`)
            continue
          }

          try {
            console.log(`🔍 Convertendo questão ${questionNumber}...`)
            const convertedQuestion = convertQuestion(question)
            validQuestions.push(convertedQuestion)
            console.log(`✅ Questão ${questionNumber} convertida com sucesso`)
          } catch (error) {
            console.log(`❌ Erro ao converter questão ${questionNumber}:`, error)
            errors.push(`Questão ${questionNumber}: Erro na conversão - ${error}`)
          }
        }

        // Importar questões do lote
        if (validQuestions.length > 0) {
          console.log(`📤 Importando ${validQuestions.length} questões do lote ${batchIndex + 1}...`)
          
          for (let j = 0; j < validQuestions.length; j++) {
            const question = validQuestions[j]
            const questionNumber = startIndex + j + 1
            
            try {
              console.log(`📤 Adicionando questão ${questionNumber}...`)
              await addQuestion(question)
              imported++
              console.log(`✅ Questão ${questionNumber} importada com sucesso`)
              
              // Pequeno delay entre questões para evitar sobrecarga
              await new Promise(resolve => setTimeout(resolve, 300))
            } catch (error) {
              console.log(`❌ Erro ao importar questão ${questionNumber}:`, error)
              errors.push(`Questão ${questionNumber}: Erro na importação - ${error}`)
            }
          }
          
          // Delay entre lotes
          if (batchIndex < totalBatches - 1) {
            console.log(`⏳ Aguardando 1.5s antes do próximo lote...`)
            await new Promise(resolve => setTimeout(resolve, 1500))
          }
        }
      }

      console.log(`✅ Importação concluída. ${imported} questões importadas com sucesso.`)
      
      setResult({
        success: imported > 0,
        message: `Importação concluída! ${imported} questões importadas com sucesso.`,
        imported,
        errors
      })

      // Atualizar lista de questões
      if (imported > 0) {
        await refreshQuestions()
      }

    } catch (error) {
      console.error('❌ Erro durante importação:', error)
      setResult({
        success: false,
        message: `Erro durante importação: ${error}`,
        imported: 0,
        errors: [String(error)]
      })
    } finally {
      setIsLoading(false)
      setImportProgress(null)
    }
  }

  const downloadTemplate = () => {
    const template = [
      {
        disciplina: "Português",
        assunto: "Compreensão e interpretação de textos",
        enunciado: "Leia o texto a seguir e responda à questão...",
        opcaoA: "Primeira alternativa",
        opcaoB: "Segunda alternativa", 
        opcaoC: "Terceira alternativa",
        opcaoD: "Quarta alternativa",
        opcaoE: "Quinta alternativa (opcional)",
        alternativaCorreta: "A",
        nivel: "médio",
        comentario: "Comentário explicativo da questão (opcional)",
        explanation: "Explicação detalhada da resposta correta (opcional)"
      }
    ]

    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'template-questoes.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Importar Questões
          </CardTitle>
          <CardDescription>
            Importe questões de um arquivo JSON ou Excel/CSV. Certifique-se de que o arquivo siga o formato correto.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="json" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="json">JSON</TabsTrigger>
              <TabsTrigger value="excel">Excel/CSV</TabsTrigger>
            </TabsList>
            
            <TabsContent value="json" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="json-input">Dados JSON</Label>
                <Textarea
                  id="json-input"
                  placeholder="Cole aqui os dados JSON das questões..."
                  value={jsonData}
                  onChange={(e) => setJsonData(e.target.value)}
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>
              
              <div className="flex gap-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('json-file')?.click()}
                    className="flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Carregar Arquivo
                  </Button>
                  <Input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="json-file"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={downloadTemplate}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Baixar Template
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="excel" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="excel-input">Arquivo Excel/CSV</Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('excel-file')?.click()}
                    className="flex items-center gap-2"
                    disabled={isConvertingExcel}
                  >
                    {isConvertingExcel ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <FileSpreadsheet className="h-4 w-4" />
                    )}
                    {isConvertingExcel ? 'Convertendo...' : 'Selecionar Arquivo'}
                  </Button>
                  <Input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleExcelUpload}
                    className="hidden"
                    id="excel-file"
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Suporta arquivos .xlsx, .xls e .csv. Certifique-se de que as colunas estejam na ordem correta.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-2">
            <Button
              onClick={handleImport}
              disabled={isLoading || !jsonData.trim()}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {isLoading ? 'Importando...' : 'Importar Questões'}
            </Button>
          </div>

          {/* Progress */}
          {importProgress && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{importProgress.message}</span>
                <span>{importProgress.current} / {importProgress.total}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Result */}
          {result && (
            <Alert className={result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              <div className="flex items-center gap-2">
                {result.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={result.success ? "text-green-800" : "text-red-800"}>
                  {result.message}
                </AlertDescription>
              </div>
              
              {result.errors.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-red-800 mb-1">Erros encontrados:</p>
                  <ul className="text-sm text-red-700 space-y-1 max-h-32 overflow-y-auto">
                    {result.errors.map((error, index) => (
                      <li key={index} className="pl-2 border-l-2 border-red-300">
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}