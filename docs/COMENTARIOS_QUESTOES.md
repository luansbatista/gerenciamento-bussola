# 📝 Comentários das Questões

## Visão Geral

O sistema agora suporta comentários explicativos para as questões, permitindo que os administradores forneçam explicações detalhadas e comentários sobre cada questão.

## Campos Disponíveis

### 1. `comentario` (Comentário da Questão)
- **Tipo**: Texto opcional
- **Função**: Comentário explicativo geral sobre a questão
- **Exemplo**: "Esta questão trabalha com a habilidade de identificar a ideia central de um texto."

### 2. `explanation` (Explicação Detalhada)
- **Tipo**: Texto opcional
- **Função**: Explicação detalhada da resposta correta
- **Exemplo**: "A alternativa C é correta porque o texto apresenta uma visão equilibrada..."

## Como Usar

### 1. Importação via JSON

```json
{
  "disciplina": "Português",
  "assunto": "Compreensão de textos",
  "enunciado": "Leia o texto e responda...",
  "opcaoA": "Primeira alternativa",
  "opcaoB": "Segunda alternativa",
  "opcaoC": "Terceira alternativa",
  "opcaoD": "Quarta alternativa",
  "alternativaCorreta": "C",
  "nivel": "médio",
  "comentario": "Esta questão trabalha com interpretação de texto.",
  "explanation": "A alternativa C é correta porque..."
}
```

### 2. Importação via Excel/CSV

Adicione as colunas `comentario` e `explanation` ao seu arquivo:

| disciplina | assunto | enunciado | opcaoA | opcaoB | opcaoC | opcaoD | alternativaCorreta | nivel | comentario | explanation |
|------------|---------|-----------|--------|--------|--------|--------|-------------------|-------|------------|-------------|
| Português | Compreensão | Leia o texto... | Alt A | Alt B | Alt C | Alt D | C | médio | Comentário da questão | Explicação detalhada |

## Exibição no Frontend

### Para o Usuário
- Os comentários aparecem na seção de explicação após responder a questão
- São exibidos em uma caixa azul separada da explicação da resposta correta
- Ajudam o usuário a entender melhor o contexto da questão

### Estrutura Visual
```
┌─────────────────────────────────────┐
│ Explicação:                         │
│ Alternativa correta: C              │
│                                     │
│ ─────────────────────────────────── │
│ Comentário da Questão:              │
│ [Comentário explicativo]            │
│                                     │
│ ─────────────────────────────────── │
│ Explicação Detalhada:               │
│ [Explicação da resposta correta]    │
└─────────────────────────────────────┘
```

## Benefícios

### Para Administradores
- **Melhor organização**: Separação clara entre comentário geral e explicação específica
- **Flexibilidade**: Campos opcionais que não quebram questões existentes
- **Controle**: Pode adicionar comentários gradualmente

### Para Usuários
- **Aprendizado aprimorado**: Compreensão mais profunda das questões
- **Contexto adicional**: Informações sobre o que a questão está testando
- **Explicações detalhadas**: Justificativas completas das respostas corretas

## Exemplos Práticos

### Questão de Matemática
```json
{
  "comentario": "Esta é uma equação do primeiro grau simples. O aluno deve isolar a incógnita x.",
  "explanation": "Para resolver a equação 2x + 5 = 13:\n1) Subtraia 5 dos dois lados: 2x = 8\n2) Divida ambos os lados por 2: x = 4"
}
```

### Questão de História
```json
{
  "comentario": "Esta questão aborda a economia colonial brasileira, especificamente o ciclo do açúcar.",
  "explanation": "O açúcar foi o principal produto de exportação do Brasil durante o período colonial (séculos XVI-XVIII)."
}
```

### Questão de Português
```json
{
  "comentario": "Esta questão trabalha com a habilidade de identificar a ideia central de um texto.",
  "explanation": "A alternativa C é correta porque o texto apresenta uma visão equilibrada sobre a tecnologia."
}
```

## Migração de Questões Existentes

As questões existentes continuarão funcionando normalmente. Os campos `comentario` e `explanation` são opcionais e podem ser adicionados posteriormente através de:

1. **Edição manual** no painel administrativo
2. **Importação em lote** com os novos campos
3. **Atualização via SQL** direto no banco de dados

## Template Completo

Veja o arquivo `templates/questoes-com-comentarios.json` para exemplos completos de questões com comentários.




