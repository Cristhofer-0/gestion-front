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

// para mostrar los datos en el formulario de edición en español
export interface EditEventFormData {
  organizerId: string
  titulo: string
  descripcion: string
  direccion: string
  fechaInicio: Date
  horaInicio: string
  fechaFinalizacion: Date
  horaFin: string
  visibilidad: "público" | "privado" | "solo invitación"
  estado: "borrador" | "publicado" | undefined
  categorias: string[]
  capacidad: number
  bannerUrl?: string
  videoUrl?: string
  ubicacion: {
    lat: number
    lng: number
  }
}