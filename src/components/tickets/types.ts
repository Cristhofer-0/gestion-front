export interface EditTicketFormData {
  eventoId: string
  tipo: "General" | "VIP"
  precio: number
  descripcion: string
  stockDisponible: number
}