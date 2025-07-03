"use client"

import { useState, type ReactNode } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Calendar, MapPin, Eye, Users, Tag, FileText, PlusCircle, ChevronDown, ChevronUp, Currency, Pen } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { CreateTicketDialog, type TicketFormData } from "./create-ticket-dialog"
import type { ItemData } from "../data-table-tickets"
import { EditTicketDialog } from "./edit-ticket-dialog"
import React from "react"
import { EditTicketFormData } from "@/components/tickets/types"

interface TableComponentProps {
  items?: ItemData[]
  onItemClick: (item: ItemData) => void
  onCreateTicket?: (data: TicketFormData) => void
   onEditTicket?: (data: EditTicketFormData & { id: string, titulo: string }) => void
  selectedItemId?: string
  renderDetails?: (item: ItemData) => ReactNode
}

export function TableComponent({
  items = [],
  onItemClick,
  onCreateTicket,
  onEditTicket,
  selectedItemId,
  renderDetails,
}: TableComponentProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [ticketToEdit, setTicketToEdit] = useState<ItemData | null>(null)
  const [editOpen, setEditOpen] = useState(false)

  // Filtrar los elementos según el término de búsqueda
  const filteredItems = items.filter(
    (item) =>
      item.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.titulo.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Función para formatear fechas
  const formatDate = (dateString?: string) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })
  }

  // Función para obtener el color del badge de estado
  const getStatusBadgeVariant = (estado?: string) => {
    if (estado === "published") return "success"
    if (estado === "draft") return "secondary"
    return "outline"
  }

  // Función para obtener el color del badge de visibilidad
  const getVisibilityBadgeVariant = (visibilidad?: string) => {
    if (visibilidad === "público") return "default"
    if (visibilidad === "privado") return "destructive"
    if (visibilidad === "solo invitación") return "warning"
    return "outline"
  }

  const handleCreateTicket = (data: TicketFormData) => {
    if (onCreateTicket) {
      onCreateTicket(data)
      setIsDialogOpen(false)
    }
  }

  const handleEditTicket = (data: EditTicketFormData) => {
    if (onEditTicket && ticketToEdit) {
      onEditTicket({ ...data, id: ticketToEdit.id ?? "", titulo: ticketToEdit.titulo ?? "" })
      setEditOpen(false) // cerrar modal después de editar
    }
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
        <Button onClick={() => setIsDialogOpen(true)} className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Crear Ticket</span>
        </Button>
      </div>

      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo de entrada</TableHead>
              <TableHead className="hidden md:table-cell">
                <div className="flex items-center gap-1">
                  <Currency className="h-4 w-4" />
                  <span>Evento</span>
                </div>
              </TableHead>
              <TableHead className="hidden md:table-cell">
                <div className="flex items-center gap-1">
                  <Currency className="h-4 w-4" />
                  <span>Precio</span>
                </div>
              </TableHead>
              <TableHead className="hidden lg:table-cell">
                <div className="flex items-center gap-1">
                  <Pen className="h-4 w-4" />
                  <span>Descripcion</span>
                </div>
              </TableHead>
              <TableHead className="hidden sm:table-cell">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>Stock Disponible</span>
                </div>
              </TableHead>
              <TableHead className="text-right">Acciones</TableHead>
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
                  <TableRow key={item.id} className={selectedItemId === item.id ? "bg-muted/50 border-b-0" : ""}>
                    <TableCell
                      className={`font-medium cursor-pointer hover:text-blue-600 hover:underline ${selectedItemId === item.id ? "text-blue-600" : ""
                        }`}
                      onClick={() => onItemClick(item)}
                    >
                      <div className="flex items-center gap-2">
                        {selectedItemId === item.id ? (
                          <ChevronUp className="h-4 w-4 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="h-4 w-4 flex-shrink-0" />
                        )}
                        {item.tipo}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{(item.titulo)}</TableCell>
                    <TableCell className="hidden md:table-cell">{(item.precio)}</TableCell>
                    <TableCell className="hidden md:table-cell">{(item.descripcion)}</TableCell>
                    <TableCell className="hidden sm:table-cell">{(item.stockDisponible)}</TableCell>
                    <TableCell className="text-right">
                      <Button onClick={() => {
                        setTicketToEdit(item) // Este `item` debería venir directo desde la API
                        setEditOpen(true)
                      }}>
                        Editar
                      </Button>
                      {ticketToEdit && (
                        <EditTicketDialog
                          open={editOpen}
                          onOpenChange={setEditOpen}
                          ticket={ticketToEdit}
                          onSubmit={handleEditTicket}
                        />
                      )}
                    </TableCell>
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

      <CreateTicketDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} onSubmit={handleCreateTicket} />
    </div>
  )
}
