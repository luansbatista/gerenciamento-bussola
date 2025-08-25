"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { 
  FolderOpen, 
  Upload, 
  FileText, 
  Video, 
  Image, 
  Download, 
  Plus, 
  Search,
  Filter,
  Calendar,
  User
} from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { useAuth } from "@/lib/auth-context"
import { useSidebar } from "@/lib/sidebar-context"

interface Material {
  id: string
  title: string
  description: string | null
  subject: string | null
  file_url: string | null
  file_type: string | null
  created_by: string
  created_at: string
}

export default function MaterialsPage() {
  const { isCollapsed } = useSidebar()
  const { user } = useAuth()
  const supabase = createClient()
  
  const [materials, setMaterials] = useState<Material[]>([])
  const [subjects, setSubjects] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  
  const [newMaterial, setNewMaterial] = useState({
    title: "",
    description: "",
    subject: "",
    file_url: "",
    file_type: ""
  })

  // Verificar se o usuário é admin
  const isAdmin = user?.isAdmin || user?.role === "admin"

  // Carregar materiais do banco
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setIsLoading(true)
        
        const { data, error } = await supabase
          .from('materials')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Erro ao carregar materiais:', error)
          return
        }

        setMaterials(data || [])
        
        // Extrair disciplinas únicas
        const uniqueSubjects = Array.from(new Set(
          data?.map(m => m.subject).filter(Boolean) || []
        ))
        setSubjects(uniqueSubjects)
      } catch (error) {
        console.error('Erro ao carregar materiais:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMaterials()
  }, [supabase])

  const handleUploadMaterial = async () => {
    // Verificar se o usuário é admin
    if (!isAdmin) {
      alert('Apenas administradores podem adicionar materiais')
      return
    }

    if (!user?.id || !newMaterial.title || !newMaterial.subject) {
      alert('Preencha todos os campos obrigatórios')
      return
    }

    try {
      const { data, error } = await supabase
        .from('materials')
        .insert({
          title: newMaterial.title,
          description: newMaterial.description || null,
          subject: newMaterial.subject,
          file_url: newMaterial.file_url || null,
          file_type: newMaterial.file_type || null,
          created_by: user.id
        })
        .select()
        .single()

      if (error) {
        console.error('Erro ao enviar material:', error)
        alert('Erro ao enviar material')
        return
      }

      // Adicionar à lista
      setMaterials(prev => [data, ...prev])
      
      // Limpar formulário
      setNewMaterial({
        title: "",
        description: "",
        subject: "",
        file_url: "",
        file_type: ""
      })
      setShowUploadForm(false)
      
      alert('Material enviado com sucesso!')
    } catch (error) {
      console.error('Erro ao enviar material:', error)
      alert('Erro ao enviar material')
    }
  }

  const getFileIcon = (fileType: string | null) => {
    if (!fileType) return <FileText className="h-6 w-6" />
    
    if (fileType.includes('pdf')) return <FileText className="h-6 w-6 text-red-500" />
    if (fileType.includes('video')) return <Video className="h-6 w-6 text-blue-500" />
    if (fileType.includes('image')) return <Image className="h-6 w-6 text-green-500" />
    
    return <FileText className="h-6 w-6" />
  }

  const filteredMaterials = materials.filter(material => {
    const matchesSubject = selectedSubject === "all" || material.subject === selectedSubject
    const matchesSearch = material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (material.description && material.description.toLowerCase().includes(searchTerm.toLowerCase()))
    
    return matchesSubject && matchesSearch
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  return (
    <div className="min-h-screen">
      {/* Header com gradiente */}
      <div className="relative bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-transparent"></div>

        <div className="relative px-8 py-12 animate-fade-in-up">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg animate-bounce-subtle">
              <FolderOpen className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
                Materiais de Estudo
              </h1>
              <p className="text-purple-100 text-lg mt-2">
                Acesse e compartilhe materiais complementares para seus estudos
              </p>
              {!isAdmin && (
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    Modo Visualização
                  </Badge>
                  <span className="text-purple-200 text-sm">
                    Apenas administradores podem adicionar materiais
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Filtros e Busca */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar materiais..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full md:w-80"
              />
            </div>
            
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Todas as disciplinas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as disciplinas</SelectItem>
                {subjects.map(subject => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Botão de upload só para administradores */}
          {isAdmin && (
            <Button
              onClick={() => setShowUploadForm(!showUploadForm)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Enviar Material
            </Button>
          )}
        </div>

        {/* Formulário de Upload */}
        {showUploadForm && (
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-purple-600" />
                Enviar Novo Material
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={newMaterial.title}
                    onChange={(e) => setNewMaterial(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Título do material"
                  />
                </div>
                
                <div>
                  <Label htmlFor="subject">Disciplina *</Label>
                  <Select 
                    value={newMaterial.subject} 
                    onValueChange={(value) => setNewMaterial(prev => ({ ...prev, subject: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a disciplina" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Português">Português</SelectItem>
                      <SelectItem value="Matemática">Matemática</SelectItem>
                      <SelectItem value="História do Brasil">História do Brasil</SelectItem>
                      <SelectItem value="Geografia do Brasil">Geografia do Brasil</SelectItem>
                      <SelectItem value="Direito Constitucional">Direito Constitucional</SelectItem>
                      <SelectItem value="Direito Administrativo">Direito Administrativo</SelectItem>
                      <SelectItem value="Direito Penal">Direito Penal</SelectItem>
                      <SelectItem value="Informática">Informática</SelectItem>
                      <SelectItem value="Atualidades">Atualidades</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={newMaterial.description}
                  onChange={(e) => setNewMaterial(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição do material..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="file_url">URL do Arquivo</Label>
                  <Input
                    id="file_url"
                    value={newMaterial.file_url}
                    onChange={(e) => setNewMaterial(prev => ({ ...prev, file_url: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
                
                <div>
                  <Label htmlFor="file_type">Tipo de Arquivo</Label>
                  <Select 
                    value={newMaterial.file_type} 
                    onValueChange={(value) => setNewMaterial(prev => ({ ...prev, file_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="video">Vídeo</SelectItem>
                      <SelectItem value="image">Imagem</SelectItem>
                      <SelectItem value="document">Documento</SelectItem>
                      <SelectItem value="presentation">Apresentação</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleUploadMaterial} className="flex-1">
                  <Upload className="h-4 w-4 mr-2" />
                  Enviar Material
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowUploadForm(false)}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de Materiais */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando materiais...</p>
          </div>
        ) : filteredMaterials.length === 0 ? (
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardContent className="text-center py-12">
              <FolderOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum material encontrado</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedSubject !== "all" 
                  ? "Tente ajustar os filtros de busca" 
                  : "Aguardando materiais serem adicionados pelos administradores."
                }
              </p>
              {!searchTerm && selectedSubject === "all" && isAdmin && (
                <Button onClick={() => setShowUploadForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Enviar Primeiro Material
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMaterials.map((material) => (
              <Card key={material.id} className="shadow-xl border-0 bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getFileIcon(material.file_type)}
                      <div>
                        <CardTitle className="text-lg">{material.title}</CardTitle>
                        {material.subject && (
                          <Badge variant="secondary" className="mt-1">
                            {material.subject}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {material.description && (
                    <p className="text-gray-600 text-sm line-clamp-3">
                      {material.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(material.created_at)}
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      Usuário
                    </div>
                  </div>

                  {material.file_url && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => material.file_url && window.open(material.file_url, '_blank')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Acessar Material
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
