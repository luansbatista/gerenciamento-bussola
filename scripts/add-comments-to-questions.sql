-- =====================================================
-- ADICIONAR CAMPO DE COMENTÁRIOS À TABELA DE QUESTÕES
-- =====================================================

-- Adicionar coluna de comentários à tabela questions
ALTER TABLE public.questions 
ADD COLUMN IF NOT EXISTS comentario TEXT,
ADD COLUMN IF NOT EXISTS explanation TEXT;

-- Adicionar comentário à coluna para documentação
COMMENT ON COLUMN public.questions.comentario IS 'Comentário explicativo da questão';
COMMENT ON COLUMN public.questions.explanation IS 'Explicação detalhada da resposta correta';

-- Verificar se as colunas foram adicionadas
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'questions' 
AND table_schema = 'public'
AND column_name IN ('comentario', 'explanation');



