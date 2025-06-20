//import { Type } from "lucide-react"
import { TicketData } from "@/components/DataTable/types/TicketData"
//import { Description } from "@radix-ui/react-dialog"

export async function fetchTickets(): Promise<TicketData[]> {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
    const response = await fetch(`${API_BASE_URL}/tickets`)
    if (!response.ok) {
        throw new Error("No se pudo obtener la lista de tickets")
    }

    const rawData = await response.json()

    const transformedData: TicketData[] = rawData.map((ticket: any) => ({
        id: ticket.TicketId.toString(),
        eventoId: ticket.EventId.toString(),
        tipo: ticket.Type,
        precio: ticket.Price,
        titulo: ticket.Event?.Title ?? "Sin título" ,
        //categoria: "General", // Puedes ajustar esto si tu evento tiene una categoría real
        descripcion: ticket.Description,
        stockDisponible: ticket.StockAvailable,  
    }))

    return transformedData
}

export async function crearTicket(nuevoTicket: TicketData): Promise<void> {
	const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

	const response = await fetch(`${API_BASE_URL}/tickets`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({

			EventId: nuevoTicket.eventoId,
			Type: nuevoTicket.tipo,
            Price: nuevoTicket.precio,
            Description: nuevoTicket.descripcion,
            StockAvailable: nuevoTicket.stockDisponible,	
		}),
	})

	if (!response.ok) {
		throw new Error("No se pudo crear el ticket")
	}
}  

export async function editarTicket(ticketId: string, ticketActualizado: TicketData): Promise<void> {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

    const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            EventId: ticketActualizado.eventoId,
            Type: ticketActualizado.tipo,
            Description: ticketActualizado.descripcion,
            Price: ticketActualizado.precio,
            StockAvailable: ticketActualizado.stockDisponible, 
        }),
    })

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Error en la respuesta de la API:", errorText);
        throw new Error("No se pudo editar el ticket");
    }
}

export async function fetchTicketsByOrganizador(organizadorId: string): Promise<TicketData[]> {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

    if (!organizadorId) {
        throw new Error("organizadorId es requerido");
    }

    const response = await fetch(`${API_BASE_URL}/tickets/organizador/${organizadorId}`);
    if (!response.ok) {
        throw new Error("No se pudo obtener la lista de tickets del organizador");
    }

    const rawData = await response.json();

    const transformedData: TicketData[] = rawData.map((ticket: any) => ({
        id: ticket.TicketId.toString(),
        eventoId: ticket.EventId.toString(),
        tipo: ticket.Type,
        precio: ticket.Price,
        titulo: ticket.Event?.Title ?? "Sin título",
        descripcion: ticket.Description,
        stockDisponible: ticket.StockAvailable,
    }));

    return transformedData;
}