import { OrderData } from "@/components/DataTable/types/OrderData"
import { ca } from "date-fns/locale"

export async function fetchOrders(): Promise<OrderData[]> {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
    const response = await fetch(`${API_BASE_URL}/orders`)
    if (!response.ok) {
        throw new Error("No se pudo obtener la lista de orders")
    }

    const rawData = await response.json()

    const transformedData: OrderData[] = rawData.map((order: any) => ({
        id: order.OrderId.toString(),
        userId: order.UserId.toString(),
        fullname: order.User?.FullName ?? "Sin Nombre" ,
        eventoId: order.EventId.toString(),
        titulo: order.Event?.Title ?? "Sin título" ,
        ticketId: order.TicketId.toString(),
        tipo: order.Ticket?.Type ?? "Sin tipo",
        cantidad: order.Quantity,
        totalPrecio: order.TotalPrice,
        estadoPago: order.PaymentStatus,
        ordenFecha: new Date(order.OrderDate).toLocaleDateString("es-ES", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        }),
    }))

    return transformedData
}
