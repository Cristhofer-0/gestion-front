"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
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
import { crearEvento } from "../../../services/eventos"
import { useUser } from "@/hooks/useUser";
import type { ItemData } from "../types/ItemData"

import MapLibreMap from "@/components/principales/mapa"

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
  Longitude: data.longitude,
  bannerUrl: data.bannerUrl,
  videoUrl: data.videoUrl,
})

interface MapLibreMapHandle {
  handleSearch: () => void
}

// Función UploadImage
import { uploadImage } from "@/lib/uploadImage."

export function CreateEventDialog({ open, onOpenChange }: CreateEventDialogProps) {
  const user = useUser();
  const isOrganizer = user?.Role === "organizer";
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const mapRef = useRef<MapLibreMapHandle>(null);
  const [direccionError, setDireccionError] = useState<string | null>(null);
  const initialFormData: EventFormData = {
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
    status: "draft",
    capacity: "",
  }

  const [formData, setFormData] = useState<EventFormData>(initialFormData)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const [categoryInput, setCategoryInput] = useState("")
  const [lat, setLat] = useState(0)
  const [lon, setLon] = useState(0)
  const [direc, setDirec] = useState("")

  const resetForm = () => {
    setFormData(initialFormData)
    setCategoryInput("")
    setLat(0)
    setLon(0)
    setDirec("")
    setDireccionError(null)
    setUploadError(null)
    setFormErrors({})
  }

  // ⬇️ Escucha cambios en el estado 'open'
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        organizerId: String(user.UserId) // user.id o el campo correcto que tengas
      }))
    }
  }, [user])

  // Función para limpiar errores específicos cuando el usuario empieza a escribir
  const clearFieldError = (fieldName: string) => {
    if (formErrors[fieldName]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[fieldName]
        return newErrors
      })
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Limpiar error del campo cuando el usuario empieza a escribir
    clearFieldError(name)
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Limpiar error del campo cuando el usuario selecciona un valor
    clearFieldError(name)
  }

  const handleDateChange = (name: "startDate" | "endDate", date: Date | undefined) => {
    setFormData((prev) => ({ ...prev, [name]: date }))
    // Limpiar error del campo cuando el usuario selecciona una fecha
    clearFieldError(name)
  }

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat.toString(),
      longitude: lon.toString(),
      address: direc,
    }))
  }, [lat, lon, direc])

  const handleAddCategory = () => {
    if (categoryInput.trim() && !formData.categories.includes(categoryInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        categories: [...prev.categories, categoryInput.trim()],
      }))
      setCategoryInput("")
      // Limpiar error de categorías cuando se añade una categoría
      clearFieldError("categories")
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

    // Resetear los errores
    setFormErrors({})

    // Campos Obligatorios
    const requiredFields: (keyof EventFormData)[] = [
      "organizerId",
      "title",
      "description",
      "address",
      "bannerUrl",
      "videoUrl",
    ]
    const newErrors: Record<string, string> = {}

    requiredFields.forEach((field) => {
      if (!formData[field]) {
        newErrors[field] = "Este campo es obligatorio"
      }
    })

    if (!formData.startDate) {
      newErrors.startDate = "La fecha de inicio es obligatoria"
    }

    if (!formData.endDate) {
      newErrors.endDate = "La fecha de finalización es obligatoria"
    }

    // Categorias obligatorias
    if (formData.categories.length === 0) {
      newErrors.categories = "Debe añadir al menos una categoría"
    }

    // Validar que la capacidad sea un número positivo
    if (formData.capacity) {
      const capacityNum = Number(formData.capacity)
      if (isNaN(capacityNum)) {
        newErrors.capacity = "La capacidad debe ser un número"
      } else if (capacityNum <= 0) {
        newErrors.capacity = "La capacidad debe ser un número positivo"
      }
    } else {
      newErrors.capacity = "La capacidad es obligatoria"
    }

    // Si hay errores, no se permite crear un evento
    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors)
      return
    }

    try {
      const itemData = adaptFormDataToItemData(formData)
      console.log("Datos a enviar al backend:", itemData)
      await crearEvento(itemData)
      setFormData({
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

    // Función para formatear la fecha para el input date
  const formatDateForInput = (date: Date | null): string => {
    if (!date) return ""
    return date.toISOString().split("T")[0]
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Evento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="hidden" name="organizerId" value={formData.organizerId} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className={formErrors.title ? "border-red-500" : ""}
            />
            {formErrors.title && <p className="text-sm text-red-500">{formErrors.title}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              required
              className={formErrors.description ? "border-red-500" : ""}
            />
            {formErrors.description && <p className="text-sm text-red-500">{formErrors.description}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Fecha de Inicio</Label>
              <div className="relative">
                <Input
                  id="startDate"
                  type="date"
                  value={formatDateForInput(formData.startDate)}
                  onChange={(e) => handleDateChange("startDate", e.target.value ? new Date(e.target.value) : undefined)}
                  className={cn(formErrors.startDate && "border-red-500")}
                  min={formatDateForInput(new Date())}
                />
              </div>
              {formErrors.startDate && <p className="text-sm text-red-500">{formErrors.startDate}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Fecha de Finalización</Label>
              <div className="relative">
                <Input
                  id="endDate"
                  type="date"
                  value={formatDateForInput(formData.endDate)}
                  onChange={(e) => handleDateChange("endDate", e.target.value ? new Date(e.target.value) : undefined)}
                  className={cn(formErrors.endDate && "border-red-500")}
                  min={formatDateForInput(formData.startDate || new Date())}
                />
              </div>
              {formErrors.endDate && <p className="text-sm text-red-500">{formErrors.endDate}</p>}
            </div>
          </div>


          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <div className="flex gap-2">
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                className={formErrors.address ? "border-red-500" : ""}
              />
              <Button type="button" onClick={() => mapRef.current?.handleSearch()}>
                Buscar
              </Button>
            </div>
            {formErrors.address && <p className="text-sm text-red-500">{formErrors.address}</p>}
            {direccionError && <p className="text-sm text-red-500">{direccionError}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitud</Label>
              <Input
                id="latitude"
                name="latitude"
                value={formData.latitude}
                onChange={handleInputChange}
                placeholder={lat.toString()}
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
                placeholder={lon.toString()}
                type="number"
                step="0.000001"
              />
            </div>
          </div>

          <div className="h-[300px] overflow-hidden mt-4">
            <Label htmlFor="map">MAPA</Label>
            <MapLibreMap
              ref={mapRef}
              setLati={setLat}
              setLoni={setLon}
              setDireccion={setDirec}
              direccion={formData.address}
              lat={-12.018419}
              lon={-76.971028}
              mode="crear"
              setDireccionError={setDireccionError}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="visibility">Visibilidad</Label>
              <Select value={formData.visibility} onValueChange={(value) => handleSelectChange("visibility", value)} disabled={isOrganizer}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar visibilidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Público</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)} disabled={isOrganizer}>
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
                className={formErrors.categories ? "border-red-500" : ""}
              />
              <Button type="button" onClick={handleAddCategory}>
                Añadir
              </Button>
            </div>
            {formErrors.categories && <p className="text-sm text-red-500">{formErrors.categories}</p>}
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

          <div className="mb-6">
            <Label htmlFor="bannerUrl">URL del Banner</Label>
            {formData.bannerUrl && (
              <div className="mb-3">
                <img
                  src={formData.bannerUrl}
                  alt="Vista previa del banner"
                  style={{ maxWidth: "100%", marginTop: "1rem" }}
                />
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              id="fileInput"
              required
              className={`block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100 ${formErrors.bannerUrl ? "border-red-500" : ""}`}
              onChange={async (e) => {
                setUploadError(null) // Limpiar errores anteriores
                clearFieldError("bannerUrl") // Limpiar error cuando el usuario selecciona un archivo

                if (!e.target.files?.length) return

                const file = e.target.files[0]
                const maxSizeInMB = 10
                const maxSizeInBytes = maxSizeInMB * 1024 * 1024

                let errorMsg = ""

                // Verificar formato
                if (file.type !== "image/webp") {
                  errorMsg += "Solo se permiten imágenes en formato .webp. \n"
                }

                // Verificar tamaño
                if (file.size > maxSizeInBytes) {
                  const sizeInMB = (file.size / (1024 * 1024)).toFixed(2)
                  errorMsg += `La imagen pesa ${sizeInMB} MB. Máximo permitido: ${maxSizeInMB} MB. \n`
                }

                if (errorMsg) {
                  setUploadError(errorMsg.trim())
                  setFormData((prev) => ({ ...prev, bannerUrl: "" }))
                  fileInputRef.current && (fileInputRef.current.value = "")
                  return
                }

                // Subida
                const imageUrl = await uploadImage(file)
                if (imageUrl) {
                  setFormData((prev) => ({ ...prev, bannerUrl: imageUrl }))
                  setUploadError(null)
                } else {
                  setUploadError("Error al subir imagen. \n")
                  fileInputRef.current && (fileInputRef.current.value = "")
                }
              }}
            />
            {formErrors.bannerUrl && <p className="text-sm text-red-500">{formErrors.bannerUrl}</p>}
            {uploadError && (
              <ul className="text-sm text-red-500 mt-2 space-y-1">
                {uploadError.split("\n").map((msg, index) => (
                  <li key={index}>• {msg}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="videoUrl">URL del Video</Label>
            <Input
              id="videoUrl"
              name="videoUrl"
              value={formData.videoUrl}
              onChange={handleInputChange}
              required
              className={formErrors.videoUrl ? "border-red-500" : ""}
            />
            {formErrors.videoUrl && <p className="text-sm text-red-500">{formErrors.videoUrl}</p>}
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
              className={formErrors.capacity ? "border-red-500" : ""}
            />
            {formErrors.capacity && <p className="text-sm text-red-500">{formErrors.capacity}</p>}
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
