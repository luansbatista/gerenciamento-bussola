# Pasta de Imagens - Bússola da Aprovação

## 📁 **Estrutura da Pasta:**
```
public/images/
├── README.md
└── logo-bussola-aprovacao.png (você deve adicionar aqui)
```

## 🖼️ **Logo da Bússola da Aprovação:**

### **Arquivo Necessário:**
- **Nome:** `logo-bussola-aprovacao.png`
- **Formato:** PNG (recomendado) ou JPG
- **Dimensões:** 175x175px (quadrada)
- **Fundo:** Transparente (PNG) ou branco

### **Como Adicionar:**
1. Coloque sua imagem da logo nesta pasta
2. Renomeie para: `logo-bussola-aprovacao.png`
3. Certifique-se de que a imagem tem boa qualidade

## 🎯 **Onde a Logo Aparece:**

### **Páginas que Usam a Logo:**
- ✅ **Login** (`/login`) - Logo centralizada no topo
- ✅ **Signup** (`/signup`) - Logo centralizada no topo
- 🔄 **Outras páginas** - Pode ser adicionada conforme necessário

### **Componente que Usa a Logo:**
```typescript
// Arquivo: components/ui/logo-image.tsx
import { LogoImage } from "@/components/ui/logo-image"

// Uso:
<LogoImage size="lg" />
```

## 📏 **Tamanhos Disponíveis:**
- **`sm`** - 48px de altura
- **`md`** - 64px de altura (padrão)
- **`lg`** - 80px de altura

## 🔧 **Configuração:**

### **Se sua logo tiver dimensões diferentes:**
Edite o arquivo `components/ui/logo-image.tsx` e ajuste:
```typescript
width={175}  // Largura da sua logo
height={175}  // Altura da sua logo
```

### **Se quiser mudar o nome do arquivo:**
Edite o arquivo `components/ui/logo-image.tsx` e altere:
```typescript
src="/images/SEU_NOME_DE_ARQUIVO.png"
```

## ✅ **Próximos Passos:**
1. **Adicione** sua logo nesta pasta
2. **Renomeie** para `logo-bussola-aprovacao.png`
3. **Teste** as páginas de login e signup
4. **Ajuste** as dimensões se necessário
