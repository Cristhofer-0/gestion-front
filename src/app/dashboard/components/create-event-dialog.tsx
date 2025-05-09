"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { crearEvento } from "../utils/eventos"
import { ItemData } from "../components/data-table"

interface CreateEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: EventFormData) => void
}

export interface EventFormData {
  organizerId: string
  title: string
  description: string
  startDate: Date | null
  endDate: Date | null
  address: string
  latitude: string
  longitude: string
  visibility: string
  categories: string[]
  bannerUrl: string
  videoUrl: string
  status: string
  capacity: string
}

const adaptFormDataToItemData = (data: EventFormData): ItemData => ({
  organizerId: data.organizerId,
  titulo: data.title,
  descripcion: data.description,
  categoria: data.categories[0], // Ajusta según tu lógica
  fechaInicio: data.startDate?.toISOString(),
  fechaFinalizacion: data.endDate?.toISOString(),
  direccion: data.address,
  visibilidad: data.visibility as any,
  categorias: data.categories,
  capacidad: Number(data.capacity),
  estado: data.status as any,
  ubicacion: {
    lat: Number(data.latitude),
    lng: Number(data.longitude),
  },
  Latitude: data.latitude,
  bannerUrl: data.bannerUrl,
  videoUrl: data.videoUrl,
})


export function CreateEventDialog({ open, onOpenChange, onSubmit }: CreateEventDialogProps) {
  const [formData, setFormData] = useState<EventFormData>({
    organizerId: "",
    title: "",
    description: "",
    startDate: null,
    endDate: null,
    address: "",
    latitude: "",
    longitude: "",
    visibility: "public",
    categories: [],
    bannerUrl: "",
    videoUrl: "",
    status: "published",
    capacity: "",
  })

  const [categoryInput, setCategoryInput] = useState("")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDateChange = (name: "startDate" | "endDate", date: Date | undefined) => {
    setFormData((prev) => ({ ...prev, [name]: date }))
  }

  const handleAddCategory = () => {
    if (categoryInput.trim() && !formData.categories.includes(categoryInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        categories: [...prev.categories, categoryInput.trim()],
      }))
      setCategoryInput("")
    }
  }

  const handleRemoveCategory = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c !== category),
    }))
  }

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
 try {
    const itemData = adaptFormDataToItemData(formData)
    console.log("Datos a enviar al backend:", itemData) // 👈 Imprime aquí
    await crearEvento(itemData)
     setFormData({ // ← aquí se reinicia
      organizerId: "",
      title: "",
      description: "",
      startDate: null,
      endDate: null,
      address: "",
      latitude: "",
      longitude: "",
      visibility: "public",
      categories: [],
      bannerUrl: "",
      videoUrl: "",
      status: "published",
      capacity: "",
    })
    onOpenChange(false)
  } catch (error) {
    console.error("Error al crear el evento:", error)
  }
}

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Evento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="organizerId">ID del Organizador</Label>
              <Input
                id="organizerId"
                name="organizerId"
                value={formData.organizerId}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input id="title" name="title" value={formData.title} onChange={handleInputChange} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fecha de Inicio</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.startDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDate ? (
                      format(formData.startDate, "PPP", { locale: es })
                    ) : (
                      <span>Seleccionar fecha</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.startDate || undefined}
                    onSelect={(date) => handleDateChange("startDate", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Fecha de Finalización</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.endDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.endDate ? (
                      format(formData.endDate, "PPP", { locale: es })
                    ) : (
                      <span>Seleccionar fecha</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.endDate || undefined}
                    onSelect={(date) => handleDateChange("endDate", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Input id="address" name="address" value={formData.address} onChange={handleInputChange} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitud</Label>
              <Input
                id="latitude"
                name="latitude"
                value={formData.latitude}
                onChange={handleInputChange}
                type="number"
                step="0.000001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitud</Label>
              <Input
                id="longitude"
                name="longitude"
                value={formData.longitude}
                onChange={handleInputChange}
                type="number"
                step="0.000001"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="visibility">Visibilidad</Label>
              <Select value={formData.visibility} onValueChange={(value) => handleSelectChange("visibility", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar visibilidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Público</SelectItem>
                  <SelectItem value="private">Privado</SelectItem>
                  <SelectItem value="invite-only">Solo invitación</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">Publicado</SelectItem>
                  <SelectItem value="draft">Borrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="categories">Categorías</Label>
            <div className="flex gap-2">
              <Input
                id="categoryInput"
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value)}
                placeholder="Añadir categoría"
              />
              <Button type="button" onClick={handleAddCategory}>
                Añadir
              </Button>
            </div>
            {formData.categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.categories.map((category, index) => (
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bannerUrl">URL del Banner</Label>
              <Input id="bannerUrl" name="bannerUrl" value={formData.bannerUrl} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="videoUrl">URL del Video</Label>
              <Input id="videoUrl" name="videoUrl" value={formData.videoUrl} onChange={handleInputChange} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="capacity">Capacidad</Label>
            <Input
              id="capacity"
              name="capacity"
              value={formData.capacity}
              onChange={handleInputChange}
              type="number"
              min="0"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Crear Evento</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
