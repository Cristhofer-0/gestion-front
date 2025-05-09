export interface EditEventFormData {
  organizerId: string
  titulo: string
  descripcion: string
  direccion: string
  fechaInicio: string
  fechaFinalizacion: string
  visibilidad: "público" | "privado" | "solo invitación"
  estado: string
  categorias: string[]
  capacidad: number
  bannerUrl?: string
  videoUrl?: string
  ubicacion?: {
    lat: number
    lng: number
  }
}