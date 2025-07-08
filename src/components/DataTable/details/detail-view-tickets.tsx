import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Eye, Users, Tag, Info } from "lucide-react"
import type { ItemData } from "../data-table-tickets"

interface DetailViewProps {
  item: ItemData
}

export function DetailView({ item }: DetailViewProps) {
  // Función para formatear fechas
  /*const formatDate = (dateString?: string) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      weekday: "long",
    })
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
  }*/

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{item.tipo}</CardTitle>  
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Info className="h-4 w-4" />
            Descripción
          </h3>
          <p className="mt-1 break-words whitespace-pre-line">{item.descripcion}</p>
        </div>
      </CardContent>
       <CardContent className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Info className="h-4 w-4" />
            Precio
          </h3>
          <p className="mt-1">S/. {item.precio}</p>
        </div>
      </CardContent>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Info className="h-4 w-4" />
            Stock Disponible
          </h3>
          <p className="mt-1">{item.stockDisponible}</p>
        </div>
      </CardContent>
    </Card>
  )
}
