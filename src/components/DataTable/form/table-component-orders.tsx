"use client"

import { useState, type ReactNode } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Search, Calendar, Users, HouseIcon, TicketIcon, ListOrdered, Coins, CoinsIcon, CheckCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { OrderData } from "../data-table-orders"
import React from "react"

interface TableComponentProps {
    items?: OrderData[]
    selectedItemId?: string
    renderDetails?: (item: OrderData) => ReactNode
}

export function TableComponent({
    items = [],
    selectedItemId,
    renderDetails,
}: TableComponentProps) {
    const [searchTerm, setSearchTerm] = useState("")

    // Primero, filtrar solo órdenes pagadas
    const paidItems = items.filter((item) => item.estadoPago.toLowerCase() === "paid")

    // Filtrar los elementos según el término de búsqueda
    const filteredItems = paidItems.filter(
        (item) =>
            item.ordenFecha.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.estadoPago.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.titulo.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Función para formatear fechas
    const formatDate = (dateString?: string) => {
        if (!dateString) return "-"
        const date = new Date(dateString)
        if (isNaN(date.getTime())) return "Fecha inválida"
        return date.toLocaleString("es-PE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            timeZone: "UTC", // 👈 Esto evita que se adelante o atrase por zona
        })
    }

    // Función para obtener el color del badge de estado
    const getStatusBadgeVariant = (estadoPago?: string) => {
        if (estadoPago === "paid") return "default"
        if (estadoPago === "pending") return "secondary"
        return "outline"
    }


    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Ingrese el nombre del evento"
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-md border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="hidden md:table-cell">
                                <div className="flex items-center gap-1">
                                    <span>N° de Orden</span>
                                </div>
                            </TableHead>
                            <TableHead className="hidden md:table-cell">
                                <div className="flex items-center gap-1">
                                    <Users className="h-4 w-4" />
                                    <span>Usuario</span>
                                </div>
                            </TableHead>
                            <TableHead className="hidden lg:table-cell">
                                <div className="flex items-center gap-1">
                                    <HouseIcon className="h-4 w-4" />
                                    <span>Evento</span>
                                </div>
                            </TableHead>
                            <TableHead className="hidden sm:table-cell">
                                <div className="flex items-center gap-1">
                                    <TicketIcon className="h-4 w-4" />
                                    <span>Tipo de entrada</span>
                                </div>
                            </TableHead>
                            <TableHead className="hidden sm:table-cell">
                                <div className="flex items-center gap-1">
                                    <ListOrdered className="h-4 w-4" />
                                    <span>Cantidad</span>
                                </div>
                            </TableHead>
                            <TableHead className="hidden sm:table-cell">
                                <div className="flex items-center gap-1">
                                    <CoinsIcon className="h-4 w-4" />
                                    <span>Precio total</span>
                                </div>
                            </TableHead>
                            <TableHead className="hidden sm:table-cell">
                                <div className="flex items-center gap-1">
                                    <CheckCircle className="h-4 w-4" />
                                    <span>Estado de pago</span>
                                </div>
                            </TableHead>
                            <TableHead className="hidden sm:table-cell">
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>Fecha de compra</span>
                                </div>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredItems.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="h-24 text-center">
                                    No se encontraron resultados.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredItems.map((item) => (
                                <React.Fragment key={item.id}>
                                    <TableRow className={selectedItemId === item.id ? "bg-muted/50 border-b-0" : ""}>
                                        <TableCell className="hidden md:table-cell">{item.id}</TableCell>
                                        <TableCell className="hidden md:table-cell">{item.fullname}</TableCell>
                                        <TableCell className="hidden md:table-cell">{item.titulo}</TableCell>
                                        <TableCell className="hidden md:table-cell">{item.tipo}</TableCell>
                                        <TableCell className="hidden sm:table-cell">{item.cantidad}</TableCell>
                                        <TableCell className="hidden sm:table-cell">
                                            {new Intl.NumberFormat("es-ES", {
                                                style: "currency",
                                                currency: "EUR",
                                            }).format(item.totalPrecio)}
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell">
                                            <Badge variant={getStatusBadgeVariant(item.estadoPago)} className="capitalize">
                                                {item.estadoPago}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell">{formatDate(item.ordenFecha)}</TableCell>
                                    </TableRow>

                                    {selectedItemId === item.id && renderDetails && (
                                        <TableRow className="bg-muted/30">
                                            <TableCell colSpan={9} className="p-0 border-t-0">
                                                <div className="animate-in fade-in-0 zoom-in-95 duration-200">{renderDetails(item)}</div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </React.Fragment>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
