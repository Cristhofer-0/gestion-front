"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TableComponent } from "../DataTable/form/table-component-tickets"
import { DetailView } from "../DataTable/details/detail-view-tickets"
import { Button } from "@/components/ui/button"
import { ReloadIcon } from "../ui/iconos"
import { crearTicket, fetchTickets, fetchTicketsByOrganizador } from "../../services/tickets"
import { useUser } from "@/hooks/useUser"
import { TicketFormData } from "./form/create-ticket-dialog"
import { adaptFormDataToItemData } from "./form/create-ticket-dialog"
import { EditTicketFormData } from "../tickets/types"
import { adaptEditFormDataToItemData } from "../DataTable/form/edit-ticket-dialog"

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

  // Se muestran los 10 tickets según la página en la que se esté
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
        // Si es organizador, solo sus tickets
        data = await fetchTicketsByOrganizador(user.UserId.toString())
      } else {
        // Si no es organizador (puede ser admin u otro rol), traer todos los tickets
        data = await fetchTickets()
      }
      setItems(data)
      setCurrentPage(1) 
    } catch (error) {
      console.error("Error al cargar los datos:", error)
    } finally {
      setIsLoading(false)
    }
  }

    // Cargar los datos al montar el componente
  useEffect(() => {
  if (user) {
    fetchData()
  }
}, [user])


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

const handleCreateTicket = async () => {
  // Solo refresca los datos, no crea nada aquí
  const actualizados = user?.Role === "organizer"
    ? await fetchTicketsByOrganizador(user.UserId.toString())
    : await fetchTickets()

  setItems(actualizados)
}

const handleEditTicket = async (updatedTicket: EditTicketFormData & { id: string, titulo: string }) => {
  try {
    const updatedItem = adaptEditFormDataToItemData(updatedTicket)

    const actualizados = user?.Role === "organizer"
      ? await fetchTicketsByOrganizador(user.UserId.toString())
      : await fetchTickets()

    setItems(actualizados)
    setSelectedItem(null)

    console.log("Ticketo editado:", updatedItem)
  } catch (error) {
    console.error("Error al editar el Ticketo:", error)
  }
}


  return (
    <div className="container mx-auto py-6">
      <Card className="w-full mb-6">
        <CardHeader>
          <CardTitle>Gestión de Tickets</CardTitle>
          <CardDescription>Visualiza y gestiona todos los tickets disponibles</CardDescription>
          {/*<div className="flex gap-2">
            <Button onClick={fetchData} disabled={isLoading}>
              {isLoading && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
              Cargar datos de la API
            </Button>
          </div>*/}
        </CardHeader>
        <CardContent>
          <TableComponent
            items={currentItems}
            onItemClick={handleItemClick}
            onCreateTicket={handleCreateTicket}
            onEditTicket={handleEditTicket}
            selectedItemId={selectedItem?.id}
            //onCreateEvent={handleCreateEvent}
            renderDetails={(item) => (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-muted/30 rounded-lg">
                <DetailView item={item} />
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
