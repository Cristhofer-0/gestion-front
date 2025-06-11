"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import { TableComponent } from "./form/table-component"
import { DetailView } from "./details/detail-view"
import { MapView } from "./details/map-view"
import { ReloadIcon } from "../custom/iconos"
import { fetchEventos, fetchEventosByOrganizador } from "../../services/eventos"
import { useUser } from "@/hooks/useUser"  // IMPORTANTE
import { ItemData } from "./types/ItemData"


export function DataTable() {
  const user = useUser();  // OBTENEMOS EL USUARIO
  const [items, setItems] = useState<ItemData[]>([])
  const [selectedItem, setSelectedItem] = useState<ItemData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Se muestran los 10 eventos según la página en la que se esté
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = items.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(items.length / itemsPerPage)


  // Función para cargar datos de la API
  const fetchData = async () => {
    setIsLoading(true)
    try {
      let data: ItemData[] = []
      if (user?.Role === "organizer") {
        // Si es organizador, filtrar por su ID
        data = await fetchEventosByOrganizador(user.UserId.toString())
      } else {
        // Si no, obtener todos los eventos
        data = await fetchEventos()
      }
      setItems(data)
      setCurrentPage(1)  
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
            items={currentItems}
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
          {items.length > 0 && (
            <div className="flex justify-center mt-6 gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                {"<<"}
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                <Button
                  key={pageNumber}
                  variant={pageNumber === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNumber)}
                >
                  {pageNumber}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                {">>"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

