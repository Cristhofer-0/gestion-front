import type { ItemData } from "@/components/DataTable/types/ItemData"

// Tipo para los elementos del historial
export interface EventHistoryItem {
  id: string
  eventId: string
  eventName: string
  action: "created" | "updated" | "deleted"
  description: string
  user: string
  timestamp: string
  details?: Record<string, any>
}

// Función para combinar fecha y hora en formato ISO
export const combinarFechaHora = (fecha: Date, hora: string): Date => {
  const [h, m] = hora.split(":").map(Number)
  const nuevaFecha = new Date(fecha)
  nuevaFecha.setHours(h, m, 0, 0)
  return nuevaFecha
}

// Función para extraer fecha de un datetime
export const extraerFecha = (datetime: string): Date => {
  return new Date(datetime.split("T")[0])
}

// Función para extraer hora de un datetime
export const extraerHora = (datetime: string): string => {
  const fecha = new Date(datetime)
  return fecha.toTimeString().slice(0, 5) // HH:mm
}

export async function fetchEventos(): Promise<ItemData[]> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
  const response = await fetch(`${API_BASE_URL}/eventos`)
  if (!response.ok) {
    throw new Error("No se pudo obtener la lista de eventos")
  }

  const rawData = await response.json()

  const transformedData: ItemData[] = rawData.map((event: any) => ({
    id: event.EventId.toString(),
    organizerId: event.OrganizerId.toString(),
    titulo: event.Title,
    descripcion: event.Description,
    fechaInicio: event.StartDate,
    fechaFinalizacion: event.EndDate,
    direccion: event.Address,
    visibilidad: event.Visibility,
    categorias: event.Categories?.split(",").map((c: string) => c.trim()) || [],
    capacidad: event.Capacity,
    estado: event.Status,
    ubicacion: {
      lat: event.Latitude,
      lng: event.Longitude,
    },
    Latitude: event.Latitude?.toString(),
    Longitude: event.Longitude?.toString(),
    bannerUrl: event.BannerUrl,
    videoUrl: event.VideoUrl,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
  }))

  return transformedData
}

export function generarHistorialDesdeEventos(eventos: ItemData[]): EventHistoryItem[] {
  const historial: EventHistoryItem[] = []

  eventos
    .filter((evento): evento is ItemData & { id: string } => !!evento.id)
    .forEach((evento) => {
      if (!evento.createdAt && evento.updatedAt) {
        // Solo hay updatedAt → lo tomamos como creado
        historial.push({
          id: `hist-${evento.id}-created`,
          eventId: evento.id,
          eventName: evento.titulo,
          action: "created",
          description: "Se creó el evento desde la API",
          user: "sistema@autogenerado",
          timestamp: evento.updatedAt,
        })
      } else if (evento.createdAt && evento.updatedAt) {
        if (evento.createdAt === evento.updatedAt) {
          // Mismo timestamp → creado
          historial.push({
            id: `hist-${evento.id}-created`,
            eventId: evento.id,
            eventName: evento.titulo ?? "Evento sin título",
            action: "created",
            description: "Se creó el evento",
            user: "sistema@autogenerado",
            timestamp: evento.createdAt,
          })
        } else {
          // Diferente → creado + actualizado
          historial.push({
            id: `hist-${evento.id}-created`,
            eventId: evento.id,
            eventName: evento.titulo,
            action: "created",
            description: "Se creó el evento",
            user: "sistema@autogenerado",
            timestamp: evento.createdAt,
          })
          historial.push({
            id: `hist-${evento.id}-updated`,
            eventId: evento.id,
            eventName: evento.titulo,
            action: "updated",
            description: "Se actualizó el evento",
            user: "sistema@autogenerado",
            timestamp: evento.updatedAt,
          })
        }
      }
    })

  return historial
}

export async function crearEvento(nuevoEvento: ItemData): Promise<void> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

  const response = await fetch(`${API_BASE_URL}/eventos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      OrganizerId: nuevoEvento.organizerId,
      Title: nuevoEvento.titulo,
      Description: nuevoEvento.descripcion,
      StartDate: nuevoEvento.fechaInicio, // Ya viene como string ISO con fecha y hora
      EndDate: nuevoEvento.fechaFinalizacion, // Ya viene como string ISO con fecha y hora
      Address: nuevoEvento.direccion,
      Visibility: nuevoEvento.visibilidad,
      Categories: nuevoEvento.categorias?.join(",") || "",
      Capacity: nuevoEvento.capacidad,
      Status: nuevoEvento.estado,
      Latitude: nuevoEvento.ubicacion?.lat,
      Longitude: nuevoEvento.ubicacion?.lng,
      BannerUrl: nuevoEvento.bannerUrl,
      VideoUrl: nuevoEvento.videoUrl,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error("Error en la respuesta de la API:", errorText)
    throw new Error("No se pudo crear el evento")
  }
}

export async function editarEvento(eventoId: string, eventoActualizado: ItemData): Promise<void> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

  if (
    !eventoActualizado.ubicacion ||
    typeof eventoActualizado.ubicacion.lat !== "number" ||
    typeof eventoActualizado.ubicacion.lng !== "number"
  ) {
    throw new Error("Ubicación inválida: latitud y longitud son obligatorias.")
  }

  const response = await fetch(`${API_BASE_URL}/eventos/${eventoId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      OrganizerId: eventoActualizado.organizerId,
      Title: eventoActualizado.titulo,
      Description: eventoActualizado.descripcion,
      StartDate: eventoActualizado.fechaInicio, // Ya viene como string ISO con fecha y hora
      EndDate: eventoActualizado.fechaFinalizacion, // Ya viene como string ISO con fecha y hora
      Address: eventoActualizado.direccion,
      Visibility: eventoActualizado.visibilidad,
      Categories: eventoActualizado.categorias?.join(",") || "",
      Capacity: eventoActualizado.capacidad,
      Status: eventoActualizado.estado,
      Latitude: eventoActualizado.ubicacion.lat,
      Longitude: eventoActualizado.ubicacion.lng,
      BannerUrl: eventoActualizado.bannerUrl,
      VideoUrl: eventoActualizado.videoUrl,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error("Error en la respuesta de la API:", errorText)
    throw new Error("No se pudo editar el evento")
  }
}

export async function fetchEventosByOrganizador(organizadorId: string): Promise<ItemData[]> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
  const response = await fetch(`${API_BASE_URL}/eventos/organizador/${organizadorId}`)
  if (!response.ok) {
    throw new Error("No se pudo obtener los eventos por organizador")
  }

  const rawData = await response.json()

  const transformedData: ItemData[] = rawData.map((event: any) => ({
    id: event.EventId.toString(),
    organizerId: event.OrganizerId.toString(),
    titulo: event.Title,
    descripcion: event.Description,
    fechaInicio: event.StartDate,
    fechaFinalizacion: event.EndDate,
    direccion: event.Address,
    visibilidad: event.Visibility,
    categorias: event.Categories?.split(",").map((c: string) => c.trim()) || [],
    capacidad: event.Capacity,
    estado: event.Status,
    ubicacion: {
      lat: event.Latitude,
      lng: event.Longitude,
    },
    Latitude: event.Latitude?.toString(),
    Longitude: event.Longitude?.toString(),
    bannerUrl: event.BannerUrl,
    videoUrl: event.VideoUrl,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
  }))

  return transformedData
}
