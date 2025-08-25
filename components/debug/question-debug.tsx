"use client"

import { useState, useEffect } from 'react'

interface Question {
  id: string
  question: string
  correct_answer: string | number
  opcao_a?: string
  opcao_b?: string
  opcao_c?: string
  opcao_d?: string
  opcao_e?: string
}

interface QuestionDebugProps {
  question: Question
}

export function QuestionDebug({ question }: QuestionDebugProps) {
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState<number>(-1)
  const [correctLetter, setCorrectLetter] = useState<string>('')
  const [options, setOptions] = useState<string[]>([])

  useEffect(() => {
    console.log('🔍 QuestionDebug - Questão recebida:', {
      id: question.id,
      correct_answer: question.correct_answer,
      tipo: typeof question.correct_answer
    })

    // Calcular resposta correta
    let index = -1
    if (question.correct_answer !== null && question.correct_answer !== undefined) {
      if (typeof question.correct_answer === 'string') {
        index = parseInt(question.correct_answer, 10)
      } else {
        index = question.correct_answer
      }
    }

    // Garantir que seja válido
    if (isNaN(index) || index < 0 || index > 4) {
      index = 0
    }

    const letter = String.fromCharCode(97 + index).toUpperCase()

    console.log('🔍 QuestionDebug - Cálculo:', {
      original: question.correct_answer,
      parsed: index,
      letter
    })

    setCorrectAnswerIndex(index)
    setCorrectLetter(letter)

    // Criar opções
    const opts = []
    if (question.opcao_a && question.opcao_a.trim()) opts.push(question.opcao_a)
    if (question.opcao_b && question.opcao_b.trim()) opts.push(question.opcao_b)
    if (question.opcao_c && question.opcao_c.trim()) opts.push(question.opcao_c)
    if (question.opcao_d && question.opcao_d.trim()) opts.push(question.opcao_d)
    if (question.opcao_e && question.opcao_e.trim()) opts.push(question.opcao_e)

    setOptions(opts)

    console.log('🔍 QuestionDebug - Opções:', opts)
  }, [question])

  return (
    <div className="p-4 border-2 border-red-500 bg-red-50 rounded-lg">
      <h3 className="font-bold text-red-800 mb-2">🔍 DEBUG - Questão</h3>
      
      <div className="space-y-2 text-sm">
        <div><strong>ID:</strong> {question.id}</div>
        <div><strong>Pergunta:</strong> {question.question.substring(0, 50)}...</div>
        <div><strong>correct_answer (DB):</strong> "{question.correct_answer}" ({typeof question.correct_answer})</div>
        <div><strong>correctAnswerIndex:</strong> {correctAnswerIndex}</div>
        <div><strong>correctLetter:</strong> {correctLetter}</div>
        <div><strong>Opções:</strong> {options.length}</div>
      </div>

      <div className="mt-4">
        <h4 className="font-bold text-red-700 mb-2">Opções:</h4>
        {options.map((option, index) => {
          const isCorrect = index === correctAnswerIndex
          const letter = String.fromCharCode(65 + index)
          return (
            <div 
              key={index} 
              className={`p-2 mb-1 rounded ${isCorrect ? 'bg-green-200 border-green-500' : 'bg-gray-100'}`}
            >
              <strong>{letter})</strong> {option.substring(0, 30)}... 
              {isCorrect ? ' ✅ CORRETA' : ' ❌ INCORRETA'}
            </div>
          )
        })}
      </div>
    </div>
  )
}




