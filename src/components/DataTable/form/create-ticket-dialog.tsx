"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { crearTicket } from "../../../services/tickets" // Asegúrate de que esta función esté definida
import { ItemData } from "../data-table-tickets"
import { useUser } from "@/hooks/useUser"  // IMPORTANTE
import { fetchEventos, fetchEventosByOrganizador } from "../../../services/eventos" // Asegúrate de que esta función esté definida

interface CreateTicketDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (data: TicketFormData) => void
}

export interface TicketFormData {
    EventId: string
    type: string
    price: string
    description: string
    stockAvailable: string
}

const adaptFormDataToItemData = (data: TicketFormData): ItemData => ({
    eventoId: data.EventId,
    tipo: data.type as "General" | "VIP", // Ensure type matches the expected union type
    precio: parseFloat(data.price), // Convert price to a number
    descripcion: data.description,
    titulo: "Sin título", // Placeholder, adjust as needed
    stockDisponible: parseInt(data.stockAvailable, 10), // Convert stockAvailable to a number
})


export function CreateTicketDialog({ open, onOpenChange, onSubmit }: CreateTicketDialogProps) {
    const user = useUser()

    const [formData, setFormData] = useState<TicketFormData>({
        EventId: "",
        type: "General",
        price: "",
        description: "",
        stockAvailable: "",
    })

    const [eventos, setEventos] = useState<{ EventId: string; Title: string }[]>([])

    useEffect(() => {
        const cargarEventos = async () => {
            if (!user) return;

            try {
                let eventosData = [];

                if (user.Role === "organizer") {
                    // Solo eventos del organizador
                    eventosData = await fetchEventosByOrganizador(user.UserId.toString());
                } else {
                    // Admin u otros roles: traer todos los eventos
                    eventosData = await fetchEventos();
                }

                const eventosParaSelect = eventosData.map((e) => ({
                    EventId: String(e.id),
                    Title: e.titulo,
                }));

                setEventos(eventosParaSelect);
            } catch (error) {
                console.error("Error cargando eventos:", error);
            }
        };

        cargarEventos();
    }, [user]);


    const [categoryInput, setCategoryInput] = useState("")

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleDateChange = (name: "startDate" | "endDate", date: Date | undefined) => {
        setFormData((prev) => ({ ...prev, [name]: date }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const itemData = adaptFormDataToItemData(formData)
            console.log("Datos a enviar al backend:", itemData) // 👈 Imprime aquí
            await crearTicket(itemData)
            setFormData({ // ← aquí se reinicia
                EventId: "",
                type: "General",
                price: "",
                description: "",
                stockAvailable: "",
            })
            onOpenChange(false)
        } catch (error) {
            console.error("Error al crear el ticket:", error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Crear Nuevo Ticket</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="EventId">Evento</Label>
                            <Select
                                value={formData.EventId}
                                onValueChange={(value) => handleSelectChange("EventId", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue
                                        placeholder={
                                            eventos.find((e) => String(e.EventId) === String(formData.EventId))?.Title ||
                                            "Seleccionar evento"
                                        }
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    {eventos.map((evento) => (
                                        <SelectItem key={evento.EventId} value={String(evento.EventId)}>
                                            {evento.Title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="type">Tipo</Label>
                            <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="General">General</SelectItem>
                                    <SelectItem value="VIP">VIP</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Descripción</Label>
                        <Textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={3}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="price">Precio</Label>
                            <Input
                                id="price"
                                name="price"
                                value={formData.price}
                                onChange={handleInputChange}
                                type="number"
                                step="0.01"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="stockAvailable">Stock Disponible</Label>
                            <Input
                                id="stockAvailable"
                                name="stockAvailable"
                                value={formData.stockAvailable}
                                onChange={handleInputChange}
                                type="number"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit">Crear Ticket</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
} 