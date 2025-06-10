export type OrderData = {
  id?: string
  userId: string
  fullname: string
  eventoId: string
  titulo: string
  ticketId: string
  tipo: string
  cantidad: number
  totalPrecio: number
  estadoPago: "Paid" | "Pending" 
  ordenFecha: string
}
