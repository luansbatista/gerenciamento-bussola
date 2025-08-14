import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export default async function TestConnectionPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // Teste 1: Buscar matérias
  const { data: subjects, error: subjectsError } = await supabase
    .from('subjects')
    .select('*')
    .limit(5)

  // Teste 2: Buscar questões
  const { data: questions, error: questionsError } = await supabase
    .from('questions')
    .select('*')
    .limit(3)

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">Teste de Conexão Supabase</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Teste de Matérias */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-blue-600">Matérias</h2>
          {subjectsError ? (
            <div className="text-red-500">
              <p>Erro ao buscar matérias:</p>
              <pre className="text-sm">{JSON.stringify(subjectsError, null, 2)}</pre>
            </div>
          ) : (
            <div>
              <p className="text-green-600 mb-3">✅ Conexão bem-sucedida!</p>
              <p className="text-gray-600 mb-3">Encontradas {subjects?.length || 0} matérias:</p>
              <ul className="space-y-2">
                {subjects?.map((subject) => (
                  <li key={subject.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: subject.color }}
                    ></div>
                    <span className="font-medium">{subject.name}</span>
                    <span className="text-sm text-gray-500">({subject.total_questions} questões)</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Teste de Questões */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-green-600">Questões</h2>
          {questionsError ? (
            <div className="text-red-500">
              <p>Erro ao buscar questões:</p>
              <pre className="text-sm">{JSON.stringify(questionsError, null, 2)}</pre>
            </div>
          ) : (
            <div>
              <p className="text-green-600 mb-3">✅ Conexão bem-sucedida!</p>
              <p className="text-gray-600 mb-3">Encontradas {questions?.length || 0} questões:</p>
              <ul className="space-y-3">
                {questions?.map((question) => (
                  <li key={question.id} className="p-3 bg-gray-50 rounded">
                    <p className="font-medium text-sm mb-2">{question.question.substring(0, 100)}...</p>
                    <div className="flex gap-2 text-xs">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                        {question.difficulty}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded">
                        {question.year}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Status Geral */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Status da Conexão</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${subjectsError ? 'bg-red-500' : 'bg-green-500'}`}></div>
            <span>Matérias: {subjectsError ? 'Erro' : 'OK'}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${questionsError ? 'bg-red-500' : 'bg-green-500'}`}></div>
            <span>Questões: {questionsError ? 'Erro' : 'OK'}</span>
          </div>
        </div>
        
        {!subjectsError && !questionsError && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
            <p className="text-green-800 font-medium">🎉 Tudo funcionando perfeitamente!</p>
            <p className="text-green-600 text-sm">O Supabase está configurado e conectado com sucesso.</p>
          </div>
        )}
      </div>
    </div>
  )
}
