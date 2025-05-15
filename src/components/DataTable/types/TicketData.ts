export type TicketData = {
  id?: string
  eventoId: string
  tipo: "General" | "VIP"
  titulo: string
  precio: number
  descripcion: string
  stockDisponible: number
}