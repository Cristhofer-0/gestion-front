"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { combinarFechaHora } from "../../../services/eventos"
import { useUser } from "@/hooks/useUser"
import type { ItemData } from "../types/ItemData"

import MapLibreMap from "@/components/principales/mapa"

interface CreateEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: EventFormData) => void
  existeEvento: ItemData[] // Agrego esto para ver si el evento ya existe dentro de las fechas
}

export interface EventFormData {
  organizerId: string
  title: string
  description: string
  startDate: Date | null
  startTime: string
  endDate: Date | null
  endTime: string
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

function formatDateToMySQLStringLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:00`
}

function formatDateToMySQLString(date: Date): string {
  // Convertir la fecha a UTC para evitar desfases por zona horaria
  const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000)
  return formatDateToMySQLStringLocal(utcDate)
}

export const adaptFormDataToItemData = (data: EventFormData): ItemData => {
const fechaInicioCompleta =
  data.startDate && data.startTime
    ? formatDateToMySQLString(combinarFechaHora(data.startDate, data.startTime))
    : undefined

const fechaFinCompleta =
  data.endDate && data.endTime
    ? formatDateToMySQLString(combinarFechaHora(data.endDate, data.endTime))
    : undefined

      
  return {
    organizerId: data.organizerId,
    titulo: data.title,
    descripcion: data.description,
    fechaInicio: fechaInicioCompleta,
    fechaFinalizacion: fechaFinCompleta,
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
  }
}

interface MapLibreMapHandle {
  handleSearch: () => void
}

// Función UploadImage
import { uploadImage } from "@/lib/uploadImage."

export function CreateEventDialog({ open, onOpenChange, onSubmit, existeEvento }: CreateEventDialogProps) {
  const user = useUser()
  const isOrganizer = user?.Role === "organizer"
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null)
  const mapRef = useRef<MapLibreMapHandle>(null)
  const [direccionError, setDireccionError] = useState<string | null>(null)

  const initialFormData: EventFormData = {
    organizerId: "",
    title: "",
    description: "",
    startDate: null,
    startTime: "09:00",
    endDate: null,
    endTime: "18:00",
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
    // Limpia el nombre de archivo seleccionado
    setSelectedFileName(null)
    // Reinicia el input file
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // ⬇️ Escucha cambios en el estado 'open'
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        organizerId: String(user.UserId), // user.id o el campo correcto que tengas
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

  const handleTimeChange = (name: "startTime" | "endTime", time: string) => {
    setFormData((prev) => ({ ...prev, [name]: time }))
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

    if (!formData.startTime) {
      newErrors.startTime = "La hora de inicio es obligatoria"
    }

    if (!formData.endTime) {
      newErrors.endTime = "La hora de finalización es obligatoria"
    }

    // Validar que la fecha y hora de fin sea posterior a la de inicio
    if (formData.startDate && formData.endDate && formData.startTime && formData.endTime) {
const fechaHoraInicio = combinarFechaHora(formData.startDate, formData.startTime)
const fechaHoraFin = combinarFechaHora(formData.endDate, formData.endTime)

      if (fechaHoraFin <= fechaHoraInicio) {
        newErrors.endDate = "La fecha y hora de finalización debe ser posterior a la de inicio"
        newErrors.endTime = "La fecha y hora de finalización debe ser posterior a la de inicio"
      }
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

    // Función para formatear la fecha manualmente evitando desfase por zona horaria
    const formatFechaLocal = (fechaStr: string) => {
      const [y, m, d] = fechaStr.split("T")[0].split("-")
      const fecha = new Date(Number(y), Number(m) - 1, Number(d))
      return fecha.toLocaleDateString("es-PE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    }

    // Validación de conflicto de evento por fecha y lugar
    const eventoConflictivo = existeEvento.find((ev) => {
      if (
        ev.direccion !== formData.address ||
        !ev.fechaInicio ||
        !ev.fechaFinalizacion ||
        !formData.startDate ||
        !formData.endDate
      ) {
        return false
      }

      const inicioExistente = new Date(ev.fechaInicio)
      const finExistente = new Date(ev.fechaFinalizacion)
const nuevaInicio = combinarFechaHora(formData.startDate, formData.startTime)
const nuevaFin = combinarFechaHora(formData.endDate, formData.endTime)

      // Verifica cualquier tipo de cruce de rangos
      return nuevaInicio < finExistente && nuevaFin > inicioExistente
    })

    if (eventoConflictivo) {
      const inicio = formatFechaLocal(eventoConflictivo.fechaInicio!)
      const fin = formatFechaLocal(eventoConflictivo.fechaFinalizacion!)

      setFormErrors((prev) => ({
        ...prev,
        startDate: `Ya existe un evento en esa ubicación entre el ${inicio} y el ${fin}`,
      }))
      return
    }

const startDateTime = combinarFechaHora(formData.startDate!, formData.startTime)
const endDateTime = combinarFechaHora(formData.endDate!, formData.endTime)

console.log("FECHA COMBINADA DE INICIO:", startDateTime)
console.log("FECHA COMBINADA DE FIN:", endDateTime)


    try {
      const itemData = adaptFormDataToItemData(formData)
      console.log("Datos a enviar al backend:", itemData)
      onSubmit({
        ...formData,
      startDate: startDateTime,
      endDate: endDateTime,
      })
      resetForm()
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
              <Input
                id="startDate"
                type="date"
                value={formatDateForInput(formData.startDate)}
                onChange={(e) => handleDateChange("startDate", e.target.value ? new Date(e.target.value) : undefined)}
                className={cn(formErrors.startDate && "border-red-500")}
                min={formatDateForInput(new Date())}
              />
              {formErrors.startDate && <p className="text-sm text-red-500">{formErrors.startDate}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="startTime">Hora de Inicio</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => handleTimeChange("startTime", e.target.value)}
                className={cn(formErrors.startTime && "border-red-500")}
              />
              {formErrors.startTime && <p className="text-sm text-red-500">{formErrors.startTime}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="endDate">Fecha de Finalización</Label>
              <Input
                id="endDate"
                type="date"
                value={formatDateForInput(formData.endDate)}
                onChange={(e) => handleDateChange("endDate", e.target.value ? new Date(e.target.value) : undefined)}
                className={cn(formErrors.endDate && "border-red-500")}
                min={formatDateForInput(formData.startDate || new Date())}
              />
              {formErrors.endDate && <p className="text-sm text-red-500">{formErrors.endDate}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">Hora de Finalización</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => handleTimeChange("endTime", e.target.value)}
                className={cn(formErrors.endTime && "border-red-500")}
              />
              {formErrors.endTime && <p className="text-sm text-red-500">{formErrors.endTime}</p>}
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
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    mapRef.current?.handleSearch()
                  }
                }}
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
            {/* <div className="space-y-2">
              <Label htmlFor="visibility">Visibilidad</Label>
              <Select
                value={formData.visibility}
                onValueChange={(value) => handleSelectChange("visibility", value)}
                disabled={isOrganizer}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar visibilidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Público</SelectItem>
                </SelectContent>
              </Select>
            </div> */}
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange("status", value)}
                disabled={isOrganizer}
              >
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
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddCategory()
                  }
                }}
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
            <Label htmlFor="bannerUrl">Imagen del Banner</Label>

            {formData.bannerUrl && (
              <div className="mb-3">
                <img
                  src={formData.bannerUrl || "/placeholder.svg"}
                  alt="Vista previa del banner"
                  style={{ maxWidth: "100%", marginTop: "1rem" }}
                />
              </div>
            )}

            {/* Input oculto */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              id="fileInput"
              className="sr-only"
              onChange={async (e) => {
                setUploadError(null)
                clearFieldError("bannerUrl")

                if (!e.target.files?.length) return

                const file = e.target.files[0]
                const maxSizeInMB = 10
                const maxSizeInBytes = maxSizeInMB * 1024 * 1024

                let errorMsg = ""

                if (file.type !== "image/webp") {
                  errorMsg += "Solo se permiten imágenes en formato .webp. \n"
                }

                if (file.size > maxSizeInBytes) {
                  const sizeInMB = (file.size / (1024 * 1024)).toFixed(2)
                  errorMsg += `La imagen pesa ${sizeInMB} MB. Máximo permitido: ${maxSizeInMB} MB. \n`
                }

                if (errorMsg) {
                  setUploadError(errorMsg.trim())
                  setFormData((prev) => ({ ...prev, bannerUrl: "" }))
                  fileInputRef.current && (fileInputRef.current.value = "")
                  setSelectedFileName(null)
                  return
                }

                const imageUrl = await uploadImage(file)
                if (imageUrl) {
                  setFormData((prev) => ({ ...prev, bannerUrl: imageUrl }))
                  setSelectedFileName(file.name)
                  setUploadError(null)
                } else {
                  setUploadError("Error al subir imagen. \n")
                  fileInputRef.current && (fileInputRef.current.value = "")
                  setSelectedFileName(null)
                }
              }}
            />

            {/* Botón personalizado para abrir el input */}
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-3 px-4 py-2 bg-blue-50 text-blue-700 rounded-md border border-blue-200 hover:bg-blue-100 text-sm font-semibold"
            >
              {selectedFileName ? "Cambiar imagen" : "Seleccionar imagen"}
            </Button>

            {/* Nombre del archivo seleccionado */}
            {selectedFileName && (
              <p className="text-sm text-gray-600 mt-1">
                Archivo seleccionado: <strong>{selectedFileName}</strong>
              </p>
            )}

            {/* Mensaje de error del formulario */}
            {formErrors.bannerUrl && <p className="text-sm text-red-500">{formErrors.bannerUrl}</p>}

            {/* Error de subida */}
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
