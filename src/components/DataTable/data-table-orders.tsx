"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TableComponent } from "../DataTable/form/table-component-orders"
import { ReloadIcon } from "../ui/iconos"
import { fetchOrders } from "../../services/orders"
import { useUser } from "@/hooks/useUser"
import { OrderData } from "./types/OrderData"


export function OrderTable() {
    const [items, setItems] = useState<OrderData[]>([])
    const [selectedItem, setSelectedItem] = useState<OrderData | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const user = useUser();

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
            let data: OrderData[] = []

            if (user?.Role === "helper") {
                // Si es helper, solo sus órdenes
                data = await fetchOrders()
            } else {
                // Otros roles (como admin), todas las órdenes
                data = await fetchOrders()
            }

            setItems(data)
        } catch (error) {
            console.error("Error al cargar los datos:", error)
        } finally {
            setIsLoading(false)
        }
    }

       // Cargar los datos al montar el componente
        useEffect(() => {
        fetchData()
      }, [])

    // Función para manejar el clic en un elemento de la tabla
    const handleItemClick = (item: OrderData) => {
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
                    <CardTitle>Gestión de Ordenes</CardTitle>
                    <CardDescription>Visualiza y gestiona todos las ordenes disponibles</CardDescription>
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
                        selectedItemId={selectedItem?.id}
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
export type { OrderData }

