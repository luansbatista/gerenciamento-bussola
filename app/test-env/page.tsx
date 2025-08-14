export default function TestEnvPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Teste de Variáveis de Ambiente</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Variáveis do Supabase:</h2>
          <div className="bg-gray-100 p-4 rounded mt-2">
            <p><strong>NEXT_PUBLIC_SUPABASE_URL:</strong></p>
            <p className="text-sm text-gray-600 break-all">
              {process.env.NEXT_PUBLIC_SUPABASE_URL || 'NÃO DEFINIDA'}
            </p>
            
            <p className="mt-4"><strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong></p>
            <p className="text-sm text-gray-600 break-all">
              {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 50) + '...' : 
                'NÃO DEFINIDA'
              }
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Status:</h2>
          <div className="bg-gray-100 p-4 rounded mt-2">
            <p className={process.env.NEXT_PUBLIC_SUPABASE_URL ? 'text-green-600' : 'text-red-600'}>
              URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Definida' : '❌ Não definida'}
            </p>
            <p className={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'text-green-600' : 'text-red-600'}>
              Chave: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Definida' : '❌ Não definida'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
