import { ItemData } from "../components/data-table"

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

export async function fetchEventos(): Promise<ItemData[]> {
	const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
	const response = await fetch(`${API_BASE_URL}/eventos`)
	if (!response.ok) {
		throw new Error("No se pudo obtener la lista de eventos")
	}

	const rawData = await response.json()

	const transformedData: ItemData[] = rawData.map((event: any) => ({
		id: event.EventId.toString(),
		orgId: event.OrganizerId.toString(),
		titulo: event.Title,
		descripcion: event.Description,
		//categoria: "General", // Puedes ajustar esto si tu evento tiene una categoría real
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
		bannerUrl: event.BannerUrl,
		videoUrl: event.VideoUrl,
		createdAt: event.createdAt,
		updatedAt: event.updatedAt
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
			StartDate: nuevoEvento.fechaInicio,
			EndDate: nuevoEvento.fechaFinalizacion,
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
		throw new Error("Ubicación inválida: latitud y longitud son obligatorias.");
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
			StartDate: eventoActualizado.fechaInicio,
			EndDate: eventoActualizado.fechaFinalizacion,
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
		const errorText = await response.text();
		console.error("Error en la respuesta de la API:", errorText);
		throw new Error("No se pudo editar el evento");
	}
}