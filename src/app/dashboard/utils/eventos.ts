import { ItemData } from "../components/data-table"

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
		categoria: "General", // Puedes ajustar esto si tu evento tiene una categoría real
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

			OrganizerId: nuevoEvento.orgId,
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