export interface EditTicketFormData {
  eventoId: string
  tipo: "normal" | "VIP"
  precio: number
  descripcion: string
  stockDisponible: number
}