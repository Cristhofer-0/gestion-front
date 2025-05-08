"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Calendar, MapPin, Eye, Users, Tag, FileText, PlusCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { CreateEventDialog, type EventFormData } from "./create-event-dialog"

export interface ItemData {
  id: string
  nombre: string
  fechaInicio?: string
  fechaFinalizacion?: string
  direccion?: string
  visibilidad?: string
  categorias?: string[]
  capacidad?: number
  estado?: string
  categoria: string
}

interface TableComponentProps {
  items?: ItemData[]
  onItemClick: (item: ItemData) => void
  onCreateEvent?: (data: EventFormData) => void
}

export function TableComponent({ items = [], onItemClick, onCreateEvent }: TableComponentProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Filtrar los elementos según el término de búsqueda
  const filteredItems = items.filter(
    (item) =>
      item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.direccion && item.direccion.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.categorias && item.categorias.some((cat) => cat.toLowerCase().includes(searchTerm.toLowerCase()))),
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

  const handleCreateEvent = (data: EventFormData) => {
    if (onCreateEvent) {
      onCreateEvent(data)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por nombre, categoría, dirección..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Crear Evento</span>
        </Button>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead className="hidden md:table-cell">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Inicio</span>
                </div>
              </TableHead>
              <TableHead className="hidden md:table-cell">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Fin</span>
                </div>
              </TableHead>
              <TableHead className="hidden lg:table-cell">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>Dirección</span>
                </div>
              </TableHead>
              <TableHead className="hidden sm:table-cell">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>Visibilidad</span>
                </div>
              </TableHead>
              <TableHead className="hidden xl:table-cell">
                <div className="flex items-center gap-1">
                  <Tag className="h-4 w-4" />
                  <span>Categorías</span>
                </div>
              </TableHead>
              <TableHead className="hidden lg:table-cell">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>Capacidad</span>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  <span>Estado</span>
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
                <TableRow key={item.id}>
                  <TableCell
                    className="font-medium cursor-pointer hover:text-blue-600 hover:underline"
                    onClick={() => onItemClick(item)}
                  >
                    {item.nombre}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{formatDate(item.fechaInicio)}</TableCell>
                  <TableCell className="hidden md:table-cell">{formatDate(item.fechaFinalizacion)}</TableCell>
                  <TableCell className="hidden lg:table-cell max-w-[200px] truncate" title={item.direccion}>
                    {item.direccion || "-"}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {item.visibilidad ? (
                      <Badge variant={getVisibilityBadgeVariant(item.visibilidad) as any}>{item.visibilidad}</Badge>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="hidden xl:table-cell">
                    {item.categorias && item.categorias.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {item.categorias.slice(0, 2).map((cat, index) => (
                          <Badge key={index} variant="outline" className="whitespace-nowrap">
                            {cat}
                          </Badge>
                        ))}
                        {item.categorias.length > 2 && <Badge variant="outline">+{item.categorias.length - 2}</Badge>}
                      </div>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {item.capacidad !== undefined ? item.capacidad : "-"}
                  </TableCell>
                  <TableCell>
                    {item.estado ? (
                      <Badge variant={getStatusBadgeVariant(item.estado) as any}>{item.estado}</Badge>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => onItemClick(item)}>
                      Ver detalles
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CreateEventDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} onSubmit={handleCreateEvent} />
    </div>
  )
}
