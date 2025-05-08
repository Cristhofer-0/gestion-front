"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TableComponent } from "../components/table-component"
import { DetailView } from "../components/detail-view"
import { MapView } from "../components/map-view"
import { Button } from "@/components/ui/button"
import { ReloadIcon } from "./ui/iconos"
import { fetchEventos } from "../utils/eventos"

// Tipo para los datos que vendrán de la API
export type ItemData = {
	id: string
	nombre: string
	descripcion: string
	categoria: string
	fechaInicio?: string
	fechaFinalizacion?: string
	direccion?: string
	visibilidad?: "público" | "privado" | "solo invitación"
	categorias?: string[]
	capacidad?: number
	estado?: "published" | "draft"
	ubicacion?: {
		lat: number
		lng: number
	}
	// Otros campos que puedan venir de la API
}

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
		setSelectedItem(item)
	}

	// Para simular datos mientras se desarrolla
	const loadMockData = () => {
		const mockData: ItemData[] = [
			{
				id: "1",
				nombre: "Sede Principal",
				descripcion: "Oficina central de la empresa",
				categoria: "Oficina",
				fechaInicio: "2023-05-15",
				fechaFinalizacion: "2024-05-14",
				direccion: "Calle Gran Vía 28, Madrid",
				visibilidad: "público",
				categorias: ["Administración", "Ventas"],
				capacidad: 150,
				estado: "published",
				ubicacion: { lat: 40.416775, lng: -3.70379 },
			},
			{
				id: "2",
				nombre: "Almacén Norte",
				descripcion: "Almacén de productos zona norte",
				categoria: "Almacén",
				fechaInicio: "2023-07-01",
				fechaFinalizacion: "2024-06-30",
				direccion: "Polígono Industrial Norte, Nave 15, Barcelona",
				visibilidad: "privado",
				categorias: ["Logística", "Almacenaje"],
				capacidad: 500,
				estado: "published",
				ubicacion: { lat: 41.385064, lng: -2.173403 },
			},
			{
				id: "3",
				nombre: "Tienda Centro",
				descripcion: "Tienda ubicada en el centro comercial",
				categoria: "Tienda",
				fechaInicio: "2023-03-10",
				fechaFinalizacion: "2024-03-09",
				direccion: "Centro Comercial El Sol, Local 45, Valencia",
				visibilidad: "público",
				categorias: ["Retail", "Ventas"],
				capacidad: 80,
				estado: "published",
				ubicacion: { lat: 39.469907, lng: -0.376288 },
			},
			{
				id: "4",
				nombre: "Sucursal Sur",
				descripcion: "Sucursal de atención al cliente",
				categoria: "Oficina",
				fechaInicio: "2023-09-01",
				fechaFinalizacion: "2024-08-31",
				direccion: "Avenida de la Constitución 12, Sevilla",
				visibilidad: "solo invitación",
				categorias: ["Atención al Cliente", "Administración"],
				capacidad: 45,
				estado: "draft",
				ubicacion: { lat: 37.389092, lng: -5.984459 },
			},
			{
				id: "5",
				nombre: "Centro Logístico",
				descripcion: "Centro de distribución principal",
				categoria: "Logística",
				fechaInicio: "2023-01-15",
				fechaFinalizacion: "2024-01-14",
				direccion: "Polígono Industrial Artea, Nave 7, Bilbao",
				visibilidad: "privado",
				categorias: ["Logística", "Distribución", "Almacenaje"],
				capacidad: 1200,
				estado: "published",
				ubicacion: { lat: 43.263013, lng: -2.934985 },
			},
		]
		setItems(mockData)
	}

	return (
		<div className="container mx-auto py-6">
			<Card className="w-full mb-6">
				<CardHeader>
					<CardTitle>Gestión de Eventos</CardTitle>
					<CardDescription>Visualiza y gestiona todas las ubicaciones disponibles</CardDescription>
					<div className="flex gap-2">
						<Button onClick={fetchData} disabled={isLoading}>
							{isLoading && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
							Cargar datos de API
						</Button>
						<Button variant="outline" onClick={loadMockData}>
							Cargar datos de prueba
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<TableComponent items={items} onItemClick={handleItemClick} />
				</CardContent>
			</Card>

			{selectedItem && (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<DetailView item={selectedItem} />
					<MapView item={selectedItem} />
				</div>
			)}
		</div>
	)
}