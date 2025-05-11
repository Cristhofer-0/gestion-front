"use client"

import type React from "react"

import { useState } from "react"
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
import { crearTicket } from "../utils/tickets"
import { ItemData } from "../components/data-table"

interface CreateTicketDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (data: TicketFormData) => void
}

export interface TicketFormData {
    eventId: string
    type: string
    price: string
    description: string
    stockAvailable: string
}

const adaptFormDataToItemData = (data: TicketFormData): ItemData => ({
    eventoId: data.eventId,
    tipo: data.type,
    precio: data.price,
    descripcion: data.description,
    stockDisponible: data.stockAvailable,
})


export function CreateTicketDialog({ open, onOpenChange, onSubmit }: CreateTicketDialogProps) {
    const [formData, setFormData] = useState<TicketFormData>({
        eventId: "",
        type: "normal",
        price: "",
        description: "",
        stockAvailable: "",
    })

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
                eventId: "",
                type: "normal",
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
                            <Label htmlFor="eventId">ID Evento</Label>
                            <Input
                                id="eventId"
                                name="eventId"
                                value={formData.eventId}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="type">Tipo</Label>
                            <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="normal">Normal</SelectItem>
                                    <SelectItem value="vip">VIP</SelectItem>
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
