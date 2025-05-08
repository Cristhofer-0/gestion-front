import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Eye, Users, Tag, Info } from "lucide-react"
import type { ItemData } from "./data-table"

interface DetailViewProps {
  item: ItemData
}

export function DetailView({ item }: DetailViewProps) {
  // Función para formatear fechas
  const formatDate = (dateString?: string) => {
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
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{item.titulo}</CardTitle>
          <Badge variant={getStatusBadgeVariant(item.estado) as any}>{item.estado || "Sin estado"}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Info className="h-4 w-4" />
            Descripción
          </h3>
          <p className="mt-1">{item.descripcion}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Fecha de Inicio
            </h3>
            <p className="mt-1">{formatDate(item.fechaInicio)}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Fecha de Finalización
            </h3>
            <p className="mt-1">{formatDate(item.fechaFinalizacion)}</p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Dirección
          </h3>
          <p className="mt-1">{item.direccion || "No disponible"}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Visibilidad
            </h3>
            <div className="mt-1">
              {item.visibilidad ? (
                <Badge variant={getVisibilityBadgeVariant(item.visibilidad) as any}>{item.visibilidad}</Badge>
              ) : (
                "No especificada"
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Capacidad
            </h3>
            <p className="mt-1">{item.capacidad !== undefined ? `${item.capacidad} personas` : "No especificada"}</p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Categorías
          </h3>
          <div className="mt-1 flex flex-wrap gap-1">
            {item.categorias && item.categorias.length > 0 ? (
              item.categorias.map((cat, index) => (
                <Badge key={index} variant="outline">
                  {cat}
                </Badge>
              ))
            ) : (
              <span>Sin categorías</span>
            )}
          </div>
        </div>

        {item.ubicacion && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Coordenadas
            </h3>
            <p className="mt-1">Latitud: {item.ubicacion.lat}</p>
            <p>Longitud: {item.ubicacion.lng}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
