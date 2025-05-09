import { useState, useEffect } from "react"
import type { ItemData } from "./data-table"
import type { EditEventFormData } from "../utils/types" // si lo extraes
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

interface EditEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: ItemData
  onSubmit: (data: EditEventFormData) => void
}

export function EditEventDialog({ open, onOpenChange, event, onSubmit }: EditEventDialogProps) {
  const [formData, setFormData] = useState<EditEventFormData>({
    organizerId: "",
    titulo: "",
    descripcion: "",
    direccion: "",
    fechaInicio: "",
    fechaFinalizacion: "",
    visibilidad: "público",
    estado: "draft",
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
        organizerId: "",
        titulo: event.titulo || "",
        descripcion: event.descripcion || "",
        direccion: event.direccion || "",
        fechaInicio: event.fechaInicio || "",
        fechaFinalizacion: event.fechaFinalizacion || "",
        visibilidad: event.visibilidad || "público",
        estado: event.estado || "draft",
        categorias: event.categorias || [],
        capacidad: event.capacidad || 0,
        bannerUrl: event.bannerUrl || "", // Asignar el Banner URL
        videoUrl: event.videoUrl || "", // Asignar el Video URL
        ubicacion: {
          lat: event.ubicacion?.lat || 0, // Asignar la Latitud
          lng: event.ubicacion?.lng || 0, // Asignar la Longitud
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
    setFormData((prev) => ({ ...prev, estado: value }))
  }

  const handleSubmit = () => {
    onSubmit(formData)
    onOpenChange(false)
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
              <SelectItem value="draft">Borrador</SelectItem>
              <SelectItem value="published">Publicado</SelectItem>
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
