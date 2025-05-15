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

export interface EditEventFormData {
  organizerId: string
  titulo: string
  descripcion: string
  direccion: string
  fechaInicio: string
  fechaFinalizacion: string
  visibilidad: "público" | "privado" | "solo invitación"
  estado: "borrador" | "publicado" | undefined
  categorias: string[]
  capacidad: number
  bannerUrl?: string
  videoUrl?: string
  ubicacion?: {
    lat: number
    lng: number
  }
}