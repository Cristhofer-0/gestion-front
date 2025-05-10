import { useState, useEffect } from "react"
import type { ItemData } from "./data-table"
import type { EditEventFormData } from "../utils/types" // si lo extraes
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { editarEvento } from "../utils/eventos" // Asegúrate de que esta función esté definida

interface EditEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: ItemData
  onSubmit: (data: EditEventFormData) => void
}


export function EditEventDialog({ open, onOpenChange, event, onSubmit }: EditEventDialogProps) {
  const [categoryInput, setCategoryInput] = useState("") 
  const [formData, setFormData] = useState<EditEventFormData>({
    organizerId: event.organizerId,
    titulo: "",
    descripcion: "",
    direccion: "",
    fechaInicio: "",
    fechaFinalizacion: "",
    visibilidad: "público",
    estado: "borrador",
    categorias: [],
    capacidad: 0,
    bannerUrl: "",
    videoUrl: "",
    ubicacion: { lat: 0, lng: 0 },
  })

  // Actualiza formData cuando el evento cambie
  useEffect(() => {
    if (event) {
      setFormData({
        organizerId:  event.organizerId,
        titulo: event.titulo || "",
        descripcion: event.descripcion || "",
        direccion: event.direccion || "",
        fechaInicio: event.fechaInicio?.split("T")[0] || "",
        fechaFinalizacion: event.fechaFinalizacion?.split("T")[0] || "",
        visibilidad: event.visibilidad || "público",
        estado: event.estado || "draft" ? "borrador" : event.estado === "published" ? "publicado" : undefined,
        categorias: event.categorias || [],
        capacidad: event.capacidad || 0,
        bannerUrl: event.bannerUrl || "",
        videoUrl: event.videoUrl || "",
        ubicacion: {
          lat: event.ubicacion?.lat || 0,
          lng: event.ubicacion?.lng || 0,
        },
      })
    }
  }, [event]) // Solo se ejecutará cuando `event` cambie

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "latitude" || name === "longitude" ? parseFloat(value) || 0 : value,
    }))
  }

  const handleSelectChange = (value: "público" | "privado" | "solo invitación") => {
    setFormData((prev) => ({ ...prev, visibilidad: value }))
  }
  
  const handleStatusChange = (value: "draft" | "published") => {
    // Conversión de los valores de "draft" y "published" a "borrador" y "publicado"
    const estadoEnEspañol: "borrador" | "publicado" | undefined = 
      value === "draft" ? "borrador" : value === "published" ? "publicado" : undefined;

    // Actualizar el estado de 'estado' con el valor correcto
    setFormData((prev) => ({
      ...prev,
      estado: estadoEnEspañol,
    }));
  };

  const handleAddCategory = () => {
    const nuevaCategoria = categoryInput.trim()
    if (categoryInput.trim() && !formData.categorias.includes(categoryInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        categorias: [...prev.categorias, nuevaCategoria], 
      }))
      setCategoryInput("")
    }
  }

  const handleRemoveCategory = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      categorias: prev.categorias.filter((c) => c !== category),
    }))
  }

  const handleSubmit = async () => {
    if (!event.id) {
      console.error("ID del evento no definido")
      return
    }

    try {
      await editarEvento(event.id, {
        organizerId: formData.organizerId,
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        fechaInicio: formData.fechaInicio,
        fechaFinalizacion: formData.fechaFinalizacion,
        direccion: formData.direccion,
        visibilidad: formData.visibilidad,
        categoria: formData.categorias?.join(",") || "",
        capacidad: formData.capacidad,
        estado: formData.estado === "borrador" ? "draft" : "published",
        Latitude: String(formData.ubicacion?.lat || 0),
        Longitude: String(formData.ubicacion?.lng || 0),
        bannerUrl: formData.bannerUrl,
        videoUrl: formData.videoUrl,
      })
      onOpenChange(false)
    } catch (error) {
      console.error("Error al editar el evento:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Evento</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input name="titulo" value={formData.titulo} onChange={handleChange} placeholder="Título" />
          <Input name="descripcion" value={formData.descripcion} onChange={handleChange} placeholder="Descripción" />
          <Input name="direccion" value={formData.direccion} onChange={handleChange} placeholder="Dirección" />
          <Input name="fechaInicio" type="date" value={formData.fechaInicio} onChange={handleChange} />
          <Input name="fechaFinalizacion" type="date" value={formData.fechaFinalizacion} onChange={handleChange} />
          <Input name="capacidad" type="number" value={formData.capacidad} onChange={handleChange} />
          <Input name="categoryInput" value={categoryInput} onChange={(e) => setCategoryInput(e.target.value)}placeholder="Añadir categoría"/>
          {formData.categorias.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {formData.categorias.map((category, index) => (
                            <div key={index} className="flex items-center bg-muted rounded-md px-2 py-1">
                              <span className="text-sm">{category}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-5 w-5 p-0 ml-1"
                                onClick={() => handleRemoveCategory(category)}
                              >
                                ×
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
          <Button type="button" onClick={handleAddCategory}>
            Añadir
          </Button>
          <Select value={formData.visibilidad} onValueChange={handleSelectChange}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar visibilidad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Público</SelectItem>
              <SelectItem value="private">Privado</SelectItem>
              <SelectItem value="invite-only">Solo invitación</SelectItem>
            </SelectContent>
          </Select>

          {/* Select Estado */}
          <Select value={formData.estado} onValueChange={handleStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="borrador">Borrador</SelectItem>
              <SelectItem value="publicado">Publicado</SelectItem>
            </SelectContent>
          </Select>
          <Input name="bannerUrl" value={formData.bannerUrl} onChange={handleChange} placeholder="URL del Banner" />
            <Input name="videoUrl" value={formData.videoUrl} onChange={handleChange} placeholder="URL del Video" />
            <Input name="latitude" value={formData.ubicacion?.lat} onChange={handleChange} placeholder="Latitud" />
            <Input name="longitude" value={formData.ubicacion?.lng} onChange={handleChange} placeholder="Longitud" />
          <Button onClick={handleSubmit}>Guardar Cambios</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
