"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TableComponent } from "../DataTable/form/table-component-tickets"
import { DetailView } from "../DataTable/details/detail-view-tickets"
import { Button } from "@/components/ui/button"
import { ReloadIcon } from "../ui/iconos"
import { fetchTickets, fetchTicketsByOrganizador } from "../../services/tickets"
import { useUser } from "@/hooks/useUser"

export type ItemData = {
  id?: string
  eventoId: string
  tipo: "General" | "VIP"
  titulo: string
  precio: number
  descripcion: string
  stockDisponible: number
}

export function DataTable() {
  const [items, setItems] = useState<ItemData[]>([])
  const [selectedItem, setSelectedItem] = useState<ItemData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const user = useUser();

  // Función para cargar datos de la API
  const fetchData = async () => {
    setIsLoading(true)
    try {
      let data: ItemData[] = []

      if (user?.Role === "organizer") {
        // Si es organizador, solo sus tickets
        data = await fetchTicketsByOrganizador(user.UserId.toString())
      } else {
        // Si no es organizador (puede ser admin u otro rol), traer todos los tickets
        data = await fetchTickets()
      }

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
          <CardTitle>Gestión de Tickets</CardTitle>
          <CardDescription>Visualiza y gestiona todos los tickets disponibles</CardDescription>
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
              </div>
            )}
          />
        </CardContent>
      </Card>
    </div>
  )
}
