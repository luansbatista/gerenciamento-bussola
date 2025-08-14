"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FolderOpen, Search, Upload, Filter, Download, FileText, Shield } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

interface Material {
  id: string
  title: string
  description: string
  subject: string
  fileUrl: string
  fileName: string
  fileSize: string
  uploadedBy: string
  uploadedAt: string
  downloads: number
}

const subjects = [
  "Todas as Disciplinas",
  "Direito Constitucional",
  "Direito Penal",
  "Direito Processual Penal",
  "Legislação Específica PM",
  "Português",
  "Matemática",
  "Conhecimentos Gerais",
]

export default function MaterialsPage() {
  const { user } = useAuth()
  const [materials, setMaterials] = useState<Material[]>([])
  const [selectedSubject, setSelectedSubject] = useState("Todas as Disciplinas")
  const [searchTerm, setSearchTerm] = useState("")
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    subject: "",
    file: null as File | null,
  })

  const isAdmin = user?.email === "admin@pmba.com"

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === "application/pdf") {
      setUploadForm({ ...uploadForm, file })
    } else {
      alert("Por favor, selecione apenas arquivos PDF")
    }
  }

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault()
    if (!uploadForm.title || !uploadForm.subject || !uploadForm.file) return

    const newMaterial: Material = {
      id: Date.now().toString(),
      title: uploadForm.title,
      description: uploadForm.description,
      subject: uploadForm.subject,
      fileUrl: URL.createObjectURL(uploadForm.file),
      fileName: uploadForm.file.name,
      fileSize: (uploadForm.file.size / 1024 / 1024).toFixed(2) + " MB",
      uploadedBy: user?.name || "Admin",
      uploadedAt: new Date().toISOString(),
      downloads: 0,
    }

    setMaterials((prev) => [...prev, newMaterial])
    setUploadForm({ title: "", description: "", subject: "", file: null })
    setShowUploadModal(false)
  }

  const handleDownload = (material: Material) => {
    // Increment download count
    setMaterials((prev) => prev.map((m) => (m.id === material.id ? { ...m, downloads: m.downloads + 1 } : m)))

    // Create download link
    const link = document.createElement("a")
    link.href = material.fileUrl
    link.download = material.fileName
    link.click()
  }

  const filteredMaterials = materials.filter((material) => {
    const matchesSubject = selectedSubject === "Todas as Disciplinas" || material.subject === selectedSubject
    const matchesSearch =
      material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSubject && matchesSearch
  })

  return (
    <div>
      <div className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-transparent"></div>

        <div className="relative px-8 py-12 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg animate-bounce-subtle">
                <FolderOpen className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-emerald-100 bg-clip-text text-transparent">
                  Materiais de Estudo
                </h1>
                <p className="text-emerald-100 text-lg mt-2">
                  Acesse e organize seus materiais de preparação para a PMBA
                </p>
              </div>
            </div>
            {isAdmin && (
              <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
                <DialogTrigger asChild>
                  <Button className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20">
                    <Upload className="h-4 w-4 mr-2" />
                    Adicionar Material
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-emerald-600" />
                      Adicionar Novo Material (Admin)
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleUpload} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Título do Material</Label>
                        <Input
                          placeholder="Ex: Resumo Direito Constitucional"
                          value={uploadForm.title}
                          onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Disciplina</Label>
                        <Select
                          value={uploadForm.subject}
                          onValueChange={(value) => setUploadForm({ ...uploadForm, subject: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a disciplina" />
                          </SelectTrigger>
                          <SelectContent>
                            {subjects.slice(1).map((subject) => (
                              <SelectItem key={subject} value={subject}>
                                {subject}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Descrição</Label>
                      <Textarea
                        placeholder="Descreva o conteúdo do material..."
                        value={uploadForm.description}
                        onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Arquivo PDF</Label>
                      <Input type="file" accept=".pdf" onChange={handleFileUpload} />
                      {uploadForm.file && (
                        <p className="text-sm text-muted-foreground">Arquivo selecionado: {uploadForm.file.name}</p>
                      )}
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button type="submit" className="bg-gradient-to-r from-emerald-600 to-teal-600">
                        Adicionar Material
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowUploadModal(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 p-8 space-y-8">
        {/* Filtros e Busca */}
        <Card className="shadow-soft border-0 animate-fade-in-up animation-delay-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-emerald-600" />
              Filtros e Busca
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Disciplina</label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Buscar Material</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Digite o nome do material..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <div className="flex items-center gap-2 pt-2">
                  {isAdmin ? (
                    <Badge className="bg-green-100 text-green-800">
                      <Shield className="h-3 w-3 mr-1" />
                      Administrador
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Visualização</Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Materiais Disponíveis ({filteredMaterials.length})</h2>
            <Badge variant="secondary" className="text-sm">
              {selectedSubject}
            </Badge>
          </div>

          {filteredMaterials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMaterials.map((material, index) => (
                <Card
                  key={material.id}
                  className="shadow-soft border-0 hover:shadow-lg hover:scale-105 transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-emerald-600" />
                        <Badge variant="outline" className="text-xs">
                          {material.subject}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">{material.fileSize}</span>
                    </div>
                    <CardTitle className="text-lg">{material.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{material.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Por: {material.uploadedBy}</span>
                      <span>{material.downloads} downloads</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Adicionado: {new Date(material.uploadedAt).toLocaleDateString("pt-BR")}</span>
                    </div>
                    <Button
                      onClick={() => handleDownload(material)}
                      className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="shadow-soft border-0 animate-fade-in-up animation-delay-400">
              <CardContent className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <div className="p-4 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                    <FolderOpen className="h-10 w-10 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Nenhum material disponível</h3>
                  <p className="text-muted-foreground mb-6">
                    {isAdmin
                      ? "Comece adicionando os primeiros materiais de estudo para a PMBA."
                      : "Os materiais de estudo serão disponibilizados pelos administradores."}
                  </p>
                  {isAdmin && (
                    <Button
                      onClick={() => setShowUploadModal(true)}
                      className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Adicionar Primeiro Material
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
