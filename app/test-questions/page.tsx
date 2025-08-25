"use client"

import { useQuestions } from "@/lib/questions-context"

export default function TestQuestionsPage() {
  const { questions, subjects, isLoading } = useQuestions()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Teste - Página de Questões</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Status:</h2>
          <p>Loading: {isLoading ? 'Sim' : 'Não'}</p>
          <p>Questões: {questions?.length || 0}</p>
          <p>Disciplinas: {subjects?.length || 0}</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Primeiras 3 questões:</h2>
          {questions?.slice(0, 3).map((question, index) => (
            <div key={question.id} className="border p-4 mb-2 rounded">
              <p><strong>Questão {index + 1}:</strong></p>
              <p>ID: {question.id}</p>
              <p>Pergunta: {question.question.substring(0, 100)}...</p>
              <p>Resposta correta: {question.correct_answer} (tipo: {typeof question.correct_answer})</p>
              <p>Opções: {question.options?.length || 0}</p>
            </div>
          ))}
        </div>

        <div>
          <h2 className="text-lg font-semibold">Disciplinas:</h2>
          {subjects?.map((subject, index) => (
            <div key={subject.id} className="border p-2 mb-1 rounded">
              <p>{index + 1}. {subject.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}



