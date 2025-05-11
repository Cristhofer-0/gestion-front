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

// Historial de eventos en memoria (en una aplicación real, esto estaría en una base de datos)
let eventHistory: EventHistoryItem[] = [
  {
    id: "hist1",
    eventId: "1",
    eventName: "Conferencia Anual",
    action: "created",
    description: "Se creó el evento con todos los detalles básicos",
    user: "admin@example.com",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 días atrás
  },
  {
    id: "hist2",
    eventId: "2",
    eventName: "Taller de Innovación",
    action: "created",
    description: "Se creó el evento con capacidad limitada",
    user: "organizador@example.com",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 día atrás
  },
  {
    id: "hist3",
    eventId: "1",
    eventName: "Conferencia Anual",
    action: "updated",
    description: "Se actualizó la capacidad de 400 a 500 personas",
    user: "admin@example.com",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 horas atrás
  },
  {
    id: "hist4",
    eventId: "3",
    eventName: "Networking Empresarial",
    action: "created",
    description: "Se creó el evento en estado borrador",
    user: "organizador@example.com",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 horas atrás
  },
  {
    id: "hist5",
    eventId: "3",
    eventName: "Networking Empresarial",
    action: "updated",
    description: "Se cambió la visibilidad a 'solo invitación'",
    user: "organizador@example.com",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 horas atrás
  },
]

// Función para registrar una acción en el historial
const addToHistory = (
  eventId: string,
  eventName: string,
  action: "created" | "updated" | "deleted",
  description: string,
  user = "usuario@example.com",
  details?: Record<string, any>,
): EventHistoryItem => {
  const historyItem: EventHistoryItem = {
    id: `hist${Date.now()}`,
    eventId,
    eventName,
    action,
    description,
    user,
    timestamp: new Date().toISOString(),
    details,
  }

  // Añadir al inicio para que los más recientes aparezcan primero
  eventHistory = [historyItem, ...eventHistory]
  return historyItem
}

// Función para obtener el historial de eventos
export async function fetchEventHistory(): Promise<EventHistoryItem[]> {
  // Simulamos un retraso para imitar una llamada a API
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Devolvemos el historial ordenado por fecha (más reciente primero)
  return eventHistory.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
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
	}))

	return transformedData
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