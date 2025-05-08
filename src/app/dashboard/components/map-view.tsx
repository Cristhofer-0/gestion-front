"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert"
import { InfoIcon } from "lucide-react"
import type { ItemData } from "./data-table"

interface MapViewProps {
  item: ItemData
}

export function MapView({ item }: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Esta función se ejecutará cuando el componente se monte
    // Aquí es donde se inicializaría el mapa con la biblioteca elegida

    if (!mapContainerRef.current || !item.ubicacion) return

    // Ejemplo de comentario para integración con una biblioteca de mapas:
    // 1. Para Leaflet:
    // const map = L.map(mapContainerRef.current).setView([item.ubicacion.lat, item.ubicacion.lng], 13)
    // L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)
    // L.marker([item.ubicacion.lat, item.ubicacion.lng]).addTo(map)

    // 2. Para Google Maps:
    // const map = new google.maps.Map(mapContainerRef.current, {
    //   center: { lat: item.ubicacion.lat, lng: item.ubicacion.lng },
    //   zoom: 14,
    // })
    // new google.maps.Marker({
    //   position: { lat: item.ubicacion.lat, lng: item.ubicacion.lng },
    //   map,
    //   title: item.nombre,
    // })

    // Función de limpieza que se ejecutará cuando el componente se desmonte
    return () => {
      // Limpiar recursos del mapa si es necesario
      // map.remove() // Para Leaflet
    }
  }, [item])

  if (!item.ubicacion) {
    return (
      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>Ubicación no disponible</AlertTitle>
        <AlertDescription>Este elemento no tiene coordenadas de ubicación definidas.</AlertDescription>
      </Alert>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ubicación de {item.nombre}</CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={mapContainerRef} className="h-[400px] w-full bg-muted rounded-md flex items-center justify-center">
          <p className="text-muted-foreground">
            Aquí se mostrará el mapa con la ubicación: Lat: {item.ubicacion.lat}, Lng: {item.ubicacion.lng}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
