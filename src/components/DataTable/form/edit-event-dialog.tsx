"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import type { ItemData } from "../types/ItemData"
import type { EditEventFormData } from "./types/EventFormData"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { editarEvento, combinarFechaHora, extraerFecha, extraerHora } from "../../../services/eventos"
import MapLibreMap from "@/components/principales/mapa"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { fetchOrders } from "@/services/orders"
import { uploadImage } from "@/lib/uploadImage."
import { Textarea } from "@/components/ui/textarea"

interface EditEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: ItemData
  onSubmit: (data: EditEventFormData & { id: string }) => void
  existeEvento: ItemData[]
}

interface MapLibreMapHandle {
  handleSearch: () => void
}

export const adaptEditFormDataToItemData = (data: EditEventFormData & { id: string }): ItemData => {
  // Combinar fecha y hora para crear el datetime completo
  const fechaInicioCompleta =
    data.fechaInicio && data.horaInicio
      ? combinarFechaHora(data.fechaInicio, data.horaInicio).toISOString()
      : undefined

  const fechaFinCompleta =
    data.fechaFinalizacion && data.horaFin
      ? combinarFechaHora(data.fechaFinalizacion, data.horaFin).toISOString()
      : undefined

  return {
    id: data.id,
    organizerId: data.organizerId,
    titulo: data.titulo,
    descripcion: data.descripcion,
    fechaInicio: fechaInicioCompleta,
    fechaFinalizacion: fechaFinCompleta,
    direccion: data.direccion,
    visibilidad: data.visibilidad,
    categorias: data.categorias,
    capacidad: Number(data.capacidad),
    estado: data.estado === "borrador" ? "draft" : "published",
    ubicacion: {
      lat: data.ubicacion?.lat ?? 0,
      lng: data.ubicacion?.lng ?? 0,
    },
    Latitude: String(data.ubicacion?.lat ?? 0),
    Longitude: String(data.ubicacion?.lng ?? 0),
    bannerUrl: data.bannerUrl,
    videoUrl: data.videoUrl,
  }
}

export function EditEventDialog({ open, onOpenChange, onSubmit, event, existeEvento }: EditEventDialogProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const mapRef = useRef<MapLibreMapHandle>(null)
  const [direccionError, setDireccionError] = useState<string | null>(null)
  const [categoryInput, setCategoryInput] = useState("")
  const [lat, setLat] = useState(0)
  const [lon, setLon] = useState(0)
  const [direc, setDirec] = useState("")
  const [originalFormData, setOriginalFormData] = useState<EditEventFormData | null>(null)
  const [hasPaidOrders, setHasPaidOrders] = useState(false)
  const [estadoError, setEstadoError] = useState<string | null>(null)

  const [formData, setFormData] = useState<EditEventFormData>({
    organizerId: event.organizerId,
    titulo: "",
    descripcion: "",
    direccion: "",
    fechaInicio: new Date(),
    horaInicio: "09:00",
    fechaFinalizacion: new Date(),
    horaFin: "18:00",
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
    console.log("Cantidad de eventos en existeEvento:", existeEvento?.length)
    if (event) {
      // Extraer fecha y hora por separado
      const fechaInicio = event.fechaInicio ? extraerFecha(event.fechaInicio) : new Date()
      const horaInicio = event.fechaInicio ? extraerHora(event.fechaInicio) : "09:00"
      const fechaFin = event.fechaFinalizacion ? extraerFecha(event.fechaFinalizacion) : new Date()
      const horaFin = event.fechaFinalizacion ? extraerHora(event.fechaFinalizacion) : "18:00"

      const initialData = {
        organizerId: event.organizerId,
        titulo: event.titulo || "",
        descripcion: event.descripcion || "",
        direccion: event.direccion || "",
        fechaInicio: fechaInicio,
        horaInicio: horaInicio,
        fechaFinalizacion: fechaFin,
        horaFin: horaFin,
        visibilidad: event.visibilidad || "público",
        estado: (event.estado === "draft" ? "borrador" : event.estado === "published" ? "publicado" : undefined) as
          | "borrador"
          | "publicado"
          | undefined,
        categorias: event.categorias || [],
        capacidad: event.capacidad || 0,
        bannerUrl: event.bannerUrl || "",
        videoUrl: event.videoUrl || "",
        ubicacion: {
          lat: event.ubicacion?.lat ?? 0,
          lng: event.ubicacion?.lng ?? 0,
        },
      }

      setFormData(initialData)
      setOriginalFormData(initialData)

      setLat(event.ubicacion?.lat ?? 0)
      setLon(event.ubicacion?.lng ?? 0)
      setDirec(event.direccion ?? "")
      setEstadoError(null)
    }
  }, [event])

  useEffect(() => {
    console.log("Actualizando ubicación:", lat, lon)
    setFormData((prev) => ({
      ...prev,
      direccion: direc,
      ubicacion: {
        lat,
        lng: lon,
      },
    }))
  }, [lat, lon, direc])

  // Limpiar errores y estados auxiliares cuando se abre el modal
  useEffect(() => {
    if (open) {
      setFormErrors({})
      setUploadError(null)
      setSelectedFileName(null)
      if ((lat === 0 || lon === 0) && formData.direccion) {
        mapRef.current?.handleSearch()
      }
    }
  }, [open])

  useEffect(() => {
    if (event?.id) {
      fetchOrders()
        .then((orders) => {
          console.log("Órdenes recibidas:", orders)

          const pagosDelEvento = orders.filter(
            (order) => String(order.eventoId) === String(event.id) && order.estadoPago?.toLowerCase() === "paid",
          )

          console.log("Entradas pagadas encontradas:", pagosDelEvento)
          setHasPaidOrders(pagosDelEvento.length > 0)
        })
        .catch((err) => {
          console.error("Error al obtener órdenes:", err)
          setHasPaidOrders(false)
        })
    }
  }, [event?.id])

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (formData.direccion && formData.direccion.length > 5) {
        mapRef.current?.handleSearch()
      }
    }, 1000)

    return () => clearTimeout(timeout)
  }, [formData.direccion])

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null)
    if (!e.target.files?.length) return

    const file = e.target.files[0]
    setSelectedFileName(file.name)
    const maxSizeInMB = 10
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024
    let errorMsg = ""

    if (file.type !== "image/webp") {
      errorMsg += "Solo se permiten imágenes en formato .webp.\n"
    }

    if (file.size > maxSizeInBytes) {
      const sizeInMB = (file.size / (1024 * 1024)).toFixed(2)
      errorMsg += `La imagen pesa ${sizeInMB} MB. Máximo permitido: ${maxSizeInMB} MB.`
    }

    if (errorMsg) {
      setUploadError(errorMsg.trim())
      setFormData((prev) => ({ ...prev, bannerUrl: "" }))
      if (fileInputRef.current) fileInputRef.current.value = ""
      return
    }

    const imageUrl = await uploadImage(file)
    if (imageUrl) {
      setFormData((prev) => ({ ...prev, bannerUrl: imageUrl }))
      setUploadError(null)
    } else {
      setUploadError("Error al subir imagen.")
      if (fileInputRef.current) fileInputRef.current.value = ""
      setSelectedFileName(null)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    if (name === "latitud" || name === "longitud") {
      const numericValue = Number.parseFloat(value) || 0
      setFormData((prev) => ({
        ...prev,
        ubicacion: {
          ...prev.ubicacion,
          lat: name === "latitud" ? numericValue : prev.ubicacion.lat,
          lng: name === "longitud" ? numericValue : prev.ubicacion.lng,
        },
      }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSelectChange = (value: "público" | "privado" | "solo invitación") => {
    setFormData((prev) => ({ ...prev, visibilidad: value }))
  }

  const handleStatusChange = (value: "draft" | "published") => {
    const estadoEnEspañol: "borrador" | "publicado" | undefined =
      value === "draft" ? "borrador" : value === "published" ? "publicado" : undefined

    const fechaFinEvento = formData.fechaFinalizacion
    const horaFinEvento = formData.horaFin
    const fechaHoraFin = new Date(`${fechaFinEvento.toISOString().split("T")[0]}T${horaFinEvento}:00`)
    const eventoYaTermino = fechaHoraFin < new Date()

    if (estadoEnEspañol === "borrador" && hasPaidOrders && !eventoYaTermino) {
      setEstadoError("No puedes desactivar eventos con entradas ya vendidas.")
      return
    }

    if (estadoEnEspañol === "publicado" && eventoYaTermino) {
      setEstadoError("No es posible publicar un evento cuya fecha y hora de finalización ya ha concluido.")
      return
    }

    setEstadoError(null)

    setFormData((prev) => ({
      ...prev,
      estado: estadoEnEspañol,
    }))
  }

  const handleAddCategory = (e: { preventDefault: () => void }) => {
    e.preventDefault()
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

  const handleDateChange = (name: "fechaInicio" | "fechaFinalizacion", date: Date | undefined) => {
    setFormData((prev) => ({ ...prev, [name]: date }))
  }

  const handleTimeChange = (name: "horaInicio" | "horaFin", time: string) => {
    setFormData((prev) => ({ ...prev, [name]: time }))
  }

  const handleClose = () => {
    if (originalFormData) {
      setFormData(originalFormData)
      setLat(originalFormData.ubicacion?.lat ?? 0)
      setLon(originalFormData.ubicacion?.lng ?? 0)
      setDirec(originalFormData.direccion)
    }
    setFormErrors({})
    onOpenChange(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const latActual = formData.ubicacion?.lat ?? 0
    const lonActual = formData.ubicacion?.lng ?? 0

    if (latActual === 0 || lonActual === 0) {
      setDireccionError("Ubicación inválida: latitud y longitud son obligatorias.")
      return
    }

    if (!event.id) {
      console.error("ID de evento no definido")
      return
    }

    // Validar que la fecha y hora de fin sea posterior a la de inicio
    const fechaHoraInicio = new Date(`${formData.fechaInicio.toISOString().split("T")[0]}T${formData.horaInicio}:00`)
    const fechaHoraFin = new Date(`${formData.fechaFinalizacion.toISOString().split("T")[0]}T${formData.horaFin}:00`)

    if (fechaHoraFin <= fechaHoraInicio) {
      setFormErrors({
        fechaFinalizacion: "La fecha y hora de finalización debe ser posterior a la de inicio",
        horaFin: "La fecha y hora de finalización debe ser posterior a la de inicio",
      })
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

    if (!existeEvento || !Array.isArray(existeEvento)) {
      console.warn("existeEvento no está definido o no es un array")
      return
    }

    // Validación de conflicto de evento por fecha y lugar
    const eventoConflictivo = existeEvento.find((ev) => {
      if (ev.id === event.id || ev.direccion !== formData.direccion || !ev.fechaInicio || !ev.fechaFinalizacion) {
        return false
      }

      const inicioExistente = new Date(ev.fechaInicio)
      const finExistente = new Date(ev.fechaFinalizacion)

      return fechaHoraInicio < finExistente && fechaHoraFin > inicioExistente
    })

    if (eventoConflictivo) {
      const inicio = formatFechaLocal(eventoConflictivo.fechaInicio!)
      const fin = formatFechaLocal(eventoConflictivo.fechaFinalizacion!)

      setFormErrors((prev) => ({
        ...prev,
        fechaInicio: `Ya existe un evento en esa ubicación entre el ${inicio} y el ${fin}`,
      }))
      return
    }

    try {
      const ubicacion = formData.ubicacion

      if (!ubicacion || ubicacion.lat === 0 || ubicacion.lng === 0) {
        setDireccionError("Ubicación inválida: latitud y longitud son obligatorias.")
        return
      }

      const mapEstado = {
        borrador: "draft",
        publicado: "published",
      } as const;

      type EstadoBackend = typeof mapEstado[keyof typeof mapEstado]; // "draft" | "published"

      const estadoBackend: EstadoBackend = mapEstado[formData.estado ?? "borrador"];


    const eventoActualizado = {
      organizerId: formData.organizerId,
      titulo: formData.titulo,
      descripcion: formData.descripcion,
    fechaInicio: combinarFechaHora(formData.fechaInicio, formData.horaInicio).toISOString(),
    fechaFinalizacion: combinarFechaHora(formData.fechaFinalizacion, formData.horaFin).toISOString(),
      direccion: formData.direccion,
      visibilidad: formData.visibilidad,
      categorias: formData.categorias,
      capacidad: formData.capacidad,
      estado: estadoBackend, // ✅ ya tipado
      ubicacion: ubicacion,
      Latitude: String(ubicacion.lat),
      Longitude: String(ubicacion.lng),
      bannerUrl: formData.bannerUrl,
      videoUrl: formData.videoUrl,
    }


      await editarEvento(event.id as string, eventoActualizado)
      onSubmit({
        ...formData,
        id: event.id,
      })
      console.log("Enviando datos:", eventoActualizado)
      onOpenChange(false)
    } catch (error) {
      console.error("Error al editar el evento:", error)
    }
  }

  // Función para formatear la fecha para el input date
  const formatDateForInput = (date: Date | null): string => {
    if (!date) return ""
    return date.toISOString().split("T")[0]
  }

  const ubicacionValida = lat !== 0 && lon !== 0

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          handleClose()
        } else {
          onOpenChange(open)
        }
      }}
    >
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Label htmlFor="title">Título</Label>
          <Input id="title" name="titulo" value={formData.titulo} onChange={handleChange} required />

          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            name="descripcion"
            value={formData.descripcion}
            onChange={(e) => setFormData((prev) => ({ ...prev, descripcion: e.target.value }))}
            rows={3}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fechaInicio">Fecha de Inicio</Label>
              <Input
                id="fechaInicio"
                type="date"
                value={formatDateForInput(formData.fechaInicio)}
                onChange={(e) => handleDateChange("fechaInicio", e.target.value ? new Date(e.target.value) : undefined)}
                className={cn(formErrors.fechaInicio && "border-red-500")}
                min={formatDateForInput(new Date())}
              />
              {formErrors.fechaInicio && <p className="text-sm text-red-500">{formErrors.fechaInicio}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="horaInicio">Hora de Inicio</Label>
              <Input
                id="horaInicio"
                type="time"
                value={formData.horaInicio}
                onChange={(e) => handleTimeChange("horaInicio", e.target.value)}
                className={cn(formErrors.horaInicio && "border-red-500")}
              />
              {formErrors.horaInicio && <p className="text-sm text-red-500">{formErrors.horaInicio}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fechaFinalizacion">Fecha de Finalización</Label>
              <Input
                id="fechaFinalizacion"
                type="date"
                value={formatDateForInput(formData.fechaFinalizacion)}
                onChange={(e) =>
                  handleDateChange("fechaFinalizacion", e.target.value ? new Date(e.target.value) : undefined)
                }
                className={cn(formErrors.fechaFinalizacion && "border-red-500")}
                min={formatDateForInput(formData.fechaInicio || new Date())}
              />
              {formErrors.fechaFinalizacion && <p className="text-sm text-red-500">{formErrors.fechaFinalizacion}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="horaFin">Hora de Finalización</Label>
              <Input
                id="horaFin"
                type="time"
                value={formData.horaFin}
                onChange={(e) => handleTimeChange("horaFin", e.target.value)}
                className={cn(formErrors.horaFin && "border-red-500")}
              />
              {formErrors.horaFin && <p className="text-sm text-red-500">{formErrors.horaFin}</p>}
            </div>
          </div>

          <Label htmlFor="direccion">Dirección</Label>
          <div className="flex gap-2">
            <Input
              id="direccion"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  mapRef.current?.handleSearch()
                }
              }}
              required
            />
            <Button type="button" onClick={() => mapRef.current?.handleSearch()}>
              Buscar
            </Button>
          </div>
          {direccionError && <p className="text-sm text-red-500">{direccionError}</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="latitud">Latitud</Label>
              <Input
                id="latitud"
                name="latitud"
                value={formData.ubicacion?.lat || ""}
                onChange={handleChange}
                placeholder={lat.toString()}
                type="number"
                step="0.000001"
              />
            </div>
            <div>
              <Label htmlFor="longitud">Longitud</Label>
              <Input
                id="longitud"
                name="longitud"
                value={formData.ubicacion?.lng || ""}
                onChange={handleChange}
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
              direccion={formData.direccion}
              lat={lat}
              lon={lon}
              mode="editar"
              setDireccionError={setDireccionError}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* <div>
              <Label htmlFor="visibilidad">Visibilidad</Label>
              <Select value={formData.visibilidad} onValueChange={handleSelectChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar visibilidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="público">Público</SelectItem>
                  <SelectItem value="privado">Privado</SelectItem>
                  <SelectItem value="solo invitación">Solo invitación</SelectItem>
                </SelectContent>
              </Select>
            </div> */}
            <div>
              <Label htmlFor="estado">Estado</Label>
              <Select value={formData.estado === "borrador" ? "draft" : "published"} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">Publicado</SelectItem>
                  <SelectItem value="draft">Borrador</SelectItem>
                </SelectContent>
              </Select>
              {estadoError && <p className="text-sm text-red-500">{estadoError}</p>}
            </div>
          </div>

          <div>
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
                    handleAddCategory(e)
                  }
                }}
              />
              <Button type="button" onClick={handleAddCategory}>
                Añadir
              </Button>
            </div>
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

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              id="fileInput"
              className="sr-only"
              onChange={handleImageChange}
            />

            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-3 px-4 py-2 bg-blue-50 text-blue-700 rounded-md border border-blue-200 hover:bg-blue-100 text-sm font-semibold"
            >
              {selectedFileName ? "Cambiar imagen" : "Seleccionar imagen"}
            </Button>

            {selectedFileName && (
              <p className="text-sm text-gray-600 mt-1">
                Archivo seleccionado: <strong>{selectedFileName}</strong>
              </p>
            )}

            {uploadError && (
              <ul className="text-sm text-red-500 mt-2 space-y-1">
                {uploadError.split("\n").map((msg, index) => (
                  <li key={index}>• {msg}</li>
                ))}
              </ul>
            )}
          </div>

          <Label htmlFor="videoUrl">URL del Video</Label>
          <Input id="videoUrl" name="videoUrl" value={formData.videoUrl} onChange={handleChange} required />

          <Label htmlFor="capacidad">Capacidad</Label>
          <Input
            id="capacidad"
            name="capacidad"
            value={formData.capacidad}
            onChange={(e) => setFormData((prev) => ({ ...prev, capacidad: Number(e.target.value) }))}
            type="number"
            min="0"
          />

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!ubicacionValida}>
              Guardar Cambios
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
