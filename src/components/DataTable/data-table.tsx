"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import { TableComponent } from "./form/table-component"
import { DetailView } from "./details/detail-view"
import { MapView } from "./details/map-view"

import { ReloadIcon } from "../custom/iconos"
import { fetchEventos } from "../../services/eventos"

import { ItemData } from "./types/ItemData"


export function DataTable() {
  const [items, setItems] = useState<ItemData[]>([])
  const [selectedItem, setSelectedItem] = useState<ItemData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Función para cargar datos de la API
  const fetchData = async () => {
    setIsLoading(true)
    try {
      // Aquí se reemplazaría con la llamada real a la API
      const data = await fetchEventos()
      setItems(data)
    } catch (error) {
      console.error("Error al cargar los datos:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Función para manejar el clic en un elemento de la tabla
  const handleItemClick = (item: ItemData) => {
    // Si el elemento clickeado es el mismo que ya está seleccionado, lo deseleccionamos
    if (selectedItem && selectedItem.id === item.id) {
      setSelectedItem(null)
    } else {
      // Si es un elemento diferente, lo seleccionamos
      setSelectedItem(item)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <Card className="w-full mb-6">
        <CardHeader>
          <CardTitle>Gestión de Eventos</CardTitle>
          <CardDescription>Visualiza y gestiona todos los eventos disponibles</CardDescription>
          <div className="flex gap-2">
            <Button onClick={fetchData} disabled={isLoading}>
              {isLoading && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
              Cargar datos de la API
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <TableComponent
            items={items}
            onItemClick={handleItemClick}
            selectedItemId={selectedItem?.id}
            //onCreateEvent={handleCreateEvent}
            renderDetails={(item) => (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-muted/30 rounded-lg">
                <DetailView item={item} />
                <MapView item={item} />
              </div>
            )}
          />
        </CardContent>
      </Card>
    </div>
  )
}
